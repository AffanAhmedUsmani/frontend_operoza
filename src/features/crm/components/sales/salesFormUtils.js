import { loadSession } from "../../../auth/utils/session";

export const ADMIN_ROLES = new Set(["admin"]);
export const SALES_MANAGER_ROLES = new Set([
  "admin",
  "team_lead",
  "hr_manager",
]);

const LEGACY_ROLE_MAP = {
  super_admin: "admin",
  manager: "team_lead",
  qa_manager: "team_lead",
  finance_manager: "admin",
  financial_manager: "admin",
  report_viewer: "client",
  client_viewer: "client",
  licensed_agent: "agent",
  retention_agent: "agent",
  inbound_agent: "agent",
  outbound_agent: "agent",
  closer: "agent",
};

export function normalizeRole(role) {
  const normalized = String(role || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
  if (LEGACY_ROLE_MAP[normalized]) return LEGACY_ROLE_MAP[normalized];
  if (normalized.endsWith("_agent")) return "agent";
  return normalized;
}

export function parseJwtPayload(token) {
  if (!token || !token.includes(".")) return {};
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function resolveActorContext(accessToken) {
  const claims = parseJwtPayload(accessToken);
  const session = loadSession() || {};

  const roleFromClaims = claims?.role || claims?.role_code || "";
  const roleFromSession = session?.user?.role || session?.role || "";
  const role = normalizeRole(roleFromClaims || roleFromSession);

  const userId = String(claims?.user_id || session?.user?.userId || session?.userId || "");
  return { claims, role, userId };
}

export function normalizeField(field) {
  const key = String(field?.key || "").trim();
  const label = String(field?.label || key).trim();
  const type = String(field?.type || "text").trim().toLowerCase();
  const required = Boolean(field?.required);
  const isClientVisible =
    typeof field?.is_client_visible === "boolean" ? field.is_client_visible : undefined;

  const visibility = Array.isArray(field?.visibility)
    ? field.visibility.map((item) => normalizeRole(item)).filter(Boolean)
    : [];

  let options = [];
  if (Array.isArray(field?.options)) {
    options = field.options.map((item) => String(item).trim()).filter(Boolean);
  } else if (typeof field?.options === "string") {
    options = field.options.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return { key, label, type, required, options, visibility, isClientVisible };
}

export function isFieldVisibleToRole(field, role) {
  const normalizedRole = normalizeRole(role);
  const allowed = Array.isArray(field?.visibility) ? field.visibility : [];
  if (allowed.length > 0) {
    return allowed.includes(normalizedRole);
  }
  if (normalizedRole === "client" && typeof field?.isClientVisible === "boolean") {
    return field.isClientVisible;
  }
  return true;
}

export function filterSchemaForRole(schemaFields, role) {
  return (Array.isArray(schemaFields) ? schemaFields : []).filter((field) => isFieldVisibleToRole(field, role));
}

export function buildPayloadDefaults(schemaFields) {
  const payload = {};
  schemaFields.forEach((field) => {
    if (!field.key) return;
    payload[field.key] = "";
  });
  return payload;
}

export function deriveLeadName(payloadJson, schemaFields) {
  const preferred = ["lead_name", "customer_name", "name", "full_name"];
  for (const key of preferred) {
    const value = String(payloadJson?.[key] || "").trim();
    if (value) return value;
  }

  const fromSchema = schemaFields
    .filter((field) => ["text", "textarea", "select"].includes(field.type))
    .map((field) => String(payloadJson?.[field.key] || "").trim())
    .find(Boolean);
  return fromSchema || "Lead";
}

export function deriveEmail(payloadJson) {
  const keys = ["customer_email", "email", "email_address"];
  for (const key of keys) {
    const value = String(payloadJson?.[key] || "").trim();
    if (value) return value;
  }
  return "";
}

export function derivePhone(payloadJson) {
  const keys = ["customer_phone", "phone", "phone_number", "mobile"];
  for (const key of keys) {
    const value = String(payloadJson?.[key] || "").trim();
    if (value) return value;
  }
  return "";
}

export function deriveAmount(payloadJson) {
  const keys = ["amount", "sale_amount", "invoice_amount", "value"];
  for (const key of keys) {
    const value = payloadJson?.[key];
    if (value === null || value === undefined || String(value).trim() === "") continue;
    return String(value);
  }
  return "0";
}

export function summarizePayload(payloadJson) {
  if (!payloadJson || typeof payloadJson !== "object") return "";
  const pairs = Object.entries(payloadJson)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${String(value)}`);
  return pairs.join(" | ");
}

export function toLocalInputDateTime(isoValue) {
  if (!isoValue) return "";
  const d = new Date(isoValue);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
