import TenantAdminDashboard from "./TenantAdminDashboard";

function SuperAdminDashboard({ session, activeNavLabel }) {
  return <TenantAdminDashboard session={session} activeNavLabel={activeNavLabel} />;
}

export default SuperAdminDashboard;
