const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const NORMALIZED_API_BASE_URL = String(API_BASE_URL || "").trim().replace(/\/+$/, "");

function buildApiUrl(path) {
	const normalizedPath = String(path || "").trim();
	if (/^https?:\/\//i.test(normalizedPath)) {
		return normalizedPath;
	}
	return `${NORMALIZED_API_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
}

async function apiRequest(path, options = {}) {
	const response = await fetch(buildApiUrl(path), {
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
		...options,
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || "Request failed");
	}

	return data;
}

export { API_BASE_URL, apiRequest };
