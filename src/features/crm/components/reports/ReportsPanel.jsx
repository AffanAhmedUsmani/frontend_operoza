import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdAdd, MdAssignmentInd, MdEdit, MdVisibility } from "react-icons/md";
import { fetchTenantUsers } from "../../services/adminService";
import { fetchCampaigns } from "../../services/campaignService";
import { createReportFromTemplate, deleteReport, getReport, listReportTemplates, listReports } from "../../services/reportingService";
import { resolveActorContext } from "../sales/salesFormUtils";
import ReportAssignmentDialog from "./ReportAssignmentDialog";
import ReportBuilder from "./ReportBuilder";
import ReportExportDialog from "./ReportExportDialog";
import ReportViewer from "./ReportViewer";

const CREATE_ROLES = new Set(["tenant_admin", "admin", "team_lead"]);

export default function ReportsPanel({ session, accessToken: tokenProp }) {
  const accessToken = tokenProp || session?.accessToken;
  const actorRole = resolveActorContext(accessToken).role;
  const canCreate = CREATE_ROLES.has(actorRole);
  const canManageReport = actorRole === "admin";

  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templateForm, setTemplateForm] = useState({ templateCode: "", campaignId: "", name: "" });
  const [templateSubmitting, setTemplateSubmitting] = useState(false);
  const [permissionsByReportId, setPermissionsByReportId] = useState({});

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [reports]
  );

  const loadReports = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const data = await listReports(accessToken);
      setReports(data);
      if (!selected && data.length > 0) {
        setSelected(data[0]);
      }
      if (canCreate) {
        try {
          const [userItems, templateItems, campaignItems] = await Promise.all([
            fetchTenantUsers(accessToken),
            listReportTemplates(accessToken),
            fetchCampaigns(accessToken),
          ]);
          setUsers(userItems);
          setTemplates(templateItems);
          setCampaigns(campaignItems);
          if (!templateForm.templateCode && templateItems.length > 0) {
            setTemplateForm((prev) => ({ ...prev, templateCode: templateItems[0].template_code }));
          }
          if (!templateForm.campaignId && campaignItems.length > 0) {
            setTemplateForm((prev) => ({ ...prev, campaignId: campaignItems[0].campaign_id }));
          }
        } catch {
          setUsers([]);
          setTemplates([]);
          setCampaigns([]);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, canCreate, selected]);

  const loadReportPermissions = useCallback(async (reportId) => {
    if (!accessToken || !reportId) return;
    try {
      const detail = await getReport(accessToken, reportId);
      setPermissionsByReportId((prev) => ({
        ...prev,
        [reportId]: detail.permissions || null,
      }));
    } catch {
      setPermissionsByReportId((prev) => ({
        ...prev,
        [reportId]: null,
      }));
    }
  }, [accessToken]);

  useEffect(() => {
    if (selected?.report_id) {
      loadReportPermissions(selected.report_id);
    }
  }, [selected?.report_id, loadReportPermissions]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDelete = async (report) => {
    if (!report?.report_id || !canManageReport) return;
    if (!window.confirm(`Delete report \"${report.name || "Untitled"}\"?`)) return;
    try {
      await deleteReport(accessToken, report.report_id);
      await loadReports();
      if (selected?.report_id === report.report_id) {
        setSelected(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete report.");
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!templateForm.templateCode || !templateForm.campaignId) {
      setError("Template and campaign are required.");
      return;
    }

    setTemplateSubmitting(true);
    setError("");
    try {
      const created = await createReportFromTemplate(accessToken, {
        template_code: templateForm.templateCode,
        campaign_id: templateForm.campaignId,
        name: templateForm.name || undefined,
      });
      const missingRequired = created?.mapping?.missing_required || [];
      if (missingRequired.length) {
        setError(`Report created with warnings. Missing required template fields: ${missingRequired.join(", ")}`);
      }
      setTemplateOpen(false);
      setTemplateForm((prev) => ({ ...prev, name: "" }));
      await loadReports();
    } catch (err) {
      setError(err.message || "Failed to create report from template.");
    } finally {
      setTemplateSubmitting(false);
    }
  };

  if (viewerOpen && selected) {
    return (
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
              <Box>
                <Typography variant="h6">Report Viewer</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.name || "Selected report"}
                </Typography>
              </Box>
              <Button variant="outlined" onClick={() => setViewerOpen(false)}>
                Back To Reports
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <ReportViewer accessToken={accessToken} report={selected} users={users} embedded />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
            <Box>
              <Typography variant="h6">Reports</Typography>
              <Typography variant="body2" color="text.secondary">
                Separate reporting module with execution viewer and threaded comments.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={loadReports} disabled={loading}>Refresh</Button>
              {canCreate ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => setTemplateOpen(true)}
                  >
                    From Template
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<MdAdd />}
                    onClick={() => {
                      setEditing(null);
                      setBuilderOpen(true);
                    }}
                  >
                    New Report
                  </Button>
                </>
              ) : null}
            </Stack>
          </Stack>
          {!canCreate ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              This role can only access reports assigned by admins or team leads.
            </Alert>
          ) : null}
          {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
        </CardContent>
      </Card>

      <Stack spacing={1}>
        {sortedReports.map((report) => {
          const isSelected = selected?.report_id === report.report_id;
          const reportPermissions = permissionsByReportId[report.report_id] || null;
          const canExport = reportPermissions ? !!reportPermissions.can_export : true;
          return (
            <Card
              key={report.report_id}
              sx={{
                border: isSelected ? "2px solid" : "1px solid",
                borderColor: isSelected ? "primary.light" : "divider",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelected(report);
                loadReportPermissions(report.report_id);
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{report.name || "Untitled Report"}</Typography>
                    <Chip size="small" label={report.is_default ? "Default" : "Custom"} />
                  </Stack>
                  {report.description ? <Typography color="text.secondary">{report.description}</Typography> : null}
                  <Divider />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button size="small" startIcon={<MdVisibility />} onClick={(event) => {
                      event.stopPropagation();
                      setSelected(report);
                      loadReportPermissions(report.report_id);
                      setViewerOpen(true);
                    }}>
                      View
                    </Button>
                    {canCreate ? (
                      <Button size="small" startIcon={<MdEdit />} onClick={(event) => {
                        event.stopPropagation();
                        setEditing(report);
                        setBuilderOpen(true);
                      }}>
                        Edit
                      </Button>
                    ) : null}
                    {canManageReport ? (
                      <Button size="small" startIcon={<MdAssignmentInd />} onClick={(event) => {
                        event.stopPropagation();
                        setSelected(report);
                        setAssignmentOpen(true);
                      }}>
                        Assign
                      </Button>
                    ) : null}
                    <Button size="small" onClick={(event) => {
                      event.stopPropagation();
                      setSelected(report);
                      loadReportPermissions(report.report_id);
                      setExportOpen(true);
                    }} disabled={!canExport}>
                      Export
                    </Button>
                    {canManageReport ? (
                      <Button size="small" color="error" onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(report);
                      }}>
                        Delete
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {!loading && sortedReports.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography color="text.secondary">No reports available for this role.</Typography>
          </CardContent>
        </Card>
      ) : null}

      <ReportBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        accessToken={accessToken}
        report={editing}
        canCreate={canCreate}
        campaigns={campaigns}
        onSaved={loadReports}
      />

      <ReportAssignmentDialog
        open={assignmentOpen && canManageReport}
        onClose={() => setAssignmentOpen(false)}
        onAssigned={loadReports}
        accessToken={accessToken}
        report={selected}
        users={users}
      />

      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        accessToken={accessToken}
        report={selected}
      />

      <Dialog open={templateOpen} onClose={() => setTemplateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Report From Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="report-template-label">Template</InputLabel>
              <Select
                labelId="report-template-label"
                label="Template"
                value={templateForm.templateCode}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, templateCode: e.target.value }))}
              >
                {templates.map((item) => (
                  <MenuItem key={item.template_code} value={item.template_code}>{item.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="report-campaign-label">Campaign</InputLabel>
              <Select
                labelId="report-campaign-label"
                label="Campaign"
                value={templateForm.campaignId}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, campaignId: e.target.value }))}
              >
                {campaigns.map((item) => (
                  <MenuItem key={item.campaign_id} value={item.campaign_id}>{item.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Report Name (optional)"
              value={templateForm.name}
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFromTemplate} disabled={templateSubmitting}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
