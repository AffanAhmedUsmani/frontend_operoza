import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import ColorModeToggle from "../components/ColorModeToggle";
import FloatingActions from "../components/FloatingActions";
import { fetchPublicTenantBranding, loginTenant } from "../features/auth/services/authService";
import { saveSession } from "../features/auth/utils/session";
import { useColorMode } from "../hooks/useColorMode";
import { buildTheme } from "../theme";

function TenantLoginPage() {
  const { companySlug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState(state?.password || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branding, setBranding] = useState(null);

  // Post-Sprint-20 - "the tenant's login screen experience changes
  // according to those colors too, and the logo also appears on the
  // login area": a per-tenant theme applied before any session exists,
  // fetched via the unauthenticated public/branding lookup. Falls back
  // to the default palette (branding === null) for an unknown slug or a
  // network failure, exactly like a tenant who never set branding.
  useEffect(() => {
    let cancelled = false;
    fetchPublicTenantBranding(companySlug).then((result) => {
      if (!cancelled) setBranding(result);
    });
    return () => {
      cancelled = true;
    };
  }, [companySlug]);

  const { mode, toggleMode } = useColorMode();

  const loginTheme = useMemo(
    () =>
      buildTheme({
        primaryColor: branding?.brandPrimaryColor,
        secondaryColor: branding?.brandSecondaryColor,
        backgroundColor: branding?.brandBackgroundColor,
        surfaceColor: branding?.brandSurfaceColor,
        mode,
      }),
    [
      branding?.brandPrimaryColor,
      branding?.brandSecondaryColor,
      branding?.brandBackgroundColor,
      branding?.brandSurfaceColor,
      mode,
    ]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const session = await loginTenant({ tenantSlug: companySlug, email, password });
      saveSession(session);
      navigate(`/operoza/${companySlug}/portal`, { replace: true, state: session });
    } catch (error) {
      setErrorMessage(error.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={loginTheme}>
    <Box className="page-shell" sx={{ bgcolor: "background.default" }}>
      <Box className="ambient-bg" />
      <ColorModeToggle
        mode={mode}
        onToggle={toggleMode}
        sx={{ position: "absolute", top: 16, right: 16, zIndex: 3, color: "text.secondary" }}
      />
      <Container maxWidth="sm" sx={{ py: { xs: 7, md: 12 }, position: "relative", zIndex: 2 }}>
        <Card className="fade-up" sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={2} component="form" onSubmit={handleSubmit}>
              {branding?.brandLogoUrl ? (
                <Box
                  component="img"
                  src={branding.brandLogoUrl}
                  alt={`${branding.companyName || companySlug} logo`}
                  sx={{ width: 56, height: 56, borderRadius: 2, objectFit: "cover", mb: 1 }}
                />
              ) : null}
              <Typography variant="h4">{branding?.companyName || "Tenant CRM"} Login</Typography>
              <Typography color="text.secondary">
                Sign in to the {branding?.companyName || state?.companyName || companySlug} workspace.
              </Typography>
              {state?.email ? (
                <Typography variant="body2" color="text.secondary">
                  Your onboarding details are prefilled below. Click login to enter your tenant CRM.
                </Typography>
              ) : null}
              <TextField label="Tenant workspace" value={companySlug} disabled fullWidth />
              <TextField label="Business email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth />
              <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth />
              <Button
                variant="text"
                onClick={() => navigate(`/operoza/${companySlug}/forgot-password`, { state: { email } })}
                sx={{ alignSelf: "flex-start", px: 0 }}
              >
                Forgot password?
              </Button>
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
              <Button type="submit" variant="contained" disabled={!email || !password || isSubmitting}>
                Login to Tenant CRM
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
      <FloatingActions />
    </Box>
    </ThemeProvider>
  );
}

export default TenantLoginPage;