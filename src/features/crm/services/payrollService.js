import { API_BASE_URL, apiRequest } from "../../../axious/api";

// Sprint 9 (docs/SPRINT_PLAN.md) - DeductionRule/CommissionRule are
// effective-dated policy history (payroll/models.py), not editable rows:
// "changing a rate" means creating a new rule with a later effective_from,
// never mutating an old one, so a historical PayoutRecord stays verifiable
// against the rate that actually applied when it was computed. This
// service therefore only exposes list + create, matching what the
// Settings UI actually needs (add a new rate, see the effective history).

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function fetchDeductionRules(accessToken) {
  const data = await apiRequest("/api/v1/deduction-rules/", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.results) ? data.results : [];
}

async function createDeductionRule(accessToken, { deductionType, amountPerOccurrence, currencyCode, effectiveFrom }) {
  return apiRequest("/api/v1/deduction-rules/", {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      deduction_type: deductionType,
      amount_per_occurrence: amountPerOccurrence,
      currency_code: currencyCode,
      effective_from: effectiveFrom,
    }),
  });
}

async function fetchCommissionRules(accessToken) {
  const data = await apiRequest("/api/v1/commission-rules/", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.results) ? data.results : [];
}

async function createCommissionRule(accessToken, {
  roleCode, commissionType, currencyCode, effectiveFrom, campaignId,
  flatAmount, percentageRate, tiersJson,
}) {
  return apiRequest("/api/v1/commission-rules/", {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      role_code: roleCode,
      commission_type: commissionType,
      currency_code: currencyCode,
      effective_from: effectiveFrom,
      campaign_id: campaignId || null,
      flat_amount: commissionType === "flat" ? flatAmount : null,
      percentage_rate: commissionType === "percentage" ? percentageRate : null,
      tiers_json: commissionType === "tiered" ? tiersJson : [],
    }),
  });
}

async function deactivateCommissionRule(accessToken, commissionRuleId) {
  return apiRequest(`/api/v1/commission-rules/${commissionRuleId}/`, {
    method: "PATCH",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: false }),
  });
}

async function fetchPayoutRecords(accessToken) {
  const data = await apiRequest("/api/v1/payouts/", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.results) ? data.results : [];
}

async function triggerPayoutComputation(accessToken, { periodStart, periodEnd }) {
  return apiRequest("/api/v1/payouts/compute/", {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({ period_start: periodStart, period_end: periodEnd }),
  });
}

// Sprint 10 (docs/SPRINT_PLAN.md) - Admin-only status transition; the
// server independently rejects anyone else's attempt (403), this is only
// ever called from a button that's already hidden for other roles.
async function approvePayoutRecord(accessToken, payoutRecordId) {
  return apiRequest(`/api/v1/payouts/${payoutRecordId}/approve/`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

// Sprint 10 - a real downloadable CSV/PDF payout statement. Raw fetch
// (not apiRequest, which always parses JSON) mirrors reportingService.js's
// exportReport - same blob-download pattern. Query param is deliberately
// named export_format, not format: DRF reserves ?format= to override its
// own response content negotiation, which 404s when no "csv"/"pdf"
// renderer exists (a real bug this export hit and fixed server-side).
async function exportPayoutRecord(accessToken, payoutRecordId, exportFormat = "csv") {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/payouts/${payoutRecordId}/export/?export_format=${encodeURIComponent(exportFormat)}`,
    { headers: authHeaders(accessToken) },
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Export failed.");
  }
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^\"]+)"?/i);
  const filename = match?.[1] || `payout_${payoutRecordId}.${exportFormat}`;
  const blob = await response.blob();
  return { blob, filename };
}

// Sprint 10, HR_MANAGER_GUIDE.md S4 - deduction-type occurrence counts
// for other payroll-eligible employees (never a monetary field) plus the
// tenant's docking policy read-only.
async function fetchHRPayrollOverview(accessToken, { periodStart, periodEnd } = {}) {
  const params = new URLSearchParams();
  if (periodStart) params.set("period_start", periodStart);
  if (periodEnd) params.set("period_end", periodEnd);
  const query = params.toString();
  return apiRequest(`/api/v1/payroll/hr-overview/${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

export {
  approvePayoutRecord,
  createCommissionRule,
  createDeductionRule,
  deactivateCommissionRule,
  exportPayoutRecord,
  fetchCommissionRules,
  fetchDeductionRules,
  fetchHRPayrollOverview,
  fetchPayoutRecords,
  triggerPayoutComputation,
};
