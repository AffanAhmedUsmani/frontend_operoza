const SESSION_KEY = "operoza.session";

function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export { clearSession, loadSession, saveSession };