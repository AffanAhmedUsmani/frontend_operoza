import { API_BASE_URL, apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function checkIn(accessToken, payload = {}) {
  const response = await fetch(`${API_BASE_URL}/api/crm/attendance/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || "Check-in failed");
    err.status = response.status;
    err.attendance = data.attendance || null;
    throw err;
  }

  return data.attendance || data;
}

async function checkOut(accessToken, payload = {}) {
  const response = await fetch(`${API_BASE_URL}/api/crm/attendance/check-out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || "Check-out failed");
    err.status = response.status;
    err.attendance = data.attendance || null;
    throw err;
  }

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

  const response = await fetch(`${API_BASE_URL}/api/crm/attendance/report?${query.toString()}`, {
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
