import { useEffect, useRef, useState } from "react";
import { Badge, Box, CircularProgress, IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { MdClose, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

import { useMessaging } from "../MessagingContext";
import { fetchMessages, markConversationRead, postMessage } from "../services/messagingService";

const MESSAGE_POLL_INTERVAL_MS = 10_000;
const WINDOW_WIDTH = 288;

function conversationLabel(conversation) {
  if (!conversation) return "Conversation";
  if (conversation.type_code === "team") return `# ${conversation.campaign_name || "Team"}`;
  return conversation.other_participant_display_name || "Direct message";
}

/**
 * Post-Sprint-20 - one docked popup chat window, the Messenger-style
 * counterpart to MessagingPanel.jsx's full-tab thread view. Deliberately
 * reuses the same messagingService calls (fetchMessages/postMessage/
 * markConversationRead) rather than a parallel data layer - a message
 * sent here shows up in the full tab too, and vice versa, since both
 * read/write the same conversation through the same endpoints.
 */
export default function ChatWindow({ accessToken, conversationId, currentUserId }) {
  const { conversations, minimizedChatIds, closeChat, toggleMinimizeChat, refreshConversations } = useMessaging();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const pollRef = useRef(null);
  const scrollRef = useRef(null);

  const conversation = conversations.find((c) => c.conversation_id === conversationId);
  const minimized = minimizedChatIds.includes(conversationId);
  const unread = conversation?.unread_count || 0;

  const loadMessages = async () => {
    try {
      const items = await fetchMessages(accessToken, conversationId);
      setMessages(items);
    } catch (err) {
      setError(err.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    markConversationRead(accessToken, conversationId)
      .then(refreshConversations)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (minimized) return;
    pollRef.current = setInterval(loadMessages, MESSAGE_POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minimized, conversationId]);

  useEffect(() => {
    if (minimized || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, minimized]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    setError("");
    try {
      await postMessage(accessToken, conversationId, { body: draft.trim() });
      setDraft("");
      await loadMessages();
    } catch (err) {
      setError(err.message || "Unable to send message.");
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        width: WINDOW_WIDTH,
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px 12px 0 0",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderBottom: "none",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => toggleMinimizeChat(conversationId)}
        sx={{
          px: 1.5,
          py: 1,
          cursor: "pointer",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          {!minimized || !unread ? null : <Badge color="error" variant="dot" />}
          <Typography variant="body2" fontWeight={700} noWrap>
            {conversationLabel(conversation)}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Tooltip title={minimized ? "Expand" : "Minimize"}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimizeChat(conversationId);
              }}
              sx={{ color: "inherit" }}
              aria-label={minimized ? "Expand chat" : "Minimize chat"}
            >
              {minimized ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                closeChat(conversationId);
              }}
              sx={{ color: "inherit" }}
              aria-label="Close chat"
            >
              <MdClose size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {minimized ? null : (
        <>
          <Box ref={scrollRef} sx={{ height: 320, overflowY: "auto", p: 1.25, bgcolor: "background.paper" }}>
            {loading ? (
              <Stack alignItems="center" sx={{ py: 3 }}>
                <CircularProgress size={20} />
              </Stack>
            ) : messages.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
                No messages yet. Say hello.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {messages.map((message) => {
                  const isOwn = String(message.sender_id) === String(currentUserId);
                  return (
                    <Box
                      key={message.message_id}
                      sx={{
                        alignSelf: isOwn ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        bgcolor: isOwn ? "primary.main" : "action.hover",
                        color: isOwn ? "primary.contrastText" : "text.primary",
                        borderRadius: 2,
                        px: 1.25,
                        py: 0.75,
                      }}
                    >
                      {!isOwn && conversation?.type_code === "team" ? (
                        <Typography variant="caption" sx={{ display: "block", opacity: 0.75, fontWeight: 600 }}>
                          {message.sender_display_name}
                        </Typography>
                      ) : null}
                      {message.body ? (
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                          {message.body}
                        </Typography>
                      ) : null}
                      {message.shared_record_type ? (
                        <Typography variant="caption" sx={{ display: "block", opacity: 0.8 }}>
                          Shared {message.shared_record_type}
                        </Typography>
                      ) : null}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
          {error ? (
            <Typography variant="caption" color="error" sx={{ px: 1.25 }}>
              {error}
            </Typography>
          ) : null}
          <Stack direction="row" spacing={0.5} sx={{ p: 1, borderTop: "1px solid", borderColor: "divider" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <IconButton color="primary" onClick={handleSend} disabled={!draft.trim()} aria-label="Send message">
              <MdKeyboardArrowUp size={20} style={{ transform: "rotate(90deg)" }} />
            </IconButton>
          </Stack>
        </>
      )}
    </Paper>
  );
}
