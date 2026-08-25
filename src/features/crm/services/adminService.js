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
  // Sprint 9 (docs/SPRINT_PLAN.md) - only sent when the caller actually
  // filled it in; the backend independently rejects it for a role that
  // isn't payroll-eligible, so no client-side role check is duplicated here.
  if (payload.baseSalaryAmount) formData.append("base_salary_amount", payload.baseSalaryAmount);

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

async function fetchAllowedNetworks(accessToken) {
  const data = await apiRequest("/api/auth/admin/network-access", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function createAllowedNetwork(accessToken, { label, cidr }) {
  return apiRequest("/api/auth/admin/network-access", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ label, cidr }),
  });
}

async function deleteAllowedNetwork(accessToken, allowedNetworkId) {
  return apiRequest(`/api/auth/admin/network-access/${allowedNetworkId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

async function fetchCurrentClientIp(accessToken) {
  const data = await apiRequest("/api/auth/admin/network-access/current-ip", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return data.ip || "";
}

async function fetchTenantUsage(accessToken) {
  return apiRequest("/api/auth/admin/usage", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

async function fetchSupportedCurrencies(accessToken) {
  const data = await apiRequest("/api/auth/admin/currencies", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function fetchCurrencySettings(accessToken) {
  return apiRequest("/api/auth/admin/currency-settings", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

async function updateCurrencySettings(accessToken, { defaultCurrencyCode, payrollCurrencyCode } = {}) {
  const body = {};
  if (defaultCurrencyCode !== undefined) body.default_currency_code = defaultCurrencyCode;
  if (payrollCurrencyCode !== undefined) body.payroll_currency_code = payrollCurrencyCode;
  return apiRequest("/api/auth/admin/currency-settings", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
}

async function fetchBranding(accessToken) {
  return apiRequest("/api/auth/admin/branding", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

async function updateBranding(accessToken, { primaryColor, secondaryColor, backgroundColor, surfaceColor, logo, removeLogo } = {}) {
  const formData = new FormData();
  if (primaryColor !== undefined) formData.append("brand_primary_color", primaryColor);
  if (secondaryColor !== undefined) formData.append("brand_secondary_color", secondaryColor);
  if (backgroundColor !== undefined) formData.append("brand_background_color", backgroundColor);
  if (surfaceColor !== undefined) formData.append("brand_surface_color", surfaceColor);
  if (logo) formData.append("logo", logo);
  if (removeLogo) formData.append("remove_logo", "true");

  return apiRequest("/api/auth/admin/branding", {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
}

async function fetchDataExports(accessToken) {
  const data = await apiRequest("/api/auth/admin/data-export", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function requestDataExport(accessToken) {
  return apiRequest("/api/auth/admin/data-export", {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

async function fetchAuditLog(accessToken) {
  const data = await apiRequest("/api/auth/admin/audit-log", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  return Array.isArray(data.items) ? data.items : [];
}

export {
  assignRoleToTenantUser,
  createAllowedNetwork,
  createTenantUser,
  deleteAllowedNetwork,
  deleteTenantUser,
  fetchAllowedNetworks,
  fetchAuditLog,
  fetchBranding,
  fetchCurrencySettings,
  fetchCurrentClientIp,
  fetchDataExports,
  fetchSupportedCurrencies,
  fetchTenantRoles,
  fetchTenantUsage,
  fetchTenantUsers,
  getTenantUser,
  requestDataExport,
  toggleTenantRole,
  updateBranding,
  updateCurrencySettings,
  updateTenantUser,
};
