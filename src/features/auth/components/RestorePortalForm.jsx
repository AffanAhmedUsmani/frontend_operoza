import { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

/**
 * Sprint 18 (docs/SPRINT_PLAN.md), PLATFORM_OPS_AND_BILLING.md S5.2 -
 * "a returning customer restoring a previous portal", alongside the
 * normal "create a new workspace" wizard. Requires the dump file plus
 * the email/password of ANY account inside it - the backend verifies
 * those credentials against the dump's own embedded password hash
 * before writing anything, so merely possessing the file is never
 * enough to claim someone else's tenant.
 */
export default function RestorePortalForm({ onRestored, restoreTenant }) {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dumpFile, setDumpFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = companyName.trim() && email.trim() && password && dumpFile;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await restoreTenant({ companyName, email, password, dumpFile });
      onRestored?.(result);
    } catch (err) {
      setError(err.message || "Unable to restore this portal right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2} className="slide-in" sx={{ width: "100%" }}>
      <Typography color="text.secondary">
        Upload the data export you downloaded from your previous portal, along with the email and
        password of any account in it - we&apos;ll verify those credentials and restore your whole
        workspace under a brand-new workspace link.
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <TextField fullWidth label="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <TextField fullWidth label="Account email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField fullWidth label="Account password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <Button component="label" variant="outlined" sx={{ alignSelf: "flex-start" }}>
        {dumpFile ? `✓ ${dumpFile.name}` : "Choose export file (.json)"}
        <input type="file" accept="application/json,.json" hidden onChange={(e) => setDumpFile(e.target.files?.[0] ?? null)} />
      </Button>

      <Box>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || submitting} fullWidth>
          {submitting ? "Restoring..." : "Restore My Portal"}
        </Button>
      </Box>
    </Stack>
  );
}
