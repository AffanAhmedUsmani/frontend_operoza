import { apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function fetchCampaigns(accessToken) {
  const data = await apiRequest("/api/crm/campaigns", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
}

async function createCampaign(accessToken, payload) {
  return apiRequest("/api/crm/campaigns", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      name: payload.name,
      schema_json: payload.schemaJson,
    }),
  });
}

export { createCampaign, fetchCampaigns };
