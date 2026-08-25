import { Fragment, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MdExpandLess, MdExpandMore, MdFileDownload } from "react-icons/md";

import { fetchTenantUsers } from "../services/adminService";
import {
  approvePayoutRecord,
  exportPayoutRecord,
  fetchPayoutRecords,
} from "../services/payrollService";

const STATUS_COLORS = {
  draft: "default",
  pending_approval: "warning",
  approved: "success",
  paid: "info",
};

// Sprint 10 (docs/SPRINT_PLAN.md) - one shared component reused across
// Admin (all employees, can approve), Team Lead (their team, view-only),
// and Agent/HR Manager (their own record only). All three get identical
// visibility rules for free by reusing the SAME fetchPayoutRecords call -
// the backend's PayoutRecordViewSet.get_queryset already scopes the
// result per role, so this component never needs its own role-based
// filtering logic, only role-based UI affordances (the Approve button).
// The Approve button hiding is UX convenience only - the real gate is the
// server-side admin-only check on the approve action itself.
export default function PayrollPanel({ accessToken, role }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [usersById, setUsersById] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRecordId, setMenuRecordId] = useState(null);

  const showEmployeeColumn = role === "admin" || role === "team_lead";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const items = await fetchPayoutRecords(accessToken);
      setRecords(items);
    } catch (err) {
      setError(err.message || "Unable to load payroll records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !showEmployeeColumn) return;
    fetchTenantUsers(accessToken)
      .then((items) => {
        const map = {};
        items.forEach((u) => { map[u.user_id] = u.display_name; });
        setUsersById(map);
      })
      .catch(() => { /* falls back to raw user_id below */ });
  }, [accessToken, showEmployeeColumn]);

  const employeeLabel = (userId) => usersById[userId] || userId;

  const handleApprove = async (payoutRecordId) => {
    setActionError("");
    try {
      const updated = await approvePayoutRecord(accessToken, payoutRecordId);
      setRecords((prev) => prev.map((r) => (r.payout_record_id === payoutRecordId ? updated : r)));
    } catch (err) {
      setActionError(err.message || "Unable to approve payout.");
    }
  };

  const openExportMenu = (event, payoutRecordId) => {
    setMenuAnchor(event.currentTarget);
    setMenuRecordId(payoutRecordId);
  };

  const handleExport = async (exportFormat) => {
    const payoutRecordId = menuRecordId;
    setMenuAnchor(null);
    setMenuRecordId(null);
    setActionError("");
    try {
      const { blob, filename } = await exportPayoutRecord(accessToken, payoutRecordId, exportFormat);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setActionError(err.message || "Export failed.");
    }
  };

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 0.5 }}>Payroll</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {role === "admin"
            ? "Every employee's computed payout, with the full base/deduction/commission breakdown."
            : role === "team_lead"
              ? "Your team's computed payouts (view-only) alongside your own."
              : "Your own computed payout, itemized by base salary, deductions, and commission."}
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={load}>Retry</Button>}>{error}</Alert> : null}
        {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress /></Stack>
        ) : records.length === 0 ? (
          <Typography color="text.secondary">No payout records yet for this period.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {showEmployeeColumn ? <TableCell>Employee</TableCell> : null}
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Base</TableCell>
                  <TableCell align="right">Deductions</TableCell>
                  <TableCell align="right">Commission</TableCell>
                  <TableCell align="right">Net</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <Fragment key={record.payout_record_id}>
                    <TableRow hover>
                      {showEmployeeColumn ? <TableCell>{employeeLabel(record.user_id)}</TableCell> : null}
                      <TableCell>{record.period_start} – {record.period_end}</TableCell>
                      <TableCell align="right">{record.base_salary_amount} {record.currency_code}</TableCell>
                      <TableCell align="right">-{record.deduction_amount} {record.currency_code}</TableCell>
                      <TableCell align="right">+{record.commission_amount} {record.currency_code}</TableCell>
                      <TableCell align="right"><strong>{record.net_amount} {record.currency_code}</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={record.status_code.replace("_", " ")}
                          size="small"
                          color={STATUS_COLORS[record.status_code] || "default"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                          {role === "admin" && record.status_code === "pending_approval" ? (
                            <Button size="small" variant="outlined" onClick={() => handleApprove(record.payout_record_id)}>
                              Approve
                            </Button>
                          ) : null}
                          <IconButton size="small" onClick={(e) => openExportMenu(e, record.payout_record_id)}>
                            <MdFileDownload />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedId(expandedId === record.payout_record_id ? null : record.payout_record_id)}
                          >
                            {expandedId === record.payout_record_id ? <MdExpandLess /> : <MdExpandMore />}
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={showEmployeeColumn ? 8 : 7} sx={{ py: 0, borderBottom: expandedId === record.payout_record_id ? undefined : "none" }}>
                        <Collapse in={expandedId === record.payout_record_id} unmountOnExit>
                          <Box sx={{ py: 1.5, px: 1 }}>
                            {record.deduction_lines.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">No deduction lines this period.</Typography>
                            ) : (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Attendance Date</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {record.deduction_lines.map((line) => (
                                    <TableRow key={line.payout_deduction_line_id}>
                                      <TableCell sx={{ textTransform: "capitalize" }}>{line.deduction_type}</TableCell>
                                      <TableCell>{line.work_date || "—"}</TableCell>
                                      <TableCell align="right">-{line.amount} {line.currency_code}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => handleExport("csv")}>Export CSV</MenuItem>
        <MenuItem onClick={() => handleExport("pdf")}>Export PDF</MenuItem>
      </Menu>
    </Card>
  );
}
