import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";

import FloatingActions from "../components/FloatingActions";
import { confirmPasswordReset, requestPasswordReset } from "../features/auth/services/authService";

function ForgotPasswordPage() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [email, setEmail] = useState(state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleRequestCode = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({ tenantSlug: companySlug, email });
      setCodeSent(true);
      setSuccessMessage(response.message || "If this account exists, a reset code has been sent.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to send reset code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await confirmPasswordReset({
        tenantSlug: companySlug,
        email,
        code,
        newPassword,
      });
      setSuccessMessage(response.message || "Password reset successful.");
      setTimeout(() => {
        navigate(`/operoza/${companySlug}/login`, { state: { email } });
      }, 1200);
    } catch (error) {
      setErrorMessage(error.message || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="page-shell">
      <Box className="ambient-bg" />
      <Container maxWidth="sm" sx={{ py: { xs: 7, md: 12 }, position: "relative", zIndex: 2 }}>
        <Card className="fade-up" sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={2}>
              <Typography variant="h4">Reset Password</Typography>
              <Typography color="text.secondary">
                Request a reset code for the {companySlug} workspace, then set your new password.
              </Typography>

              <TextField
                label="Business email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
              />

              <Button variant="outlined" onClick={handleRequestCode} disabled={!email || isSubmitting}>
                Send Reset Code
              </Button>

              {codeSent ? (
                <>
                  <TextField
                    label="Reset code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="New password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Confirm new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleResetPassword}
                    disabled={!email || !code || !newPassword || !confirmPassword || isSubmitting}
                  >
                    Reset Password
                  </Button>
                </>
              ) : null}

              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
              {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>
      </Container>
      <FloatingActions />
    </Box>
  );
}

export default ForgotPasswordPage;
