import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";

import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";
import { onboardTenant, restoreTenant } from "../features/auth/services/authService";
import RestorePortalForm from "../features/auth/components/RestorePortalForm";

const steps = ["Business Basics", "Admin Account", "Scale Planning"];

const companySizes = [
  "1-10",
  "11-25",
  "26-50",
  "51-100",
  "101-250",
  "250+",
];

function StartJourneyPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("create");
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    password: "",
    companySize: "",
    campaignCount: "",
    teamSize: "",
  });

  const stepFields = useMemo(
    () => [
      ["companyName"],
      ["ownerName", "email", "password"],
      ["companySize", "campaignCount", "teamSize"],
    ],
    []
  );

  const handleChange = (field) => (event) => {
    setErrorMessage("");
    setSuccessMessage("");
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const isCurrentStepValid = stepFields[activeStep].every((field) => {
    const value = formData[field];
    return String(value).trim().length > 0;
  });

  const nextStep = () => {
    if (!isCurrentStepValid) {
      return;
    }
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => {
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    if (!awaitingVerification && !isCurrentStepValid) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const result = await onboardTenant({
        companyName: formData.companyName,
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
        companySize: formData.companySize,
        campaignCount: formData.campaignCount,
        teamSize: formData.teamSize,
        verificationCode: awaitingVerification ? verificationCode : "",
      });

      if (result.verificationRequired) {
        setAwaitingVerification(true);
        setSuccessMessage(result.message || "Verification code sent. Check your email.");
        return;
      }

      navigate(`/operoza/${result.tenant.tenantSlug}/login`, {
        state: {
          companyName: result.tenant.companyName,
          companySlug: result.tenant.tenantSlug,
          email: formData.email,
          password: formData.password,
          user: result.user,
        },
      });
    } catch (error) {
      setErrorMessage(error.message || "Unable to create your workspace right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestored = (result) => {
    navigate(`/operoza/${result.tenant.tenantSlug}/login`, {
      state: {
        companyName: result.tenant.companyName,
        companySlug: result.tenant.tenantSlug,
        user: result.user,
      },
    });
  };

  return (
    <PublicLayout>
      <SeoHead
        path="/start"
        title="Start Free"
        description="Create your free Operoza workspace - no credit card required. Set up your campaigns and invite your team in minutes."
      />
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 }, position: "relative", zIndex: 2 }}>
        <Card className="fade-up" sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3} sx={{ width: "100%", maxWidth: 720, mx: "auto" }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <RocketLaunchRoundedIcon color="primary" />
                <Typography variant="h1" sx={{ fontSize: { xs: "1.6rem", md: "2.125rem" } }}>
                  Start CRM journey for your business today
                </Typography>
              </Stack>

              <ToggleButtonGroup
                exclusive
                fullWidth
                value={mode}
                onChange={(_event, value) => {
                  if (!value) return;
                  setErrorMessage("");
                  setSuccessMessage("");
                  setMode(value);
                }}
              >
                <ToggleButton value="create">Create a new workspace</ToggleButton>
                <ToggleButton value="restore">Restore a previous portal</ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                Already have a workspace but just lost the link?{" "}
                <Typography component={Link} to="/find-workspace" color="primary" fontWeight={700} sx={{ textDecoration: "none" }}>
                  Find your workspace
                </Typography>
              </Typography>

              {mode === "restore" ? (
                <RestorePortalForm onRestored={handleRestored} restoreTenant={restoreTenant} />
              ) : (
                <>
                  <Typography color="text.secondary">
                    Tell us your setup preferences and we will prepare your tenant login workspace link.
                  </Typography>

                  {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                  {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

                  <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {activeStep === 0 && (
                <Stack className="slide-in" sx={{ width: "100%", alignItems: "center" }}>
                  <TextField
                    fullWidth
                    label="Company name"
                    value={formData.companyName}
                    onChange={handleChange("companyName")}
                    sx={{ maxWidth: 460 }}
                  />
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack spacing={2} className="slide-in" sx={{ width: "100%" }}>
                  <TextField fullWidth label="Your full name" value={formData.ownerName} onChange={handleChange("ownerName")} />
                  <TextField fullWidth label="Business email" type="email" value={formData.email} onChange={handleChange("email")} />
                  <TextField fullWidth label="Create password" type="password" value={formData.password} onChange={handleChange("password")} />
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={2} className="slide-in" sx={{ width: "100%" }}>
                  <TextField
                    fullWidth
                    select
                    label="Company size"
                    value={formData.companySize}
                    onChange={handleChange("companySize")}
                  >
                    {companySizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label="How many campaigns?"
                    type="number"
                    inputProps={{ min: 1, max: 1000 }}
                    value={formData.campaignCount}
                    onChange={handleChange("campaignCount")}
                  />
                  <TextField
                    fullWidth
                    label="Team size to manage"
                    type="number"
                    inputProps={{ min: 1, max: 5000 }}
                    value={formData.teamSize}
                    onChange={handleChange("teamSize")}
                  />
                </Stack>
              )}

              {awaitingVerification ? (
                <Stack spacing={2} className="slide-in" sx={{ width: "100%" }}>
                  <Typography color="text.secondary">
                    Enter the 6-digit code sent to {formData.email} to finish creating your workspace.
                  </Typography>
                  <TextField
                    fullWidth
                    label="Verification code"
                    value={verificationCode}
                    onChange={(event) => {
                      setErrorMessage("");
                      setVerificationCode(event.target.value);
                    }}
                  />
                </Stack>
              ) : null}

              <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent={{ sm: "space-between" }} spacing={2}>
                <Button variant="outlined" disabled={activeStep === 0} onClick={prevStep} fullWidth>
                  Back
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button variant="contained" onClick={nextStep} disabled={!isCurrentStepValid} fullWidth>
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={submit}
                    disabled={(!awaitingVerification && !isCurrentStepValid) || (awaitingVerification && !verificationCode) || isSubmitting}
                    fullWidth
                  >
                    {awaitingVerification ? "Verify and Create Workspace" : "Create Workspace Link"}
                  </Button>
                )}
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </PublicLayout>
  );
}

export default StartJourneyPage;
