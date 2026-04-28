import { apiRequest } from "../../../axious/api";

function normalizeOnboardResponse(data) {
  if (data.verification_required) {
    return {
      verificationRequired: true,
      email: data.email,
      message: data.message,
    };
  }

  return {
    verificationRequired: false,
    tenant: {
      tenantId: data.tenant_id,
      tenantSlug: data.tenant_slug,
      companyName: data.company_name,
    },
    user: {
      userId: data.user_id,
    },
  };
}

function normalizeLoginResponse(data) {
  return {
    accessToken: data.access_token,
    user: {
      userId: data.user.user_id,
      displayName: data.user.display_name,
      email: data.user.email,
      role: data.user.role,
    },
    tenant: {
      tenantId: data.tenant.tenant_id,
      tenantSlug: data.tenant.tenant_slug,
      companyName: data.tenant.company_name,
    },
  };
}

async function onboardTenant(payload) {
  const requestBody = {
    company_name: payload.companyName,
    owner_name: payload.ownerName,
    email: payload.email,
    password: payload.password,
    company_size: payload.companySize,
    campaign_count: payload.campaignCount,
    team_size: payload.teamSize,
  };

  if (payload.verificationCode) {
    requestBody.verification_code = payload.verificationCode;
  }

  const data = await apiRequest("/api/auth/onboard-tenant", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
  return normalizeOnboardResponse(data);
}

async function loginTenant(payload) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      tenant_slug: payload.tenantSlug,
      email: payload.email,
      password: payload.password,
    }),
  });
  return normalizeLoginResponse(data);
}

async function requestPasswordReset(payload) {
  return apiRequest("/api/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({
      tenant_slug: payload.tenantSlug,
      email: payload.email,
    }),
  });
}

async function confirmPasswordReset(payload) {
  return apiRequest("/api/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify({
      tenant_slug: payload.tenantSlug,
      email: payload.email,
      code: payload.code,
      new_password: payload.newPassword,
    }),
  });
}

export { confirmPasswordReset, loginTenant, onboardTenant, requestPasswordReset };