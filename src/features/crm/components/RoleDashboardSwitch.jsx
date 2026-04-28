import AdminDashboard from "../roles/AdminDashboard";
import AgentLegacyDashboard from "../roles/AgentLegacyDashboard";
import ClientViewerDashboard from "../roles/ClientViewerDashboard";
import CloserDashboard from "../roles/CloserDashboard";
import FinanceManagerDashboard from "../roles/FinanceManagerDashboard";
import HRManagerDashboard from "../roles/HRManagerDashboard";
import InboundAgentDashboard from "../roles/InboundAgentDashboard";
import LicensedAgentDashboard from "../roles/LicensedAgentDashboard";
import ManagerLegacyDashboard from "../roles/ManagerLegacyDashboard";
import OutboundAgentDashboard from "../roles/OutboundAgentDashboard";
import QAManagerDashboard from "../roles/QAManagerDashboard";
import ReportViewerDashboard from "../roles/ReportViewerDashboard";
import RetentionAgentDashboard from "../roles/RetentionAgentDashboard";
import SuperAdminDashboard from "../roles/SuperAdminDashboard";
import TeamLeadDashboard from "../roles/TeamLeadDashboard";

const ROLE_COMPONENTS = {
  super_admin: SuperAdminDashboard,
  admin: AdminDashboard,
  hr_manager: HRManagerDashboard,
  qa_manager: QAManagerDashboard,
  finance_manager: FinanceManagerDashboard,
  team_lead: TeamLeadDashboard,
  closer: CloserDashboard,
  licensed_agent: LicensedAgentDashboard,
  retention_agent: RetentionAgentDashboard,
  inbound_agent: InboundAgentDashboard,
  outbound_agent: OutboundAgentDashboard,
  report_viewer: ReportViewerDashboard,
  client_viewer: ClientViewerDashboard,
  manager: ManagerLegacyDashboard,
  agent: AgentLegacyDashboard,
};

function RoleDashboardSwitch({ role, session, activeNavLabel }) {
  const RoleComponent = ROLE_COMPONENTS[role] || ReportViewerDashboard;
  return <RoleComponent session={session} activeNavLabel={activeNavLabel} />;
}

export default RoleDashboardSwitch;