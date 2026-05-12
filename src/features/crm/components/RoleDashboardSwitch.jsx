import AdminDashboard from "../roles/AdminDashboard";
import AgentDashboard from "../roles/AgentDashboard";
import ClientViewerDashboard from "../roles/ClientViewerDashboard";
import HRManagerDashboard from "../roles/HRManagerDashboard";
import TeamLeadDashboard from "../roles/TeamLeadDashboard";
import AssignedDashboardWorkspace from "./dashboard/AssignedDashboardWorkspace";
import { normalizeRole } from "./sales/salesFormUtils";

const ROLE_COMPONENTS = {
  admin: AdminDashboard,
  team_lead: TeamLeadDashboard,
  agent: AgentDashboard,
  hr_manager: HRManagerDashboard,
  client: ClientViewerDashboard,
};

function RoleDashboardSwitch({ role, session, activeNavLabel, activeNavItem }) {
  const normalizedRole = normalizeRole(role);
  if (activeNavItem?.kind === "assigned_dashboard") {
    return (
      <AssignedDashboardWorkspace
        session={session}
        dashboard={activeNavItem.dashboard}
        role={normalizedRole}
      />
    );
  }
  const RoleComponent = ROLE_COMPONENTS[normalizedRole] || ClientViewerDashboard;
  return <RoleComponent session={session} activeNavLabel={activeNavLabel} />;
}

export default RoleDashboardSwitch;