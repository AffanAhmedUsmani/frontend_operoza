import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import RoleDashboardSwitch from "../features/crm/components/RoleDashboardSwitch";
import TenantCrmLayout from "../features/crm/layouts/TenantCrmLayout";
import { clearSession, loadSession } from "../features/auth/utils/session";

function TenantPortalPage() {
  const { companySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state || loadSession();

  if (!session || session.tenant?.tenantSlug !== companySlug) {
    return <Navigate to={`/operoza/${companySlug}/login`} replace />;
  }

  const handleLogout = () => {
    clearSession();
    navigate(`/operoza/${companySlug}/login`, { replace: true });
  };

  return (
    <TenantCrmLayout
      tenantName={session.tenant.companyName}
      roleLabel={session.user.role}
      role={session.user.role}
      onLogout={handleLogout}
    >
      <RoleDashboardSwitch role={session.user.role} session={session} />
    </TenantCrmLayout>
  );
}

export default TenantPortalPage;