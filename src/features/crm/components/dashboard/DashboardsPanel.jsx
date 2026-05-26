import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { MdAdd, MdArrowBack, MdAutoAwesome, MdBarChart, MdDashboard, MdEdit, MdManageAccounts } from "react-icons/md";
import { useDashboards } from "../../hooks/useDashboards";
import DashboardViewer from "./DashboardViewer";
import DashboardBuilderPanel from "./DashboardBuilderPanel";
import { createWidget, fetchDashboardDetail, createDashboardFromTemplate } from "../../services/dashboardService";
import { buildDashboardTemplateWidgets, DASHBOARD_TEMPLATE_PRESETS } from "./dashboardTemplates";
import TemplateSelector from "./TemplateSelector";
import DashboardAssignmentsDialog from "./DashboardAssignmentsDialog";

const CAN_BUILD_ROLES = new Set(["admin", "team_lead"]);

/**
 * DashboardsPanel
 *
 * Top-level dashboard feature panel — handles:
 *  - List view: all dashboards for the tenant (filtered by campaign if provided)
 *  - "Create dashboard" flow (admin/team_lead)
 *  - Drill-down: renders DashboardBuilderPanel (builders) or DashboardViewer (others)
 *
 * Props:
 *   accessToken   — JWT
 *   role          — canonical role code
 *   campaigns     — array of campaign objects [{ campaign_id, name }] for the dropdown
 */
function DashboardsPanel({ accessToken, role, campaigns = [] }) {
  const canBuild = CAN_BUILD_ROLES.has(role);

  const [campaignFilter, setCampaignFilter] = useState("");
  const [selected, setSelected] = useState(null); // dashboard object currently open

  const { dashboards, loading, error, reload, create, update, remove } = useDashboards(
    accessToken,
    { campaignId: campaignFilter || undefined }
  );

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    campaign_id: "",
    name: "",
    is_client_visible: false,
    creation_mode: "manual",
    template_code: DASHBOARD_TEMPLATE_PRESETS[0]?.code || "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Template selector state
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [templateCreating, setTemplateCreating] = useState(false);
  const [assignmentsOpen, setAssignmentsOpen] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const selectedCampaign = campaigns.find((item) => item.campaign_id === createForm.campaign_id);
      const created = await create({
        campaign_id: createForm.campaign_id,
        name: createForm.name.trim(),
        is_client_visible: createForm.is_client_visible,
      });

      if (createForm.creation_mode === "template" && selectedCampaign) {
        const widgets = buildDashboardTemplateWidgets(createForm.template_code, selectedCampaign);
        for (const widget of widgets) {
          await createWidget(accessToken, created.dashboard_id, widget);
        }
      }

      const detail = await fetchDashboardDetail(accessToken, created.dashboard_id);

      setCreateOpen(false);
      setCreateForm({
        campaign_id: "",
        name: "",
        is_client_visible: false,
        creation_mode: "manual",
        template_code: DASHBOARD_TEMPLATE_PRESETS[0]?.code || "",
      });
      setSelected(detail);
    } catch (err) {
      setCreateError(err.message || "Failed to create dashboard");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFromTemplate = async (templatePayload) => {
    setTemplateCreating(true);
    try {
      const created = await createDashboardFromTemplate(accessToken, templatePayload);
      const detail = await fetchDashboardDetail(accessToken, created.dashboard_id);
      setSelected(detail);
      // Parent closes the template selector on success
    } catch (err) {
      throw err; // Let TemplateSelector handle error display
    } finally {
      setTemplateCreating(false);
    }
  };

  const handleDelete = async (dashboardId) => {
    try {
      await remove(dashboardId);
      if (selected?.dashboard_id === dashboardId) setSelected(null);
    } catch (_) {
      reload();
    }
  };

  // ── Drill-down view ─────────────────────────────────────────────────────────
  if (selected) {
    const campaignName =
      campaigns.find((c) => c.campaign_id === selected.campaign_id)?.name ||
      selected.campaign_id;

    return (
      <>
      <Stack spacing={2}>
        {/* Breadcrumb */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            size="small"
            onClick={() => setSelected(null)}
            aria-label="Back to dashboards list"
          >
            <MdArrowBack />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            Dashboards
          </Typography>
          <Typography variant="body2" color="text.secondary">›</Typography>
          <Typography variant="body2" color="text.primary" fontWeight={700}>
            {selected.name}
          </Typography>
          <Chip
            label={campaignName}
            size="small"
            icon={<MdBarChart style={{ fontSize: 12 }} />}
            sx={{ bgcolor: "#f5ece0", color: "#7c3f17" }}
          />
          {canBuild && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdManageAccounts />}
              onClick={() => setAssignmentsOpen(true)}
            >
              Assignments
            </Button>
          )}
        </Stack>

        {canBuild ? (
          <DashboardBuilderPanel
            accessToken={accessToken}
            dashboard={selected}
            campaign={campaigns.find((c) => c.campaign_id === selected?.campaign_id)}
            actorRole={role}
            onRenamed={(updated) => setSelected(updated)}
            onDelete={handleDelete}
            updateDashboard={update}
          />
        ) : (
          <DashboardViewer
            accessToken={accessToken}
            dashboard={selected}
            actorRole={role}
            canEdit={false}
          />
        )}
      </Stack>

      <DashboardAssignmentsDialog
        accessToken={accessToken}
        dashboard={selected}
        open={assignmentsOpen}
        onClose={() => setAssignmentsOpen(false)}
      />
      </>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <Stack spacing={3}>
      {/* Section header — primacy position (Serial Position) */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Dashboards
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualise campaign performance with live, role-filtered data.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          {/* Campaign filter — chunked (Miller's Law: don't overload) */}
          {campaigns.length > 0 && (
            <Select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              size="small"
              displayEmpty
              sx={{ minWidth: 180 }}
              inputProps={{ "aria-label": "Filter by campaign" }}
            >
              <MenuItem value="">All campaigns</MenuItem>
              {campaigns.map((c) => (
                <MenuItem key={c.campaign_id} value={c.campaign_id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          )}

          {canBuild && (
            <Button
              variant="contained"
              size="small"
              startIcon={<MdAdd />}
              onClick={() => setCreateOpen(true)}
              aria-label="Create new dashboard"
            >
              New Dashboard
            </Button>
          )}

          {canBuild && campaignFilter && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdAutoAwesome />}
              onClick={() => setTemplateSelectorOpen(true)}
              aria-label="Create dashboard from template"
            >
              From Template
            </Button>
          )}
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Loading state */}
      {loading && (
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty state */}
      {!loading && dashboards.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed #ead8c4",
            borderRadius: 3,
          }}
          role="status"
          aria-live="polite"
        >
          <MdDashboard size={36} color="#c87941" aria-hidden="true" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            No dashboards yet
          </Typography>
          {canBuild && (
            <Button
              variant="contained"
              size="small"
              startIcon={<MdAdd />}
              sx={{ mt: 2 }}
              onClick={() => setCreateOpen(true)}
            >
              Create your first dashboard
            </Button>
          )}
        </Box>
      )}

      {/* Dashboard cards grid — scannable chunks (Miller's Law) */}
      {!loading && dashboards.length > 0 && (
        <Grid container spacing={2}>
          {dashboards.map((d) => {
            const campaignName =
              campaigns.find((c) => c.campaign_id === d.campaign_id)?.name ||
              d.campaign_id;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={d.dashboard_id}>
                <Card
                  sx={{
                    border: "1px solid #ead8c4",
                    borderRadius: 3,
                    height: "100%",
                    transition: "box-shadow 0.15s",
                    "&:hover": { boxShadow: 4 },
                  }}
                >
                  <CardActionArea
                    onClick={() => setSelected(d)}
                    sx={{ height: "100%", alignItems: "flex-start" }}
                    aria-label={`Open dashboard: ${d.name}`}
                  >
                    <CardContent component={Stack} spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MdDashboard size={18} color="#c05314" aria-hidden="true" />
                        <Typography variant="subtitle1" fontWeight={700} noWrap>
                          {d.name}
                        </Typography>
                      </Stack>

                      <Typography variant="caption" color="text.secondary" noWrap>
                        Campaign: {campaignName}
                      </Typography>

                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {d.is_client_visible && (
                          <Chip label="Client visible" size="small" color="success" />
                        )}
                      </Stack>

                      <Typography variant="caption" color="text.disabled">
                        Updated {new Date(d.updated_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Trust cue / recency CTA at section end (Serial Position) */}
      {!loading && dashboards.length > 0 && canBuild && (
        <Box sx={{ textAlign: "center", pt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<MdAdd />}
            onClick={() => setCreateOpen(true)}
            aria-label="Create another dashboard"
          >
            New Dashboard
          </Button>
        </Box>
      )}

      {/* Template selector (requires campaign filter) */}
      {canBuild && (
        <TemplateSelector
          open={templateSelectorOpen}
          onClose={() => setTemplateSelectorOpen(false)}
          onCreateFromTemplate={handleCreateFromTemplate}
          campaignId={campaignFilter}
          loading={templateCreating}
        />
      )}

      {/* Create dashboard dialog */}
      <Dialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateError(null); }}
        maxWidth="sm"
        fullWidth
        aria-labelledby="create-dashboard-title"
      >
        <DialogTitle id="create-dashboard-title">New Dashboard</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {createError && <Alert severity="error">{createError}</Alert>}

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Choose how to start
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant={createForm.creation_mode === "manual" ? "elevation" : "outlined"} sx={{ borderColor: createForm.creation_mode === "manual" ? "primary.main" : "#ead8c4" }}>
                    <CardActionArea onClick={() => setCreateForm((p) => ({ ...p, creation_mode: "manual" }))}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <MdEdit color="#c05314" />
                          <Typography fontWeight={700}>Build Manually</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Start with an empty dashboard and add widgets one by one.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant={createForm.creation_mode === "template" ? "elevation" : "outlined"} sx={{ borderColor: createForm.creation_mode === "template" ? "secondary.main" : "#ead8c4" }}>
                    <CardActionArea onClick={() => setCreateForm((p) => ({ ...p, creation_mode: "template" }))}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <MdAutoAwesome color="#0f8a7a" />
                          <Typography fontWeight={700}>Use Dashboard Template</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Start from a ready-made widget combination, then tweak fields and formulas as needed.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <TextField
              label="Dashboard name"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
              required
              autoFocus
              inputProps={{ maxLength: 180 }}
              helperText="Unique name within the selected campaign."
            />

            <TextField
              select
              label="Campaign"
              value={createForm.campaign_id}
              onChange={(e) => setCreateForm((p) => ({ ...p, campaign_id: e.target.value }))}
              fullWidth
              required
              helperText="Select the campaign this dashboard will track."
            >
              {campaigns.length === 0 ? (
                <MenuItem disabled>No campaigns available</MenuItem>
              ) : (
                campaigns.map((c) => (
                  <MenuItem key={c.campaign_id} value={c.campaign_id}>
                    {c.name}
                  </MenuItem>
                ))
              )}
            </TextField>

            {createForm.creation_mode === "template" && (
              <TextField
                select
                label="Dashboard template"
                value={createForm.template_code}
                onChange={(e) => setCreateForm((p) => ({ ...p, template_code: e.target.value }))}
                fullWidth
                helperText="This will generate a ready-made set of widgets for the selected campaign."
              >
                {DASHBOARD_TEMPLATE_PRESETS.map((preset) => (
                  <MenuItem key={preset.code} value={preset.code}>
                    {preset.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {createForm.creation_mode === "template" ? (
              <Grid container spacing={1.5}>
                {DASHBOARD_TEMPLATE_PRESETS.map((preset) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={preset.code}>
                    <Card variant={createForm.template_code === preset.code ? "elevation" : "outlined"} sx={{ borderColor: createForm.template_code === preset.code ? preset.accent : "#ead8c4" }}>
                      <CardActionArea onClick={() => setCreateForm((p) => ({ ...p, template_code: preset.code }))}>
                        <CardContent>
                          <Typography fontWeight={700}>{preset.label}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {preset.description}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : null}

            <FormControlLabel
              control={
                <Switch
                  checked={createForm.is_client_visible}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, is_client_visible: e.target.checked }))
                  }
                  inputProps={{ "aria-label": "Make visible to clients" }}
                />
              }
              label="Visible to clients"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setCreateOpen(false); setCreateError(null); }} disabled={creating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!createForm.name.trim() || !createForm.campaign_id || creating}
            aria-label="Create dashboard"
          >
            {creating ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default DashboardsPanel;
