import { RoleDashboard } from "@/app/dashboard/role-dashboard"

export default function SuperadminDashboardPage() {
  return <RoleDashboard expectedRole="SUPERADMIN" />
}
