import { useMemo } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import RoleDashboardSwitch from "../features/crm/components/RoleDashboardSwitch";
import TenantCrmLayout from "../features/crm/layouts/TenantCrmLayout";
import { clearSession, loadSession } from "../features/auth/utils/session";
import { normalizeRole } from "../features/crm/components/sales/salesFormUtils";
import { useColorMode } from "../hooks/useColorMode";
import { buildTheme } from "../theme";

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

  // Sprint 19 (docs/SPRINT_PLAN.md) - a per-tenant theme, nested inside
  // the app-wide default ThemeProvider (main.jsx). Post-Sprint-20:
  // TenantLoginPage.jsx applies this same buildTheme() before a session
  // even exists (via the unauthenticated public branding lookup), so a
  // tenant's colors/logo are consistent across login and portal, not
  // just the authenticated portal.
  const { mode, toggleMode } = useColorMode();

  const tenantTheme = useMemo(
    () =>
      buildTheme({
        primaryColor: session.tenant.brandPrimaryColor,
        secondaryColor: session.tenant.brandSecondaryColor,
        backgroundColor: session.tenant.brandBackgroundColor,
        surfaceColor: session.tenant.brandSurfaceColor,
        mode,
      }),
    [
      session.tenant.brandPrimaryColor,
      session.tenant.brandSecondaryColor,
      session.tenant.brandBackgroundColor,
      session.tenant.brandSurfaceColor,
      mode,
    ]
  );

  return (
    <ThemeProvider theme={tenantTheme}>
      <TenantCrmLayout
        session={session}
        tenantName={session.tenant.companyName}
        tenantLogoUrl={session.tenant.brandLogoUrl}
        roleLabel={normalizedRole}
        role={normalizedRole}
        onLogout={handleLogout}
        colorMode={mode}
        onToggleColorMode={toggleMode}
      >
        <RoleDashboardSwitch role={normalizedRole} session={session} />
      </TenantCrmLayout>
    </ThemeProvider>
  );
}

export default TenantPortalPage;