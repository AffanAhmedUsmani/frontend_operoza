import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "./services/notificationService";

// Sprint 11 (docs/SPRINT_PLAN.md) - the first shared/global frontend
// state this codebase has (React's built-in Context API, no new
// dependency - confirmed the frontend had no Context usage anywhere and
// no state library at all before this, just per-component
// useState/useEffect). The unread-count badge in TenantCrmLayout.jsx's
// nav bar needs data fetched independently of whatever panel is
// currently active, which is exactly the shape Context solves. This is
// also the precedent Sprint 13's messaging unread state should follow,
// per this sprint's own note.
const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 30_000;

export function NotificationProvider({ accessToken, children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    try {
      const count = await fetchUnreadCount(accessToken);
      setUnreadCount(count);
    } catch {
      // Best-effort - a transient failure to refresh the badge shouldn't
      // surface as a user-facing error anywhere else in the app.
    }
  }, [accessToken]);

  const loadNotifications = useCallback(async (category) => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const items = await fetchNotifications(accessToken, { category });
      setNotifications(items);
    } catch (err) {
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const markRead = useCallback(async (recipientId) => {
    await markNotificationRead(accessToken, recipientId);
    setNotifications((prev) => prev.map((n) => (n.recipient_id === recipientId ? { ...n, status_code: "read" } : n)));
    refreshUnreadCount();
  }, [accessToken, refreshUnreadCount]);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead(accessToken);
    setNotifications((prev) => prev.map((n) => (n.is_mandatory ? n : { ...n, status_code: "read" })));
    refreshUnreadCount();
  }, [accessToken, refreshUnreadCount]);

  useEffect(() => {
    if (!accessToken) return;
    refreshUnreadCount();
    // Near-real-time via short-interval polling is explicitly sufficient
    // per general guide S8 (the same precedent this codebase uses for
    // messaging) - a full push/subscription channel would be
    // over-engineering for a notification badge.
    pollRef.current = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [accessToken, refreshUnreadCount]);

  const value = {
    unreadCount, notifications, loading, error,
    refreshUnreadCount, loadNotifications, markRead, markAllRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}
