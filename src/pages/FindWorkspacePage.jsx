import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";

import IllustrationPlaceholder from "../components/IllustrationPlaceholder";
import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";
import { requestWorkspaceRecovery } from "../features/auth/services/authService";

/**
 * "I forgot my workspace link" recovery page. A tenant's login page
 * only exists at /operoza/<tenant_slug>/login - there's no other way
 * to reach it without already knowing the slug, and until now there
 * was no way back in if you lost it (RestorePortalForm on /start is a
 * different, heavier disaster-recovery path requiring a data export
 * file - not a fit for someone who just forgot a URL).
 *
 * Deliberately shows the exact same confirmation message whether the
 * email matched a real account or not (mirrors the backend's own
 * generic response - iam/views.py's request_workspace_recovery) - so
 * this page can never be used to check which companies are registered
 * on Operoza, only to recover a link you already have a real claim to.
 */
function FindWorkspacePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await requestWorkspaceRecovery(email.trim());
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error.message || "Unable to process this request right now. Please try again shortly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <SeoHead
        path="/find-workspace"
        title="Find Your Workspace"
        description="Forgot your Operoza workspace link? Enter your account email and we'll send your tenant login link - without revealing it on screen to anyone else."
      />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Stack spacing={5} alignItems="center">
          <Stack spacing={2} alignItems="center" textAlign="center" className="fade-up" sx={{ maxWidth: 560 }}>
            <IllustrationPlaceholder icon={MarkEmailReadRoundedIcon} size={140} label="Illustration: an email arriving with a workspace link" />
            <Typography variant="h1" sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
              Find Your Workspace
            </Typography>
            <Typography color="text.secondary">
              Forgot the link to your Operoza workspace? Enter the email you signed up with and, if it's
              registered, we'll send your login link straight to your inbox.
            </Typography>
          </Stack>

          <Card className="fade-up" sx={{ border: "1px solid", borderColor: "divider", width: "100%", maxWidth: 480 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {submitted ? (
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Alert severity="success" sx={{ width: "100%" }}>
                    If that email is registered, we've sent your workspace link(s) to it.
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    Check your inbox (and spam folder) in the next few minutes. No sign of it?
                    Double-check the email you signed up with, or try again below.
                  </Typography>
                  <Button variant="text" onClick={() => setSubmitted(false)}>
                    Try a different email
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Account email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setErrorMessage("");
                      setEmail(event.target.value);
                    }}
                  />
                  {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!email.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Me My Link"}
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have a workspace yet?{" "}
              <Typography component={Link} to="/start" color="primary" fontWeight={700} sx={{ textDecoration: "none" }}>
                Start one free
              </Typography>
            </Typography>
          </Box>
        </Stack>
      </Container>
    </PublicLayout>
  );
}

export default FindWorkspacePage;
