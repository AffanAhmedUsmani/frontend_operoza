import { apiRequest } from "../../../axious/api";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function fetchTenantRoles(accessToken) {
  const data = await apiRequest("/api/auth/admin/roles", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function fetchTenantUsers(accessToken) {
  const data = await apiRequest("/api/auth/admin/users", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function createTenantUser(accessToken, payload) {
  // Use FormData to support optional photo upload
  const formData = new FormData();
  formData.append("display_name", payload.displayName);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("role_code", payload.roleCode);
  if (payload.phoneNumber) formData.append("phone_number", payload.phoneNumber);
  if (payload.photo) formData.append("photo", payload.photo);

  return apiRequest("/api/auth/admin/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
}

async function assignRoleToTenantUser(accessToken, payload) {
  return apiRequest("/api/auth/admin/roles/assign", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      target_user_id: payload.targetUserId,
      role_code: payload.roleCode,
    }),
  });
}

async function toggleTenantRole(accessToken, roleCode, enabled) {
  return apiRequest("/api/auth/admin/roles/enable", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ role_code: roleCode, enabled }),
  });
}

async function getTenantUser(accessToken, userId) {
  return apiRequest(`/api/auth/admin/users/${userId}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

async function updateTenantUser(accessToken, userId, payload) {
  // Use FormData to support optional photo replacement
  const formData = new FormData();
  if (payload.displayName !== undefined) formData.append("display_name", payload.displayName);
  if (payload.phoneNumber !== undefined) formData.append("phone_number", payload.phoneNumber);
  if (payload.accountStatusCode !== undefined) formData.append("account_status_code", payload.accountStatusCode);
  if (payload.password) formData.append("password", payload.password);
  if (payload.photo) formData.append("photo", payload.photo);

  return apiRequest(`/api/auth/admin/users/${userId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
}

async function deleteTenantUser(accessToken, userId) {
  return apiRequest(`/api/auth/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

export {
  assignRoleToTenantUser,
  createTenantUser,
  deleteTenantUser,
  fetchTenantRoles,
  fetchTenantUsers,
  getTenantUser,
  toggleTenantRole,
  updateTenantUser,
};
