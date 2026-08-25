import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdAdd, MdAttachFile } from "react-icons/md";

import { useMessaging } from "../MessagingContext";
import {
  fetchContacts,
  fetchMessages,
  markConversationRead,
  postMessage,
  startDirectConversation,
} from "../services/messagingService";
import SharedRecordDialog from "./SharedRecordDialog";

const MESSAGE_POLL_INTERVAL_MS = 10_000;

/**
 * Sprint 13 (docs/SPRINT_PLAN.md) - the messaging screen: conversation
 * list (direct + auto-created team channels) on the left, active thread
 * on the right. "New Message" only ever offers contacts the backend's
 * own /contacts endpoint returns - the same server-side
 * can_start_direct_conversation check the POST itself enforces, so the
 * picker never offers an option the server would reject.
 */
export default function MessagingPanel({ accessToken }) {
  const { conversations, loading, loadConversations, refreshConversations } = useMessaging();
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [sharedRecordMessageId, setSharedRecordMessageId] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeConversation = conversations.find((c) => c.conversation_id === activeId);

  const loadMessages = async (conversationId) => {
    setMessagesLoading(true);
    try {
      const items = await fetchMessages(accessToken, conversationId);
      setMessages(items);
    } catch (err) {
      setError(err.message || "Unable to load messages.");
    } finally {
      setMessagesLoading(false);
    }
  };

  const openConversation = async (conversationId) => {
    setActiveId(conversationId);
    setError("");
    await loadMessages(conversationId);
    try {
      await markConversationRead(accessToken, conversationId);
      refreshConversations();
    } catch {
      // non-fatal - unread badge just won't clear this tick
    }
  };

  useEffect(() => {
    if (!activeId) return;
    pollRef.current = setInterval(() => loadMessages(activeId), MESSAGE_POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const handleSend = async () => {
    if (!draft.trim() || !activeId) return;
    setError("");
    try {
      await postMessage(accessToken, activeId, { body: draft.trim() });
      setDraft("");
      await loadMessages(activeId);
    } catch (err) {
      setError(err.message || "Unable to send message.");
    }
  };

  const openNewMessageDialog = async () => {
    setNewMessageOpen(true);
    try {
      const items = await fetchContacts(accessToken);
      setContacts(items);
    } catch (err) {
      setError(err.message || "Unable to load contacts.");
    }
  };

  const handleStartConversation = async (targetUserId) => {
    try {
      const conversation = await startDirectConversation(accessToken, targetUserId);
      setNewMessageOpen(false);
      await refreshConversations();
      await openConversation(conversation.conversation_id);
    } catch (err) {
      setError(err.message || "Unable to start conversation.");
    }
  };

  const conversationLabel = (conversation) => {
    if (conversation.type_code === "team") return `# ${conversation.campaign_name || "Team"}`;
    return conversation.other_participant_display_name || "Direct message";
  };

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Messages</Typography>
          <Button size="small" variant="contained" startIcon={<MdAdd />} onClick={openNewMessageDialog}>
            New Message
          </Button>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px 1fr" }, gap: 2, minHeight: 420 }}>
          <Box sx={{ borderRight: { md: "1px solid" }, borderRightColor: "divider", pr: { md: 2 } }}>
            {loading ? (
              <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={24} /></Stack>
            ) : conversations.length === 0 ? (
              <Typography color="text.secondary" variant="body2">No conversations yet.</Typography>
            ) : (
              <List dense disablePadding>
                {conversations.map((conversation) => (
                  <ListItemButton
                    key={conversation.conversation_id}
                    selected={conversation.conversation_id === activeId}
                    onClick={() => openConversation(conversation.conversation_id)}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" noWrap>{conversationLabel(conversation)}</Typography>
                          {conversation.unread_count > 0 ? <Badge color="error" badgeContent={conversation.unread_count} /> : null}
                        </Stack>
                      }
                      secondary={conversation.last_message_preview}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {!activeConversation ? (
              <Typography color="text.secondary" sx={{ m: "auto" }}>Select a conversation.</Typography>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{conversationLabel(activeConversation)}</Typography>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ flex: 1, overflowY: "auto", mb: 1, maxHeight: 320 }}>
                  {messagesLoading ? (
                    <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={24} /></Stack>
                  ) : messages.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">No messages yet.</Typography>
                  ) : (
                    <Stack spacing={1}>
                      {messages.map((message) => (
                        <Box key={message.message_id} sx={{ p: 1, borderRadius: 1, bgcolor: "brand.subtle", color: "text.primary" }}>
                          <Typography variant="caption" color="text.secondary">{message.sender_display_name}</Typography>
                          {message.body ? <Typography variant="body2">{message.body}</Typography> : null}
                          {message.shared_record_type ? (
                            <Chip
                              size="small"
                              icon={<MdAttachFile />}
                              label={`Shared ${message.shared_record_type}`}
                              onClick={() => setSharedRecordMessageId(message.message_id)}
                              sx={{ mt: 0.5 }}
                            />
                          ) : null}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  />
                  <Button variant="contained" onClick={handleSend} disabled={!draft.trim()}>Send</Button>
                </Stack>
              </>
            )}
          </Box>
        </Box>
      </CardContent>

      <Dialog open={newMessageOpen} onClose={() => setNewMessageOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Message</DialogTitle>
        <DialogContent dividers>
          {contacts.length === 0 ? (
            <Typography color="text.secondary">No one is available to message.</Typography>
          ) : (
            <List dense>
              {contacts.map((contact) => (
                <ListItemButton key={contact.user_id} onClick={() => handleStartConversation(contact.user_id)}>
                  <ListItemText primary={contact.display_name} secondary={contact.role_code} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewMessageOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <SharedRecordDialog
        open={Boolean(sharedRecordMessageId)}
        messageId={sharedRecordMessageId}
        accessToken={accessToken}
        onClose={() => setSharedRecordMessageId(null)}
      />
    </Card>
  );
}
