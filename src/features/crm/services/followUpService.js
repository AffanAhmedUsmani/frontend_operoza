import { apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function fetchFollowUpTasks(accessToken) {
  const data = await apiRequest("/api/v1/follow-up-tasks/", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.results) ? data.results : [];
}

async function createFollowUpTask(accessToken, { leadId, saleId, dueAt, note }) {
  return apiRequest("/api/v1/follow-up-tasks/", {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      lead_id: leadId || undefined,
      sale_id: saleId || undefined,
      due_at: dueAt,
      note: note || "",
    }),
  });
}

async function markFollowUpTaskDone(accessToken, followUpTaskId) {
  return apiRequest(`/api/v1/follow-up-tasks/${followUpTaskId}/mark-done/`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

async function snoozeFollowUpTask(accessToken, followUpTaskId, dueAt) {
  return apiRequest(`/api/v1/follow-up-tasks/${followUpTaskId}/snooze/`, {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({ due_at: dueAt }),
  });
}

async function draftFollowUpNote(accessToken, { leadId, saleId }) {
  return apiRequest("/api/v1/follow-up-tasks/draft-note/", {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      lead_id: leadId || undefined,
      sale_id: saleId || undefined,
    }),
  });
}

export {
  createFollowUpTask,
  draftFollowUpNote,
  fetchFollowUpTasks,
  markFollowUpTaskDone,
  snoozeFollowUpTask,
};
