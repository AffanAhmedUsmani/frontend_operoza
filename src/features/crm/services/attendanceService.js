import { apiRequest, fetchWithAuthRetry } from "../../../axious/api";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function checkIn(accessToken, payload = {}) {
  // Routed through apiRequest (not a raw fetch) so a token that expires
  // right at shift start - a realistic collision, not a corner case - gets
  // silently refreshed and retried instead of surfacing as "Check-in
  // failed" to someone who is, in fact, still logged in.
  const data = await apiRequest("/api/crm/attendance/check-in", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return data.attendance || data;
}

async function checkOut(accessToken, payload = {}) {
  const data = await apiRequest("/api/crm/attendance/check-out", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return data.attendance || data;
}

async function fetchAttendanceReport(accessToken, params = {}) {
  const query = new URLSearchParams();
  if (params.startDate) query.set("start_date", params.startDate);
  if (params.endDate) query.set("end_date", params.endDate);
  if (params.userId) query.set("user_id", params.userId);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const data = await apiRequest(`/api/crm/attendance/report${suffix}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });

  return {
    items: Array.isArray(data.items) ? data.items : [],
    summary: data.summary || {},
  };
}

async function exportAttendanceCsv(accessToken, params = {}) {
  const query = new URLSearchParams();
  query.set("format", "csv");
  if (params.startDate) query.set("start_date", params.startDate);
  if (params.endDate) query.set("end_date", params.endDate);
  if (params.userId) query.set("user_id", params.userId);

  // fetchWithAuthRetry (not a raw fetch) so a token that expires mid-export
  // gets silently refreshed and retried, same as every other authenticated
  // call - see api.js.
  const response = await fetchWithAuthRetry(`/api/crm/attendance/report?${query.toString()}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => ({}));
    throw new Error(fallback.error || "CSV export failed");
  }

  return response.text();
}

export {
  checkIn,
  checkOut,
  exportAttendanceCsv,
  fetchAttendanceReport,
};
