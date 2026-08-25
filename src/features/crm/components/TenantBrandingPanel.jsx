import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, CircularProgress, InputAdornment, LinearProgress, Snackbar, Stack, TextField, Typography } from "@mui/material";

import { fetchBranding, updateBranding } from "../services/adminService";
import { DEFAULT_BACKGROUND, DEFAULT_PRIMARY, DEFAULT_SECONDARY, DEFAULT_SURFACE } from "../../../theme";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// Post-Sprint-20 - a real click-to-pick color wheel (the browser/OS
// native picker via <input type="color">), not just a read-only swatch
// dot, styled down to a small circular button that drops into a
// TextField's startAdornment.
function ColorPickerSwatch({ value, onChange, label }) {
  return (
    <Box
      component="input"
      type="color"
      aria-label={label}
      value={HEX_RE.test(value) ? value : "#ffffff"}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        width: 24,
        height: 24,
        p: 0,
        mr: 1,
        border: "1px solid rgba(0,0,0,0.23)",
        borderRadius: "50%",
        cursor: "pointer",
        appearance: "none",
        overflow: "hidden",
        "&::-webkit-color-swatch-wrapper": { p: 0 },
        "&::-webkit-color-swatch": { border: "none", borderRadius: "50%" },
      }}
    />
  );
}

/**
 * Sprint 19 (docs/SPRINT_PLAN.md), general guide S12 - Settings ->
 * Branding. Post-Sprint-20: four color pickers (primary/secondary/
 * background/surface - each with a real color-wheel swatch alongside
 * its hex field) and a logo upload, not a full theme/CSS editor. Saved
 * changes apply on the tenant's next login (the theme provider reads
 * branding once, at login - see TenantPortalPage.jsx) - this panel
 * doesn't attempt to live-preview the whole app's theme, only shows
 * what's currently saved.
 *
 * A tenant who hasn't set a color yet still sees the platform's actual
 * current default (DEFAULT_PRIMARY etc., the same constants theme.js
 * falls back to) pre-selected here, rather than a blank field - "blank"
 * was only ever a wire-format convention (see Tenant.brand_primary_color
 * in iam/models.py), not something meant to be user-visible.
 */
export default function TenantBrandingPanel({ accessToken }) {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [surfaceColor, setSurfaceColor] = useState(DEFAULT_SURFACE);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchBranding(accessToken)
      .then((data) => {
        setPrimaryColor(data.brand_primary_color || DEFAULT_PRIMARY);
        setSecondaryColor(data.brand_secondary_color || DEFAULT_SECONDARY);
        setBackgroundColor(data.brand_background_color || DEFAULT_BACKGROUND);
        setSurfaceColor(data.brand_surface_color || DEFAULT_SURFACE);
        setLogoUrl(data.brand_logo_url || "");
      })
      .catch((err) => setError(err.message || "Failed to load branding."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  // Sprint 20 (docs/SPRINT_PLAN.md) hardening - createObjectURL was
  // previously called directly in JSX on every render (including every
  // keystroke in the color fields below), creating a new, never-revoked
  // blob URL each time. This creates exactly one per logoFile selection
  // and revokes it both on the next selection and on unmount.
  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const colorsValid =
    (!primaryColor || HEX_RE.test(primaryColor)) &&
    (!secondaryColor || HEX_RE.test(secondaryColor)) &&
    (!backgroundColor || HEX_RE.test(backgroundColor)) &&
    (!surfaceColor || HEX_RE.test(surfaceColor));

  const handleSave = async () => {
    if (!colorsValid) {
      setError("Colors must be a hex value like #c05314.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await updateBranding(accessToken, { primaryColor, secondaryColor, backgroundColor, surfaceColor, logo: logoFile });
      setLogoUrl(result.brand_logo_url || "");
      setLogoFile(null);
      setSavedMessage("Branding saved");
    } catch (err) {
      setError(err.message || "Failed to save branding.");
    } finally {
      setSaving(false);
    }
  };

  // Post-Sprint-20 - "Reset to Default": writes blank back to the wire
  // for all four colors (the same "blank means use the platform default"
  // convention Tenant.brand_primary_color already documents), rather
  // than saving today's literal default hex - so if the platform's own
  // default palette ever changes later, a tenant who reset stays on the
  // current default automatically instead of being pinned to a stale
  // snapshot of it. Also removes the uploaded logo, if any.
  const handleReset = async () => {
    if (!window.confirm("Reset this workspace's branding to the platform default? This removes your logo and custom colors.")) {
      return;
    }
    setResetting(true);
    setError("");
    try {
      const result = await updateBranding(accessToken, {
        primaryColor: "",
        secondaryColor: "",
        backgroundColor: "",
        surfaceColor: "",
        removeLogo: true,
      });
      setPrimaryColor(result.brand_primary_color || DEFAULT_PRIMARY);
      setSecondaryColor(result.brand_secondary_color || DEFAULT_SECONDARY);
      setBackgroundColor(result.brand_background_color || DEFAULT_BACKGROUND);
      setSurfaceColor(result.brand_surface_color || DEFAULT_SURFACE);
      setLogoUrl(result.brand_logo_url || "");
      setLogoFile(null);
      setSavedMessage("Branding reset to default");
    } catch (err) {
      setError(err.message || "Failed to reset branding.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Set your workspace's four colors and logo - pick a color with the swatch or paste a hex code.
        Applied across this workspace's login screen and portal for every user, the next time they
        sign in, in both light and dark mode.
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <LinearProgress sx={{ borderRadius: 4 }} /> : null}

      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src={logoPreviewUrl || logoUrl} variant="rounded" sx={{ width: 56, height: 56 }} />
        <Button component="label" variant="outlined" size="small">
          {logoFile ? `✓ ${logoFile.name}` : "Upload logo"}
          <input type="file" accept="image/*" hidden onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
        <TextField
          label="Primary color"
          placeholder="#c05314"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          error={Boolean(primaryColor) && !HEX_RE.test(primaryColor)}
          helperText="Buttons and accents"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ColorPickerSwatch value={primaryColor} onChange={setPrimaryColor} label="Pick primary color" />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        <TextField
          label="Secondary color"
          placeholder="#0f8a7a"
          value={secondaryColor}
          onChange={(e) => setSecondaryColor(e.target.value)}
          error={Boolean(secondaryColor) && !HEX_RE.test(secondaryColor)}
          helperText="Secondary actions"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ColorPickerSwatch value={secondaryColor} onChange={setSecondaryColor} label="Pick secondary color" />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        <TextField
          label="Background color"
          placeholder="#f7f4ee"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          error={Boolean(backgroundColor) && !HEX_RE.test(backgroundColor)}
          helperText="Page canvas"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ColorPickerSwatch value={backgroundColor} onChange={setBackgroundColor} label="Pick background color" />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        <TextField
          label="Surface color"
          placeholder="#fffdf8"
          value={surfaceColor}
          onChange={(e) => setSurfaceColor(e.target.value)}
          error={Boolean(surfaceColor) && !HEX_RE.test(surfaceColor)}
          helperText="Cards & panels"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ColorPickerSwatch value={surfaceColor} onChange={setSurfaceColor} label="Pick surface color" />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Box>

      <Stack direction="row" spacing={1.5}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || resetting || !colorsValid}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {saving ? "Saving..." : "Save Branding"}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleReset}
          disabled={saving || resetting}
          startIcon={resetting ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {resetting ? "Resetting..." : "Reset to Default"}
        </Button>
      </Stack>

      <Snackbar
        open={Boolean(savedMessage)}
        autoHideDuration={3000}
        onClose={() => setSavedMessage("")}
        message={savedMessage}
      />
    </Stack>
  );
}
