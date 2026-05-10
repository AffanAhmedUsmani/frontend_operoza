import AdminDashboard from "../roles/AdminDashboard";
import AgentDashboard from "../roles/AgentDashboard";
import ClientViewerDashboard from "../roles/ClientViewerDashboard";
import HRManagerDashboard from "../roles/HRManagerDashboard";
import TeamLeadDashboard from "../roles/TeamLeadDashboard";
import { normalizeRole } from "./sales/salesFormUtils";

const ROLE_COMPONENTS = {
  admin: AdminDashboard,
  team_lead: TeamLeadDashboard,
  agent: AgentDashboard,
  hr_manager: HRManagerDashboard,
  client: ClientViewerDashboard,
};

function RoleDashboardSwitch({ role, session, activeNavLabel }) {
  const normalizedRole = normalizeRole(role);
  const RoleComponent = ROLE_COMPONENTS[normalizedRole] || ClientViewerDashboard;
  return <RoleComponent session={session} activeNavLabel={activeNavLabel} />;
}

export default RoleDashboardSwitch;