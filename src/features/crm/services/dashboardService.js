import { apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

// ── Dashboards ────────────────────────────────────────────────────────────────

export async function fetchDashboards(accessToken, { campaignId } = {}) {
  const params = new URLSearchParams();
  if (campaignId) params.set("campaign_id", campaignId);
  const qs = params.toString() ? `?${params}` : "";
  const data = await apiRequest(`/api/crm/dashboards${qs}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

export async function createDashboard(accessToken, payload) {
  return apiRequest("/api/crm/dashboards", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function updateDashboard(accessToken, dashboardId, payload) {
  return apiRequest(`/api/crm/dashboards/${dashboardId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function deleteDashboard(accessToken, dashboardId) {
  return apiRequest(`/api/crm/dashboards/${dashboardId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

export async function fetchDashboardDetail(accessToken, dashboardId) {
  return apiRequest(`/api/crm/dashboards/${dashboardId}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

// ── Dashboard Data (compute) ──────────────────────────────────────────────────

export async function fetchDashboardData(accessToken, dashboardId, { dateFrom, dateTo } = {}) {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  const qs = params.toString() ? `?${params}` : "";
  return apiRequest(`/api/crm/dashboards/${dashboardId}/data${qs}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

// ── Widgets ───────────────────────────────────────────────────────────────────

export async function createWidget(accessToken, dashboardId, payload) {
  return apiRequest(`/api/crm/dashboards/${dashboardId}/widgets`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function updateWidget(accessToken, dashboardId, widgetId, payload) {
  return apiRequest(`/api/crm/dashboards/${dashboardId}/widgets/${widgetId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function deleteWidget(accessToken, dashboardId, widgetId) {
  return apiRequest(`/api/crm/dashboards/${dashboardId}/widgets/${widgetId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

// ── MetricDefinitions ─────────────────────────────────────────────────────────

export async function fetchMetricDefinitions(accessToken) {
  const data = await apiRequest("/api/crm/metric-definitions", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

export async function createMetricDefinition(accessToken, payload) {
  return apiRequest("/api/crm/metric-definitions", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function deleteMetricDefinition(accessToken, metricId) {
  return apiRequest(`/api/crm/metric-definitions/${metricId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}
