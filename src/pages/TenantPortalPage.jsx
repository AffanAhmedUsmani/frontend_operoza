import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import RoleDashboardSwitch from "../features/crm/components/RoleDashboardSwitch";
import TenantCrmLayout from "../features/crm/layouts/TenantCrmLayout";
import { clearSession, loadSession } from "../features/auth/utils/session";
import { normalizeRole } from "../features/crm/components/sales/salesFormUtils";

function TenantPortalPage() {
  const { companySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state || loadSession();

  if (!session || session.tenant?.tenantSlug !== companySlug) {
    return <Navigate to={`/operoza/${companySlug}/login`} replace />;
  }

  const normalizedRole = normalizeRole(session?.user?.role || session?.role || "");

  const handleLogout = () => {
    clearSession();
    navigate(`/operoza/${companySlug}/login`, { replace: true });
  };

  return (
    <TenantCrmLayout
      tenantName={session.tenant.companyName}
      roleLabel={normalizedRole}
      role={normalizedRole}
      onLogout={handleLogout}
    >
      <RoleDashboardSwitch role={normalizedRole} session={session} />
    </TenantCrmLayout>
  );
}

export default TenantPortalPage;