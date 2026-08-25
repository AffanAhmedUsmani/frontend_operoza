import { apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function fetchConversations(accessToken) {
  const data = await apiRequest("/api/v1/conversations/", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.results) ? data.results : [];
}

async function fetchContacts(accessToken) {
  const data = await apiRequest("/api/v1/conversations/contacts/", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data) ? data : [];
}

async function startDirectConversation(accessToken, targetUserId) {
  return apiRequest("/api/v1/conversations/start-direct/", {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({ target_user_id: targetUserId }),
  });
}

async function fetchMessages(accessToken, conversationId) {
  const data = await apiRequest(`/api/v1/conversations/${conversationId}/messages/`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.results) ? data.results : [];
}

async function postMessage(accessToken, conversationId, { body, sharedRecordType, sharedRecordId }) {
  return apiRequest(`/api/v1/conversations/${conversationId}/messages/`, {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      body: body || "",
      shared_record_type: sharedRecordType || undefined,
      shared_record_id: sharedRecordId || undefined,
    }),
  });
}

async function markConversationRead(accessToken, conversationId) {
  return apiRequest(`/api/v1/conversations/${conversationId}/mark-read/`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

async function fetchSharedRecord(accessToken, messageId) {
  return apiRequest(`/api/v1/messages/${messageId}/shared-record/`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

export {
  fetchContacts,
  fetchConversations,
  fetchMessages,
  fetchSharedRecord,
  markConversationRead,
  postMessage,
  startDirectConversation,
};
