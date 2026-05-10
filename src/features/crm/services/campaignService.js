import { API_BASE_URL, apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function fetchCampaigns(accessToken, params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  const data = await apiRequest(`/api/crm/campaigns${suffix}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.campaigns)) return data.campaigns;
  return Array.isArray(data) ? data : [];
}

async function createCampaign(accessToken, payload) {
  return apiRequest("/api/crm/campaigns", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

async function fetchCampaignTemplates(accessToken) {
  const data = await apiRequest("/api/crm/campaign-templates", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function fetchCampaignTemplateDetail(accessToken, templateCode) {
  const data = await apiRequest(`/api/crm/campaign-templates/${templateCode}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return data.template || null;
}

async function updateCampaignSchema(accessToken, campaignId, schemaJson) {
  return apiRequest(`/api/crm/campaigns/${campaignId}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ schema_json: schemaJson }),
  });
}

async function updateCampaign(accessToken, campaignId, payload) {
  return apiRequest(`/api/crm/campaigns/${campaignId}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

async function importCampaignSheet(accessToken, { file, campaignName = "", statusCode = "draft" }) {
  const formData = new FormData();
  formData.append("file", file);
  if (campaignName.trim()) formData.append("campaign_name", campaignName.trim());
  if (statusCode.trim()) formData.append("status_code", statusCode.trim());

  const response = await fetch(`${API_BASE_URL}/api/crm/campaigns/import-sheet`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Import failed");
  }
  return data;
}

async function uploadCampaignAudio(accessToken, { file, campaignId, fieldKey, saleId = "" }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("campaign_id", campaignId);
  formData.append("field_key", fieldKey);
  if (saleId) formData.append("sale_id", saleId);

  const response = await fetch(`${API_BASE_URL}/api/crm/campaigns/audio/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Audio upload failed");
  }
  return data;
}

async function fetchCampaignAssignments(accessToken, campaignId) {
  const data = await apiRequest(`/api/crm/campaigns/${campaignId}/assignments`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function assignCampaignUsers(accessToken, campaignId, userIds, replace = true) {
  return apiRequest(`/api/crm/campaigns/${campaignId}/assignments`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ assignee_user_ids: userIds, replace }),
  });
}

async function fetchCampaignStats(accessToken, campaignId, period = "day") {
  return apiRequest(`/api/crm/campaigns/${campaignId}/stats?period=${period}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

async function deleteCampaign(accessToken, campaignId, password) {
  return apiRequest(`/api/crm/campaigns/${campaignId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ password }),
  });
}

export {
  assignCampaignUsers,
  createCampaign,
  deleteCampaign,
  fetchCampaignTemplateDetail,
  fetchCampaignTemplates,
  fetchCampaignAssignments,
  fetchCampaignStats,
  fetchCampaigns,
  importCampaignSheet,
  uploadCampaignAudio,
  updateCampaign,
  updateCampaignSchema,
};

