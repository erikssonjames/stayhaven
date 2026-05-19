#!/usr/bin/env bash
set -euo pipefail

APP_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
K3S_REPO="${K3S_REPO:-/home/james/k3s}"
MANIFEST_DIR="${MANIFEST_DIR:-$K3S_REPO/apps/stayhaven}"
DEPLOYMENTS_FILE="$MANIFEST_DIR/deployments.yaml"
GHCR_USER="${GHCR_USER:-erikssonjames}"
GIT_SHA="$(git -C "$APP_REPO" rev-parse --short HEAD)"
TAG="${STAYHAVEN_IMAGE_TAG:-$GIT_SHA}"
API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-}"
APPLY=true
VERIFY=true
BUILD=true

components=(frontend api-gateway)

usage() {
  cat <<'USAGE'
Usage:
  scripts/deploy-k3s.sh [options]

Options:
  --all                 Build/update frontend, api-gateway, payment-service, and notification-service.
  --component NAME      Build/update one component. Can be repeated.
                        Valid: frontend, api-gateway, payment-service, notification-service.
  --tag TAG             Image tag to build, push, and write to manifests. Defaults to current git short SHA.
  --ghcr-user USER      GHCR owner/user. Defaults to erikssonjames.
  --k3s-repo PATH       k3s repo path. Defaults to /home/james/k3s.
  --no-build            Do not build or push images; only update/apply manifests for the tag.
  --no-apply            Build/push/update manifests, but do not kubectl apply.
  --no-verify           Skip rollout and HTTP checks.
  -h, --help            Show this help.

Environment:
  STAYHAVEN_IMAGE_TAG, GHCR_USER, K3S_REPO, MANIFEST_DIR, NEXT_PUBLIC_API_BASE_URL

Examples:
  scripts/deploy-k3s.sh
  scripts/deploy-k3s.sh --no-build
  scripts/deploy-k3s.sh --all
  scripts/deploy-k3s.sh --component frontend --tag manual-test
USAGE
}

set_components_all() {
  components=(frontend api-gateway payment-service notification-service)
}

validate_component() {
  case "$1" in
    frontend|api-gateway|payment-service|notification-service) ;;
    *)
      echo "Unknown component: $1" >&2
      exit 2
      ;;
  esac
}

custom_components=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)
      set_components_all
      custom_components=true
      shift
      ;;
    --component)
      [[ $# -ge 2 ]] || { echo "--component requires a value" >&2; exit 2; }
      validate_component "$2"
      if [[ "$custom_components" == false ]]; then
        components=()
        custom_components=true
      fi
      components+=("$2")
      shift 2
      ;;
    --tag)
      [[ $# -ge 2 ]] || { echo "--tag requires a value" >&2; exit 2; }
      TAG="$2"
      shift 2
      ;;
    --ghcr-user)
      [[ $# -ge 2 ]] || { echo "--ghcr-user requires a value" >&2; exit 2; }
      GHCR_USER="$2"
      shift 2
      ;;
    --k3s-repo)
      [[ $# -ge 2 ]] || { echo "--k3s-repo requires a value" >&2; exit 2; }
      K3S_REPO="$2"
      MANIFEST_DIR="$K3S_REPO/apps/stayhaven"
      DEPLOYMENTS_FILE="$MANIFEST_DIR/deployments.yaml"
      shift 2
      ;;
    --no-apply)
      APPLY=false
      shift
      ;;
    --no-build)
      BUILD=false
      shift
      ;;
    --no-verify)
      VERIFY=false
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ! -f "$DEPLOYMENTS_FILE" ]]; then
  echo "Missing deployments file: $DEPLOYMENTS_FILE" >&2
  exit 1
fi

build_component() {
  case "$1" in
    frontend)
      docker build --build-arg "NEXT_PUBLIC_API_BASE_URL=$API_BASE_URL" \
        -t "ghcr.io/$GHCR_USER/stayhaven-frontend:$TAG" \
        -f "$APP_REPO/frontend/Dockerfile" "$APP_REPO/frontend"
      docker push "ghcr.io/$GHCR_USER/stayhaven-frontend:$TAG"
      ;;
    api-gateway)
      docker build \
        -t "ghcr.io/$GHCR_USER/stayhaven-api-gateway:$TAG" \
        -f "$APP_REPO/api-gateway/Dockerfile" "$APP_REPO/api-gateway"
      docker push "ghcr.io/$GHCR_USER/stayhaven-api-gateway:$TAG"
      ;;
    payment-service)
      docker build \
        -t "ghcr.io/$GHCR_USER/stayhaven-payment-service:$TAG" \
        -f "$APP_REPO/services/payment-service/Dockerfile" "$APP_REPO/services/payment-service"
      docker push "ghcr.io/$GHCR_USER/stayhaven-payment-service:$TAG"
      ;;
    notification-service)
      docker build \
        -t "ghcr.io/$GHCR_USER/stayhaven-notification-service:$TAG" \
        -f "$APP_REPO/services/notification-service/Dockerfile" "$APP_REPO/services/notification-service"
      docker push "ghcr.io/$GHCR_USER/stayhaven-notification-service:$TAG"
      ;;
  esac
}

update_manifest_tag() {
  local component="$1"
  local image="ghcr.io/$GHCR_USER/stayhaven-$component"

  if grep -q "image: $image:" "$DEPLOYMENTS_FILE"; then
    sed -i -E "s#(image: $image:).*#\\1$TAG#" "$DEPLOYMENTS_FILE"
  else
    echo "Warning: no image line found for $image in $DEPLOYMENTS_FILE" >&2
  fi
}

echo "Deploying Stayhaven tag: $TAG"
echo "Current git SHA: $GIT_SHA"
if [[ "$TAG" != "$GIT_SHA" ]]; then
  echo "Warning: deploying tag '$TAG' instead of current git SHA '$GIT_SHA'."
fi
echo "Components: ${components[*]}"
echo "Manifests: $MANIFEST_DIR"

for component in "${components[@]}"; do
  echo
  if [[ "$BUILD" == true ]]; then
    echo "Building and pushing $component"
    build_component "$component"
  else
    echo "Skipping build/push for $component"
  fi
  update_manifest_tag "$component"
done

echo
echo "Updated image references:"
grep -n "image: ghcr.io/$GHCR_USER/stayhaven-" "$DEPLOYMENTS_FILE" || true

if [[ "$APPLY" == true ]]; then
  echo
  echo "Applying Kubernetes manifests"
  kubectl apply -k "$MANIFEST_DIR"
fi

if [[ "$APPLY" == true && "$VERIFY" == true ]]; then
  echo
  echo "Waiting for rollouts"
  for component in "${components[@]}"; do
    case "$component" in
      frontend|api-gateway|payment-service|notification-service)
        if kubectl -n stayhaven get deploy "stayhaven-$component" >/dev/null 2>&1; then
          kubectl -n stayhaven rollout status "deploy/stayhaven-$component" --timeout=180s
        fi
        ;;
    esac
  done

  echo
  echo "Checking endpoints"
  kubectl -n stayhaven get pods,svc,endpoints

  echo
  echo "Checking public frontend"
  curl -I https://stayhaven.jameseriksson.com
fi
