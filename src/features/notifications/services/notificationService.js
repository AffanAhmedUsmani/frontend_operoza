import { apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function fetchNotifications(accessToken, { category } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const query = params.toString();
  const data = await apiRequest(`/api/v1/notifications/${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.results) ? data.results : [];
}

async function fetchUnreadCount(accessToken) {
  const data = await apiRequest("/api/v1/notifications/unread-count/", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return data.unread_count || 0;
}

async function markNotificationRead(accessToken, recipientId) {
  return apiRequest(`/api/v1/notifications/${recipientId}/mark-read/`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

async function markAllNotificationsRead(accessToken) {
  return apiRequest("/api/v1/notifications/mark-all-read/", {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

async function fetchNotificationPreferences(accessToken) {
  const data = await apiRequest("/api/v1/notification-preferences/", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.results) ? data.results : [];
}

async function updateNotificationPreference(accessToken, { category, emailEnabled, inAppEnabled, digestMode }) {
  return apiRequest("/api/v1/notification-preferences/", {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      category, email_enabled: emailEnabled, in_app_enabled: inAppEnabled, digest_mode: digestMode,
    }),
  });
}

export {
  fetchNotificationPreferences,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreference,
};
