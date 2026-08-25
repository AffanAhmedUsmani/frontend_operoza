import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
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

import { useCampaigns } from "../hooks/useCampaigns";
import {
  createCommissionRule,
  createDeductionRule,
  fetchCommissionRules,
  fetchDeductionRules,
} from "../services/payrollService";

const DEDUCTION_TYPES = [
  { value: "late", label: "Late" },
  { value: "absence", label: "Absence" },
];

const COMMISSION_TYPES = [
  { value: "flat", label: "Flat (per won sale)" },
  { value: "percentage", label: "Percentage of sales" },
  { value: "tiered", label: "Tiered (by total sales)" },
];

const COMMISSION_ROLES = [
  { value: "agent", label: "Agent" },
  { value: "team_lead", label: "Team Lead" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Sprint 9 (docs/SPRINT_PLAN.md), general guide S10 - Admin-only Settings
 * screen for the two payroll policies: the tenant-wide late/absence
 * docking rate, and commission rules (flat/percentage/tiered,
 * campaign/role-scoped). Both are effective-dated history in the backend
 * (payroll/models.py) - "editing" a rate means adding a new one with a
 * later effective_from, so this UI only ever adds rows and lists the
 * existing history, never mutates a past rule in place.
 */
export default function PayrollSettingsPanel({ accessToken }) {
  const { campaigns } = useCampaigns(accessToken);

  const [deductionRules, setDeductionRules] = useState([]);
  const [deductionForm, setDeductionForm] = useState({
    deductionType: "late",
    amountPerOccurrence: "",
    currencyCode: "USD",
    effectiveFrom: todayIso(),
  });
  const [deductionError, setDeductionError] = useState("");
  const [deductionSuccess, setDeductionSuccess] = useState("");

  const [commissionRules, setCommissionRules] = useState([]);
  const [commissionForm, setCommissionForm] = useState({
    roleCode: "agent",
    campaignId: "",
    commissionType: "percentage",
    flatAmount: "",
    percentageRate: "",
    tiersJson: [],
    currencyCode: "USD",
    effectiveFrom: todayIso(),
  });
  const [commissionError, setCommissionError] = useState("");
  const [commissionSuccess, setCommissionSuccess] = useState("");

  const loadPolicies = async () => {
    try {
      const [deductionItems, commissionItems] = await Promise.all([
        fetchDeductionRules(accessToken),
        fetchCommissionRules(accessToken),
      ]);
      setDeductionRules(deductionItems);
      setCommissionRules(commissionItems);
    } catch (error) {
      setDeductionError(error.message || "Unable to load payroll policy.");
    }
  };

  useEffect(() => {
    if (accessToken) loadPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleAddDeductionRule = async (event) => {
    event.preventDefault();
    setDeductionError("");
    setDeductionSuccess("");
    try {
      const created = await createDeductionRule(accessToken, deductionForm);
      setDeductionRules((prev) => [created, ...prev]);
      setDeductionSuccess("Docking rate saved.");
      setDeductionForm((prev) => ({ ...prev, amountPerOccurrence: "" }));
    } catch (error) {
      setDeductionError(error.message || "Unable to save docking rate.");
    }
  };

  const handleAddCommissionRule = async (event) => {
    event.preventDefault();
    setCommissionError("");
    setCommissionSuccess("");
    try {
      const created = await createCommissionRule(accessToken, commissionForm);
      setCommissionRules((prev) => [created, ...prev]);
      setCommissionSuccess("Commission rule saved.");
      setCommissionForm((prev) => ({ ...prev, flatAmount: "", percentageRate: "" }));
    } catch (error) {
      setCommissionError(error.message || "Unable to save commission rule.");
    }
  };

  const campaignName = (campaignId) =>
    campaigns.find((c) => c.campaign_id === campaignId)?.name || "All campaigns";

  return (
    <Stack spacing={3}>
      {/* Docking policy */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Docking Policy</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            One tenant-wide late/absence deduction rate, applied per dockable day per general guide S10.
            Saving a new rate does not change how already-computed payouts were docked.
          </Typography>

          {deductionError ? <Alert severity="error" sx={{ mb: 2 }}>{deductionError}</Alert> : null}
          {deductionSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{deductionSuccess}</Alert> : null}

          <Stack component="form" spacing={1.5} onSubmit={handleAddDeductionRule} sx={{ mb: 3 }}>
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(4, minmax(0, 1fr))" } }}>
              <TextField
                label="Type" select fullWidth value={deductionForm.deductionType}
                onChange={(e) => setDeductionForm((p) => ({ ...p, deductionType: e.target.value }))}
              >
                {DEDUCTION_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <TextField
                label="Amount per occurrence" type="number" fullWidth required
                inputProps={{ min: 0, step: "0.01" }}
                value={deductionForm.amountPerOccurrence}
                onChange={(e) => setDeductionForm((p) => ({ ...p, amountPerOccurrence: e.target.value }))}
              />
              <TextField
                label="Currency" fullWidth value={deductionForm.currencyCode}
                onChange={(e) => setDeductionForm((p) => ({ ...p, currencyCode: e.target.value.toUpperCase().slice(0, 10) }))}
              />
              <TextField
                label="Effective from" type="date" fullWidth
                InputLabelProps={{ shrink: true }}
                value={deductionForm.effectiveFrom}
                onChange={(e) => setDeductionForm((p) => ({ ...p, effectiveFrom: e.target.value }))}
              />
            </Box>
            <Box>
              <Button type="submit" variant="contained" disabled={!deductionForm.amountPerOccurrence}>
                Save Rate
              </Button>
            </Box>
          </Stack>

          {deductionRules.length === 0 ? (
            <Typography color="text.secondary">No docking rates configured yet.</Typography>
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
                  {deductionRules.map((rule) => (
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

      {/* Commission rules */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Commission Rules</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Flat, percentage, or tiered commission for Agent or Team Lead, optionally scoped to one campaign.
            A campaign-specific rule always takes priority over a role-wide one.
          </Typography>

          {commissionError ? <Alert severity="error" sx={{ mb: 2 }}>{commissionError}</Alert> : null}
          {commissionSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{commissionSuccess}</Alert> : null}

          <Stack component="form" spacing={1.5} onSubmit={handleAddCommissionRule} sx={{ mb: 3 }}>
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
              <TextField
                label="Role" select fullWidth value={commissionForm.roleCode}
                onChange={(e) => setCommissionForm((p) => ({ ...p, roleCode: e.target.value }))}
              >
                {COMMISSION_ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </TextField>
              <TextField
                label="Campaign" select fullWidth value={commissionForm.campaignId}
                onChange={(e) => setCommissionForm((p) => ({ ...p, campaignId: e.target.value }))}
              >
                <MenuItem value="">All campaigns</MenuItem>
                {campaigns.map((c) => <MenuItem key={c.campaign_id} value={c.campaign_id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField
                label="Commission type" select fullWidth value={commissionForm.commissionType}
                onChange={(e) => setCommissionForm((p) => ({ ...p, commissionType: e.target.value }))}
              >
                {COMMISSION_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>

              {commissionForm.commissionType === "flat" ? (
                <TextField
                  label="Flat amount per won sale" type="number" fullWidth required
                  inputProps={{ min: 0, step: "0.01" }}
                  value={commissionForm.flatAmount}
                  onChange={(e) => setCommissionForm((p) => ({ ...p, flatAmount: e.target.value }))}
                />
              ) : null}
              {commissionForm.commissionType === "percentage" ? (
                <TextField
                  label="Percentage rate (%)" type="number" fullWidth required
                  inputProps={{ min: 0, step: "0.001" }}
                  value={commissionForm.percentageRate}
                  onChange={(e) => setCommissionForm((p) => ({ ...p, percentageRate: e.target.value }))}
                />
              ) : null}
              {commissionForm.commissionType === "tiered" ? (
                <TextField
                  label="Tiers (min,max,rate% per line)" fullWidth multiline minRows={2} required
                  placeholder={"0,10000,5\n10000,,10"}
                  helperText="One tier per line: min_amount,max_amount,rate_percentage (blank max = no upper bound)"
                  value={commissionForm.tiersJson.map((t) => `${t.min_amount},${t.max_amount ?? ""},${t.rate_percentage}`).join("\n")}
                  onChange={(e) => {
                    const tiers = e.target.value.split("\n").map((line) => {
                      const [min, max, rate] = line.split(",").map((v) => v.trim());
                      return { min_amount: min || "0", max_amount: max || null, rate_percentage: rate || "0" };
                    }).filter((t) => t.min_amount !== "" || t.rate_percentage !== "0");
                    setCommissionForm((p) => ({ ...p, tiersJson: tiers }));
                  }}
                />
              ) : null}

              <TextField
                label="Currency" fullWidth value={commissionForm.currencyCode}
                onChange={(e) => setCommissionForm((p) => ({ ...p, currencyCode: e.target.value.toUpperCase().slice(0, 10) }))}
              />
              <TextField
                label="Effective from" type="date" fullWidth
                InputLabelProps={{ shrink: true }}
                value={commissionForm.effectiveFrom}
                onChange={(e) => setCommissionForm((p) => ({ ...p, effectiveFrom: e.target.value }))}
              />
            </Box>
            <Box>
              <Button type="submit" variant="contained">Save Commission Rule</Button>
            </Box>
          </Stack>

          {commissionRules.length === 0 ? (
            <Typography color="text.secondary">No commission rules configured yet.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Effective From</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissionRules.map((rule) => (
                    <TableRow key={rule.commission_rule_id} hover>
                      <TableCell sx={{ textTransform: "capitalize" }}>{rule.role_code.replace("_", " ")}</TableCell>
                      <TableCell>{rule.campaign_id ? campaignName(rule.campaign_id) : "All campaigns"}</TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>{rule.commission_type}</TableCell>
                      <TableCell>
                        {rule.commission_type === "flat" && `${rule.flat_amount} ${rule.currency_code} / sale`}
                        {rule.commission_type === "percentage" && `${rule.percentage_rate}%`}
                        {rule.commission_type === "tiered" && `${(rule.tiers_json || []).length} tier(s)`}
                      </TableCell>
                      <TableCell>{rule.effective_from}</TableCell>
                      <TableCell>{rule.is_active ? "Yes" : "No"}</TableCell>
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
