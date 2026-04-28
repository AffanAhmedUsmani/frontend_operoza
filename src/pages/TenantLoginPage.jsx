import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";

import FloatingActions from "../components/FloatingActions";
import { loginTenant } from "../features/auth/services/authService";
import { saveSession } from "../features/auth/utils/session";

function TenantLoginPage() {
  const { companySlug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState(state?.password || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <Box className="page-shell">
      <Box className="ambient-bg" />
      <Container maxWidth="sm" sx={{ py: { xs: 7, md: 12 }, position: "relative", zIndex: 2 }}>
        <Card className="fade-up" sx={{ border: "1px solid #ead8c4" }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={2} component="form" onSubmit={handleSubmit}>
              <Typography variant="h4">Tenant CRM Login</Typography>
              <Typography color="text.secondary">
                Sign in to the {state?.companyName || companySlug} workspace.
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
  );
}

export default TenantLoginPage;