import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { fetchConversations } from "./services/messagingService";

// Sprint 13 (docs/SPRINT_PLAN.md) - follows the exact precedent Sprint 11's
// NotificationContext established (React Context, short-interval polling,
// no new state library), per that sprint's own note that this is "the one
// to follow for Sprint 13's messaging unread state too, for consistency."
const MessagingContext = createContext(null);

const POLL_INTERVAL_MS = 30_000;

// Post-Sprint-20 - the Facebook-Messenger-style floating chat dock
// (ChatDock.jsx) needs "which conversations are open as popup windows,
// and which of those are minimized" as shared state, since both the
// dock (mounted once, in TenantCrmLayout) and the full Messages tab
// (MessagingPanel.jsx) can trigger opening one - e.g. clicking a
// contact in either place should open (or focus) the same popup.
const MAX_OPEN_CHATS = 3;

export function MessagingProvider({ accessToken, children }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openChatIds, setOpenChatIds] = useState([]);
  const [minimizedChatIds, setMinimizedChatIds] = useState([]);
  const pollRef = useRef(null);

  const refreshConversations = useCallback(async () => {
    if (!accessToken) return;
    try {
      const items = await fetchConversations(accessToken);
      setConversations(items);
    } catch {
      // Best-effort - a transient polling failure shouldn't surface
      // anywhere else in the app.
    }
  }, [accessToken]);

  const loadConversations = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const items = await fetchConversations(accessToken);
      setConversations(items);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    refreshConversations();
    // Near-real-time via short-interval polling, explicitly not a full
    // WebSocket build-out (general guide S8) - the same tradeoff already
    // made for notifications.
    pollRef.current = setInterval(refreshConversations, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [accessToken, refreshConversations]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  // Opening a conversation already at capacity auto-evicts the
  // least-recently-opened window (oldest first in the array) rather than
  // blocking the user or making them close one first - matches the
  // classic Messenger behavior this dock is modeled on.
  const openChat = useCallback((conversationId) => {
    setOpenChatIds((prev) => {
      if (prev.includes(conversationId)) return prev;
      const next = [...prev, conversationId];
      return next.length > MAX_OPEN_CHATS ? next.slice(next.length - MAX_OPEN_CHATS) : next;
    });
    setMinimizedChatIds((prev) => prev.filter((id) => id !== conversationId));
  }, []);

  const closeChat = useCallback((conversationId) => {
    setOpenChatIds((prev) => prev.filter((id) => id !== conversationId));
    setMinimizedChatIds((prev) => prev.filter((id) => id !== conversationId));
  }, []);

  const toggleMinimizeChat = useCallback((conversationId) => {
    setMinimizedChatIds((prev) =>
      prev.includes(conversationId) ? prev.filter((id) => id !== conversationId) : [...prev, conversationId]
    );
  }, []);

  const value = {
    conversations,
    totalUnread,
    loading,
    loadConversations,
    refreshConversations,
    openChatIds,
    minimizedChatIds,
    openChat,
    closeChat,
    toggleMinimizeChat,
  };

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return ctx;
}
