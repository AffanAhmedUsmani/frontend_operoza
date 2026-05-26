import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { executeReport } from "../../services/reportingService";
import ReportCommentsPanel from "./ReportCommentsPanel";

const STATUS_OPTIONS = ["pending", "approved", "rejected", "completed"];

function renderValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.join(", ");
    const parts = Object.entries(value)
      .slice(0, 4)
      .map(([key, item]) => `${key}: ${String(item)}`);
    return parts.join(" | ");
  }
  return String(value);
}

function normalizeUsers(users) {
  if (!Array.isArray(users)) return [];
  return users.map((u) => ({
    user_id: u?.user_id,
    display_name: u?.display_name || "",
    email_address: u?.email_address || u?.email || "",
    role_code: u?.role_code || (Array.isArray(u?.roles) ? u.roles.find((r) => r?.role_code)?.role_code : "") || "",
  }));
}

export default function ReportViewer({ accessToken, report, embedded = false, users = [] }) {
  const [data, setData] = useState(null);
  const [statusCode, setStatusCode] = useState("");
  const [agentUserId, setAgentUserId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedUsers = normalizeUsers(users);

  const runReport = async () => {
    if (!accessToken || !report?.report_id) return;
    setLoading(true);
    setError("");
    try {
      const runtimeFilters = {
        status_code: statusCode || undefined,
        agent_user_id: agentUserId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page_size: Number(pageSize) || 50,
      };
      const result = await executeReport(accessToken, report.report_id, runtimeFilters);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to execute report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(null);
    setStatusCode("");
    setAgentUserId("");
    setDateFrom("");
    setDateTo("");
    setPageSize(50);
    setError("");
  }, [report?.report_id]);

  const columns = Array.isArray(data?.columns)
    ? data.columns
        .map((col) => {
          if (typeof col === "string") {
            return { key: col, label: col, type: "text" };
          }
          if (!col || typeof col !== "object") return null;
          const key = String(col.key || "").trim();
          if (!key) return null;
          return {
            key,
            label: String(col.label || key).trim() || key,
            type: String(col.type || "text").trim().toLowerCase(),
          };
        })
        .filter(Boolean)
    : [];
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const permissions = data?.permissions || { can_comment: false, can_export: false, can_edit: false };
  const summaries = data?.summaries && typeof data.summaries === "object" ? data.summaries : {};
  const canComment = !!permissions.can_comment;

  useEffect(() => {
    if (!accessToken || !report?.report_id) return;

    const runInitialReport = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await executeReport(accessToken, report.report_id, {});
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to execute report.");
      } finally {
        setLoading(false);
      }
    };

    runInitialReport();
  }, [accessToken, report?.report_id]);

  return (
    <Stack
      direction={embedded ? { xs: "column", lg: "row" } : "column"}
      spacing={2}
      alignItems="flex-start"
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        <Stack spacing={2}>
          <Card sx={{ border: "1px solid #ead8c4" }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">{report?.name || "Report Viewer"}</Typography>
                {report?.description ? <Typography color="text.secondary">{report.description}</Typography> : null}

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                  <FormControl fullWidth>
                    <InputLabel id="report-filter-status">Status</InputLabel>
                    <Select
                      labelId="report-filter-status"
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

                  <FormControl fullWidth>
                    <InputLabel id="report-filter-agent">Assigned User</InputLabel>
                    <Select
                      labelId="report-filter-agent"
                      label="Assigned User"
                      value={agentUserId}
                      onChange={(event) => setAgentUserId(event.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {normalizedUsers.map((user) => (
                        <MenuItem key={user.user_id} value={user.user_id}>
                          {user.display_name || user.email_address || user.user_id}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

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
                  <TextField
                    type="number"
                    label="Page Size"
                    value={pageSize}
                    onChange={(event) => setPageSize(event.target.value)}
                    inputProps={{ min: 1, max: 500 }}
                    fullWidth
                  />
                </Stack>

                <Box>
                  <Button variant="contained" onClick={runReport} disabled={loading}>
                    {loading ? "Running..." : "Run Report"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {data ? (
            <Card sx={{ border: "1px solid #ead8c4" }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1">Result</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rows: {rows.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Permissions: can_comment={String(!!permissions.can_comment)}, can_export={String(!!permissions.can_export)}, can_edit={String(!!permissions.can_edit)}
                  </Typography>

                  <Divider />

                  {Object.keys(summaries).length ? (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Summaries</Typography>
                      {Object.entries(summaries).map(([key, value]) => (
                        <Typography key={key} variant="body2">{key}: {renderValue(value)}</Typography>
                      ))}
                    </Box>
                  ) : null}

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {columns.map((col) => (
                            <TableCell key={col.key}>{col.label}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {columns.map((col) => (
                              <TableCell key={`${idx}-${col.key}`}>{renderValue(row?.[col.key])}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      </Box>

      {report?.report_id ? (
        <Box sx={{ width: embedded ? { xs: "100%", lg: 400 } : "100%", flexShrink: 0 }}>
          <ReportCommentsPanel
            accessToken={accessToken}
            reportId={report?.report_id}
            canComment={canComment}
          />
        </Box>
      ) : null}
    </Stack>
  );
}
