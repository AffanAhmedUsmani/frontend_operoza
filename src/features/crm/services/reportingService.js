import { apiRequest } from "../../../axious/api";
import { API_BASE_URL } from "../../../axious/api";

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function listReports(accessToken) {
  const data = await apiRequest("/api/crm/reports", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

export async function createReport(accessToken, payload) {
  return apiRequest("/api/crm/reports", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function createReportFromTemplate(accessToken, payload) {
  return apiRequest("/api/crm/reports/from-template", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function getReport(accessToken, reportId) {
  return apiRequest(`/api/crm/reports/${reportId}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

export async function updateReport(accessToken, reportId, payload) {
  return apiRequest(`/api/crm/reports/${reportId}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function deleteReport(accessToken, reportId) {
  return apiRequest(`/api/crm/reports/${reportId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

export async function executeReport(accessToken, reportId, runtimeFilters = {}) {
  return apiRequest(`/api/crm/reports/${reportId}/execute`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ runtime_filters: runtimeFilters }),
  });
}

export async function summarizeReport(accessToken, reportId, runtimeFilters = {}) {
  return apiRequest(`/api/crm/reports/${reportId}/summarize`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ runtime_filters: runtimeFilters }),
  });
}

export async function updateReportSchedule(accessToken, reportId, payload) {
  return apiRequest(`/api/crm/reports/${reportId}/schedule`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function validateReportConfig(accessToken, payload) {
  return apiRequest("/api/crm/reports/validate-config", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function previewReport(accessToken, payload) {
  return apiRequest("/api/crm/reports/preview", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function listReportTemplates(accessToken) {
  const data = await apiRequest("/api/crm/report-templates", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

export async function listReportAssignments(accessToken, reportId) {
  const data = await apiRequest(`/api/crm/reports/${reportId}/assignments`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

export async function assignReport(accessToken, reportId, payload) {
  return apiRequest(`/api/crm/reports/${reportId}/assignments`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function listReportComments(accessToken, reportId) {
  const data = await apiRequest(`/api/crm/reports/${reportId}/comments`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

export async function createReportComment(accessToken, reportId, payload) {
  return apiRequest(`/api/crm/reports/${reportId}/comments`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function exportReport(accessToken, reportId, format, runtimeFilters = {}) {
  const normalizedFormat = String(format || "").trim().toLowerCase();
  const response = await fetch(`${API_BASE_URL}/api/crm/reports/${reportId}/export?format=${encodeURIComponent(normalizedFormat)}`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ runtime_filters: runtimeFilters }),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => ({})) : null;

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Export failed");
  }

  if (response.status === 202 || isJson) {
    return {
      kind: "job_pending",
      message: payload?.message || "Export queued.",
      job: payload?.job || null,
    };
  }

  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^\"]+)"?/i);
  const filename = match?.[1] || `report_${reportId}.${normalizedFormat || "csv"}`;

  const blob = await response.blob();
  return {
    kind: "file",
    blob,
    filename,
  };
}
