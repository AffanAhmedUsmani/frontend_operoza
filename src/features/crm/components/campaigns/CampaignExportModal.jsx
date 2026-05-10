import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import * as XLSX from "xlsx";
import { fetchCampaignStats } from "../../services/campaignService";

function buildRows(campaign, todaySales, monthSales) {
  const assignedUsers = Array.isArray(campaign?.assigned_users) ? campaign.assigned_users : [];
  return assignedUsers.map((u) => ({
    team_member: u.display_name || u.email || "—",
    member_email: u.email || "—",
    member_role: u.role_code || "—",
    campaign_name: campaign?.name || "",
    status_code: campaign?.status_code || "draft",
    today_sales: todaySales,
    month_sales: monthSales,
  }));
}

export default function CampaignExportModal({ open, campaign, accessToken, onClose }) {
  const [todaySales, setTodaySales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState({
    team_member: true,
    member_email: true,
    member_role: true,
    campaign_name: true,
    status_code: true,
    today_sales: true,
    month_sales: true,
  });

  useEffect(() => {
    if (!open || !campaign || !accessToken) return;
    setLoading(true);
    setError("");
    Promise.all([
      fetchCampaignStats(accessToken, campaign.campaign_id, "day"),
      fetchCampaignStats(accessToken, campaign.campaign_id, "month"),
    ])
      .then(([d, m]) => {
        setTodaySales(Number(d?.total || 0));
        setMonthSales(Number(m?.total || 0));
      })
      .catch((err) => setError(err.message || "Failed to load sales stats for export."))
      .finally(() => setLoading(false));
  }, [open, campaign, accessToken]);

  const rows = useMemo(() => buildRows(campaign, todaySales, monthSales), [campaign, todaySales, monthSales]);

  const filteredRows = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.team_member, r.member_email, r.member_role].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, teamSearch]);

  const allColumns = [
    ["team_member", "Team Member"],
    ["member_email", "Email"],
    ["member_role", "Role"],
    ["campaign_name", "Campaign"],
    ["status_code", "Status"],
    ["today_sales", "Today Sales"],
    ["month_sales", "Month Sales"],
  ];

  const activeColumns = allColumns.filter(([key]) => selectedColumns[key]);

  const exportToExcel = () => {
    const data = filteredRows.map((r) => {
      const obj = {};
      activeColumns.forEach(([key, label]) => {
        obj[label] = r[key];
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(data.length ? data : [Object.fromEntries(activeColumns.map(([, label]) => [label, ""]))]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");
    const safeName = (campaign?.name || "campaign").replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 30);
    XLSX.writeFile(wb, `${safeName}_export.xlsx`);
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Export Campaign Data</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Use filters and column selection, preview the table, then export to Excel.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField
              label="Filter team member / email / role"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              fullWidth
            />
            <Typography variant="body2" sx={{ minWidth: 220 }}>
              Today: <strong>{todaySales}</strong> | Month: <strong>{monthSales}</strong>
            </Typography>
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Columns</Typography>
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
              {allColumns.map(([key, label]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      size="small"
                      checked={!!selectedColumns[key]}
                      onChange={(e) => setSelectedColumns((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                  }
                  label={label}
                />
              ))}
            </Stack>
          </Box>

          <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: 360 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {activeColumns.map(([key, label]) => (
                    <TableCell key={key} sx={{ fontWeight: 700 }}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(1, activeColumns.length)}>Loading...</TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(1, activeColumns.length)}>
                      No rows matched your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, idx) => (
                    <TableRow key={`${row.member_email}-${idx}`}>
                      {activeColumns.map(([key]) => (
                        <TableCell key={key}>{String(row[key] ?? "")}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={exportToExcel} disabled={activeColumns.length === 0}>
          Export Excel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
