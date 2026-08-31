import { clearSession, loadSession, saveSession } from "../features/auth/utils/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const NORMALIZED_API_BASE_URL = String(API_BASE_URL || "").trim().replace(/\/+$/, "");

function buildApiUrl(path) {
	const normalizedPath = String(path || "").trim();
	if (/^https?:\/\//i.test(normalizedPath)) {
		return normalizedPath;
	}
	return `${NORMALIZED_API_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
}

// Sprint 2 (docs/SPRINT_PLAN.md) - centralized request wrapper.
//
// This is new infrastructure, not a modification: before this, every
// service file attached its own Authorization header per call with no
// central place a 401 was ever caught, so a stale/expired token just left
// every screen failing silently while the user still looked "logged in".
//
// A single in-flight refresh promise is shared across concurrent requests,
// so if several calls 401 at once (a common reload/mount pattern), only one
// refresh attempt actually happens - the rest await the same promise.
let refreshInFlight = null;

async function performRefresh() {
	const session = loadSession();
	if (!session?.refreshToken) {
		return null;
	}

	try {
		const response = await fetch(buildApiUrl("/api/auth/refresh"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh_token: session.refreshToken }),
		});
		if (!response.ok) {
			return null;
		}
		const data = await response.json().catch(() => null);
		if (!data?.access_token) {
			return null;
		}

		const updatedSession = {
			...session,
			accessToken: data.access_token,
			refreshToken: data.refresh_token || session.refreshToken,
		};
		saveSession(updatedSession);
		return data.access_token;
	} catch (_) {
		return null;
	}
}

function getRefreshedToken() {
	if (!refreshInFlight) {
		refreshInFlight = performRefresh().finally(() => {
			refreshInFlight = null;
		});
	}
	return refreshInFlight;
}

function forceLogout() {
	const session = loadSession();
	const tenantSlug = session?.tenant?.tenantSlug;
	clearSession();
	window.location.href = tenantSlug ? `/operoza/${tenantSlug}/login` : "/";
}

// Shared refresh-and-retry core, returning the raw Response so callers that
// can't go through apiRequest's JSON-only contract (multipart file uploads,
// blob/text export downloads) still get the same silent-refresh behavior
// instead of each hand-rolling (or, as happened in practice, forgetting to
// hand-roll) their own 401 handling. This is what apiRequest itself is built
// on below - one refresh implementation, not two.
async function fetchWithAuthRetry(path, options = {}) {
	const hadAuthHeader = Boolean((options.headers || {}).Authorization);

	const response = await fetch(buildApiUrl(path), options);

	// Only an already-authenticated request (one that sent an Authorization
	// header) can have "the session expired" as the reason for a 401 - a
	// login/onboarding/password-reset call never sends one, and a 401 from
	// those means "wrong credentials", not "please refresh". Treating every
	// 401 the same way was a real bug this suite caught directly: a wrong
	// password on the login form was silently redirecting to the home page
	// instead of showing the inline error, because there was no session to
	// refresh and forceLogout() ran anyway.
	if (response.status === 401 && !options._isRetry && hadAuthHeader) {
		const newAccessToken = await getRefreshedToken();
		if (newAccessToken) {
			const retryHeaders = { ...(options.headers || {}) };
			retryHeaders.Authorization = `Bearer ${newAccessToken}`;
			return fetchWithAuthRetry(path, { ...options, headers: retryHeaders, _isRetry: true });
		}

		forceLogout();
		throw new Error("Session expired. Please log in again.");
	}

	return response;
}

async function apiRequest(path, options = {}) {
	const response = await fetchWithAuthRetry(path, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		// status/data are attached (not just the message) so callers that need
		// to branch on the specific failure - e.g. a 409 "already checked in"
		// carrying the existing record - don't each need their own raw fetch.
		const error = new Error(data.error || "Request failed");
		error.status = response.status;
		error.data = data;
		throw error;
	}

	return data;
}

export { API_BASE_URL, NORMALIZED_API_BASE_URL, apiRequest, fetchWithAuthRetry };
