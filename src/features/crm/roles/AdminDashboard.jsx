import TenantAdminDashboard from "./TenantAdminDashboard";

function AdminDashboard({ session, activeNavLabel }) {
  return <TenantAdminDashboard session={session} activeNavLabel={activeNavLabel} />;
}

export default AdminDashboard;
