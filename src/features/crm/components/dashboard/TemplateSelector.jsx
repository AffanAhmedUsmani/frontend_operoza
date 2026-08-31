import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert as MuiAlert,
} from "@mui/material";
import { BACKEND_DASHBOARD_TEMPLATES } from "./dashboardTemplates";

/**
 * TemplateSelector — Dialog to select and create dashboards from templates.
 * Follows Jakob's Law: familiar card-based selection UI, clear CTA.
 * Miller's Law: shows templates in grid, one selection at a time.
 * Progressive disclosure: shows template description on click.
 */
function TemplateSelector({ open, onClose, onCreateFromTemplate, campaignId, loading = false, actorRole }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dashboardName, setDashboardName] = useState("");
  const [error, setError] = useState("");

  // QA_FIX_PLAN.md step 15 - every template's own recommended_for tag was
  // already there in the data (dashboardTemplates.js), just never read by
  // this picker - every role saw all 10 templates in one undifferentiated
  // list regardless of fit. A hard filter would leave hr_manager/client
  // (rarely tagged) looking at an empty or near-empty list, so this
  // prioritizes instead of hiding: recommended-for-this-role templates
  // surface first, everything else stays one section below, still fully
  // available.
  const normalizedRole = String(actorRole || "").trim().toLowerCase();
  const recommended = normalizedRole
    ? BACKEND_DASHBOARD_TEMPLATES.filter((t) => (t.recommended_for || []).includes(normalizedRole))
    : [];
  const recommendedNames = new Set(recommended.map((t) => t.name));
  const others = BACKEND_DASHBOARD_TEMPLATES.filter((t) => !recommendedNames.has(t.name));

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    // Auto-generate dashboard name from template
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setDashboardName(`${template.name} (${timestamp})`);
    setError("");
  };

  const handleCreate = async () => {
    if (!selectedTemplate) {
      setError("Please select a template");
      return;
    }
    if (!dashboardName.trim()) {
      setError("Dashboard name is required");
      return;
    }
    try {
      await onCreateFromTemplate({
        campaign_id: campaignId,
        template_name: selectedTemplate.name,
        dashboard_name: dashboardName.trim(),
      });
      // Close and reset on success (parent handles success message)
      setSelectedTemplate(null);
      setDashboardName("");
      setError("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create dashboard");
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setDashboardName("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
        Create Dashboard from Template
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* Template Grid - grouped by relevance to the current role
              (step 15), not one undifferentiated list */}
          {["recommended", "others"].map((group) => {
            const items = group === "recommended" ? recommended : others;
            if (items.length === 0) return null;
            return (
              <Box key={group}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                  {group === "recommended" ? "Recommended for your role" : "Other templates"}
                </Typography>
                <Grid container spacing={1.5}>
                  {items.map((template) => (
                    <Grid item xs={12} key={template.name}>
                      <Card
                        onClick={() => handleSelectTemplate(template)}
                        sx={{
                          cursor: "pointer",
                          border: selectedTemplate?.name === template.name ? "2px solid" : "1px solid",
                          borderColor: selectedTemplate?.name === template.name ? "primary.main" : "divider",
                          bgcolor: selectedTemplate?.name === template.name ? "action.selected" : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "action.hover",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                          <Stack spacing={0.5}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography sx={{ fontSize: "1.5rem" }}>{template.icon}</Typography>
                              <Typography variant="subtitle2" fontWeight={700}>
                                {template.name}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                              {template.description}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}

          {/* Dashboard Name Input (only show when template selected) */}
          {selectedTemplate && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75 }}>
                Dashboard Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="e.g., My Sales Dashboard"
                autoFocus
              />
            </Box>
          )}

          {/* Error Alert */}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!selectedTemplate || !dashboardName.trim() || loading}
        >
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Create Dashboard
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TemplateSelector;
