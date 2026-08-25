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
    refreshToken: data.refresh_token,
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
      // Sprint 19 (docs/SPRINT_PLAN.md), general guide S12 - "the
      // frontend theme provider reads this at login."
      brandPrimaryColor: data.tenant.brand_primary_color || "",
      brandSecondaryColor: data.tenant.brand_secondary_color || "",
      brandBackgroundColor: data.tenant.brand_background_color || "",
      brandSurfaceColor: data.tenant.brand_surface_color || "",
      brandLogoUrl: data.tenant.brand_logo_url || "",
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

async function restoreTenant(payload) {
  // Sprint 18 (docs/SPRINT_PLAN.md) - "I'm a returning customer restoring
  // a previous portal", alongside onboardTenant's "create a new
  // workspace" path. Uses FormData (not JSON) since it carries a file.
  const formData = new FormData();
  formData.append("company_name", payload.companyName);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("dump_file", payload.dumpFile);

  const data = await apiRequest("/api/auth/restore-tenant", {
    method: "POST",
    body: formData,
  });

  return {
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

async function fetchPublicTenantBranding(tenantSlug) {
  // Post-Sprint-20 - the per-tenant login screen needs a tenant's colors
  // and logo before any session/token exists (GET /api/auth/login itself
  // is a POST, and returns branding only on success). Unauthenticated by
  // design (see iam/views.py:public_tenant_branding) - a 404 for an
  // unknown slug is treated as "no branding", never surfaced as an error,
  // since the login page itself has nothing useful to say about it.
  try {
    const data = await apiRequest(`/api/auth/public/branding?tenant_slug=${encodeURIComponent(tenantSlug)}`, {
      method: "GET",
    });
    return {
      companyName: data.company_name || "",
      brandPrimaryColor: data.brand_primary_color || "",
      brandSecondaryColor: data.brand_secondary_color || "",
      brandBackgroundColor: data.brand_background_color || "",
      brandSurfaceColor: data.brand_surface_color || "",
      brandLogoUrl: data.brand_logo_url || "",
    };
  } catch (_) {
    return null;
  }
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

// "I forgot my workspace URL" recovery - deliberately takes no
// tenant_slug (unlike requestPasswordReset above), since the whole
// point is the caller doesn't know it. Always resolves with the same
// generic message regardless of whether the email matched anything -
// the backend enforces that (iam/views.py's request_workspace_recovery),
// this just never asks for or displays a matched/not-matched result.
async function requestWorkspaceRecovery(email) {
  return apiRequest("/api/auth/workspace-recovery/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export {
  confirmPasswordReset,
  fetchPublicTenantBranding,
  loginTenant,
  onboardTenant,
  requestPasswordReset,
  requestWorkspaceRecovery,
  restoreTenant,
};