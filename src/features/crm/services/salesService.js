import { apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function fetchSales(accessToken, params = {}) {
  const query = new URLSearchParams();
  if (params.campaignId) query.set("campaign_id", params.campaignId);
  if (params.agentUserId) query.set("agent_user_id", params.agentUserId);
  if (params.statusCode) query.set("status_code", params.statusCode);
  if (params.q) query.set("q", params.q);
  if (params.fieldKey && params.fieldValue) {
    query.set("field_key", params.fieldKey);
    query.set("field_value", params.fieldValue);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const data = await apiRequest(`/api/crm/sales${suffix}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function createSale(accessToken, payload) {
  const data = await apiRequest("/api/crm/sales", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return data?.sale ?? data;
}

async function updateSale(accessToken, saleId, payload) {
  const data = await apiRequest(`/api/crm/sales/${saleId}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return data?.sale ?? data;
}

async function deleteSale(accessToken, saleId) {
  return apiRequest(`/api/crm/sales/${saleId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

async function requestCoachingNote(accessToken, saleId, fieldKey) {
  return apiRequest(`/api/crm/sales/${saleId}/analysis/${fieldKey}/coaching-note`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

export { createSale, deleteSale, fetchSales, requestCoachingNote, updateSale };
