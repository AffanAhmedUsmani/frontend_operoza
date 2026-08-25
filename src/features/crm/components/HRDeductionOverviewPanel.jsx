import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { fetchHRPayrollOverview } from "../services/payrollService";

/**
 * Sprint 10 (docs/SPRINT_PLAN.md), HR_MANAGER_GUIDE.md S4 - HR Manager's
 * deliberately narrow cross-employee view: occurrence counts by
 * deduction type for every OTHER employee, and the tenant's docking
 * policy read-only. This intentionally never renders an amount/currency
 * for another employee - the backend response itself carries no such
 * field for cross-employee rows (verified by payroll's own test suite),
 * so there is nothing here to accidentally expose even if this component
 * tried to.
 */
export default function HRDeductionOverviewPanel({ accessToken }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    fetchHRPayrollOverview(accessToken)
      .then(setOverview)
      .catch((err) => setError(err.message || "Unable to load payroll overview."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress /></Stack>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!overview) {
    return null;
  }

  return (
    <Stack spacing={3}>
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Docking Policy</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The tenant's current late/absence deduction rates, configured by Admin.
          </Typography>
          {overview.deduction_rules.length === 0 ? (
            <Typography color="text.secondary">No docking policy configured yet.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Effective From</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overview.deduction_rules.map((rule) => (
                    <TableRow key={rule.deduction_rule_id} hover>
                      <TableCell sx={{ textTransform: "capitalize" }}>{rule.deduction_type}</TableCell>
                      <TableCell>{rule.amount_per_occurrence} {rule.currency_code}</TableCell>
                      <TableCell>{rule.effective_from}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Attendance Deduction Counts</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {overview.period_start} to {overview.period_end}. Occurrence counts only — no pay amount is ever shown here for
            another employee. Your own full payroll breakdown is on the Payroll tab.
          </Typography>
          {overview.employee_deduction_counts.length === 0 ? (
            <Typography color="text.secondary">No other payroll-eligible employees found for this period.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell align="right">Late</TableCell>
                    <TableCell align="right">Absence</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overview.employee_deduction_counts.map((entry) => (
                    <TableRow key={entry.user_id} hover>
                      <TableCell>{entry.display_name}</TableCell>
                      <TableCell align="right">{entry.late_count}</TableCell>
                      <TableCell align="right">{entry.absence_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
