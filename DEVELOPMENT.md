# Stayhaven Development

This project runs as four local application processes plus two infrastructure
containers:

- `api-gateway`: Spring Boot API gateway and core API, default local port `8080`
- `payment-service`: Spring Boot payment worker/API, local port `8081`
- `notification-service`: Spring Boot notification worker/API, local port `8082`
- `frontend`: Next.js app, local port `3000`
- Postgres: Docker container, local port `5432`
- RabbitMQ: Docker container, AMQP port `5672`, management UI port `15672`

## Prerequisites

- Docker Desktop, or another Docker runtime with Compose support
- Java 21
- Node.js 22 and npm

The Spring services include Maven wrappers, so a separate Maven installation is
not required.

## Start Infrastructure

From the repository root:

```powershell
docker compose up -d
```

This starts:

- Postgres at `localhost:5432`
  - database: `stayhaven`
  - username: `stayhaven`
  - password: `stayhaven`
- RabbitMQ at `localhost:5672`
  - username: `stayhaven`
  - password: `stayhaven`
- RabbitMQ management UI at `http://localhost:15672`

To stop the containers:

```powershell
docker compose down
```

To stop the containers and delete their persisted volumes:

```powershell
docker compose down -v
```

## Start Backend Services

Run each Spring service in its own terminal. Use the `local` profile so each
service gets its development port. Without the local profile, the services
default to port `8080`.

### API Gateway

```powershell
cd api-gateway
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

The API gateway starts at `http://localhost:8080`.

It connects to Postgres at `localhost:5432` and runs Flyway migrations on
startup. It also forwards:

- `/api/payments/**` to `http://localhost:8081`
- `/api/notifications/**` to `http://localhost:8082`

### Payment Service

```powershell
cd services\payment-service
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

The payment service starts at `http://localhost:8081`.

It connects to:

- Postgres at `localhost:5432`
- RabbitMQ at `localhost:5672`

### Notification Service

```powershell
cd services\notification-service
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

The notification service starts at `http://localhost:8082`.

It connects to RabbitMQ at `localhost:5672`.

## Start Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:3000`.

By default it calls the API gateway at `http://localhost:8080`. To override that
base URL, set `NEXT_PUBLIC_API_BASE_URL` before starting the dev server:

```powershell
$env:NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080"
npm run dev
```

## Useful Development URLs

- Frontend: `http://localhost:3000`
- API gateway: `http://localhost:8080`
- API gateway health: `http://localhost:8080/actuator/health`
- Payment service: `http://localhost:8081`
- Payment service health: `http://localhost:8081/actuator/health`
- Notification service: `http://localhost:8082`
- Notification service health: `http://localhost:8082/actuator/health`
- RabbitMQ management UI: `http://localhost:15672`

## Quick Start Checklist

From the repository root:

```powershell
docker compose up -d
```

Then open four terminals:

```powershell
cd api-gateway
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

```powershell
cd services\payment-service
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

```powershell
cd services\notification-service
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build and Test Commands

Backend service tests:

```powershell
cd api-gateway
.\mvnw.cmd test
```

```powershell
cd services\payment-service
.\mvnw.cmd test
```

```powershell
cd services\notification-service
.\mvnw.cmd test
```

Frontend checks:

```powershell
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Notes

- The root `docker-compose.yml` currently starts infrastructure only. The
  application services are intended to be run directly during development.
- The Spring Dockerfiles expose container port `8080`. If you later add the
  application services to Compose, map each service to a different host port or
  set `SERVER_PORT` per container.
- The database state is persisted in the `postgres-data` Docker volume. Use
  `docker compose down -v` only when you intentionally want a clean database.
