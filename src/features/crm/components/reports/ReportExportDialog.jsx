import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { exportReport } from "../../services/reportingService";

const STATUS_OPTIONS = ["pending", "approved", "rejected", "completed"];

export default function ReportExportDialog({ open, onClose, accessToken, report }) {
  const [format, setFormat] = useState("csv");
  const [statusCode, setStatusCode] = useState("");
  const [agentUserId, setAgentUserId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDownload = async () => {
    if (!accessToken || !report?.report_id) return;
    setSubmitting(true);
    setError("");
    setInfo("");
    try {
      const runtimeFilters = {
        status_code: statusCode || undefined,
        agent_user_id: agentUserId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      const result = await exportReport(accessToken, report.report_id, format, runtimeFilters);
      if (result.kind === "job_pending") {
        setInfo(result.message || "Export queued.");
        return;
      }

      const downloadUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      setInfo("Export file generated successfully.");
    } catch (err) {
      setError(err.message || "Export failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Export Report</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {report?.name ? (
            <Typography variant="body2" color="text.secondary">
              Report: {report.name}
            </Typography>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {info ? <Alert severity="info">{info}</Alert> : null}
          <FormControl fullWidth>
            <InputLabel id="export-format-label">Format</InputLabel>
            <Select
              labelId="export-format-label"
              label="Format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">XLSX</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="export-filter-status">Status</InputLabel>
            <Select
              labelId="export-filter-status"
              label="Status"
              value={statusCode}
              onChange={(event) => setStatusCode(event.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {STATUS_OPTIONS.map((entry) => (
                <MenuItem key={entry} value={entry}>{entry}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Assigned User ID (optional)"
            value={agentUserId}
            onChange={(event) => setAgentUserId(event.target.value)}
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
            <TextField
              type="date"
              label="Date From"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="date"
              label="Date To"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Selected format: {format}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handleDownload} disabled={submitting || !report?.report_id}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}
