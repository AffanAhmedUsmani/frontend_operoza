import { useEffect, useState } from "react";
import { Badge, Box, Divider, Fab, List, ListItemButton, ListItemText, Popover, Stack, Typography } from "@mui/material";
import { MdAdd, MdChatBubble } from "react-icons/md";

import { useMessaging } from "../MessagingContext";
import { fetchContacts, startDirectConversation } from "../services/messagingService";
import ChatWindow from "./ChatWindow";

function conversationLabel(conversation) {
  if (conversation.type_code === "team") return `# ${conversation.campaign_name || "Team"}`;
  return conversation.other_participant_display_name || "Direct message";
}

/**
 * Post-Sprint-20 - the always-in-the-corner chat launcher (the "Facebook
 * Messenger" experience asked for): a single fixed-position bubble that
 * follows the user across every screen in the tenant portal (mounted
 * once, in TenantCrmLayout.jsx, inside the same MessagingProvider the
 * full Messages tab already uses), opening up to 3 conversations as
 * small docked windows next to it, independent of whichever role
 * dashboard or route is currently active.
 *
 * Deliberately additive: MessagingPanel.jsx (the full "Messages" nav
 * tab) is unchanged and still the place for browsing conversation
 * history at length - this is the always-available quick-reply layer
 * on top of it.
 */
export default function ChatDock({ accessToken, currentUserId }) {
  const { conversations, totalUnread, openChatIds, openChat, loadConversations } = useMessaging();
  const [pickerAnchor, setPickerAnchor] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  useEffect(() => {
    if (accessToken) loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (!accessToken) return null;

  const openPicker = async (event) => {
    setPickerAnchor(event.currentTarget);
    setContactsLoading(true);
    try {
      const items = await fetchContacts(accessToken);
      setContacts(items);
    } finally {
      setContactsLoading(false);
    }
  };

  const handlePickConversation = (conversationId) => {
    openChat(conversationId);
    setPickerAnchor(null);
  };

  const handleStartWithContact = async (targetUserId) => {
    try {
      const conversation = await startDirectConversation(accessToken, targetUserId);
      await loadConversations();
      openChat(conversation.conversation_id);
    } finally {
      setPickerAnchor(null);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        right: 20,
        // Above the AppBar/Drawer (both sit at/just above theme.zIndex.drawer)
        // so the dock is never hidden behind the nav chrome, but below
        // theme.zIndex.modal so the conversation-picker Popover (which
        // renders via a portal, at the default MUI modal z-index) still
        // draws on top of the dock itself.
        zIndex: (theme) => theme.zIndex.appBar + 10,
        display: "flex",
        alignItems: "flex-end",
        gap: 1.5,
        pointerEvents: "none",
        "& > *": { pointerEvents: "auto" },
      }}
    >
      {openChatIds.map((conversationId) => (
        <ChatWindow key={conversationId} accessToken={accessToken} conversationId={conversationId} currentUserId={currentUserId} />
      ))}

      <Fab color="primary" onClick={openPicker} aria-label="Open messages" sx={{ mb: 2 }}>
        <Badge color="error" badgeContent={totalUnread} max={99}>
          <MdChatBubble size={22} />
        </Badge>
      </Fab>

      <Popover
        open={Boolean(pickerAnchor)}
        anchorEl={pickerAnchor}
        onClose={() => setPickerAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box sx={{ width: 300, maxHeight: 380, overflowY: "auto" }}>
          <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            Conversations
          </Typography>
          {conversations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 1.5 }}>
              No conversations yet.
            </Typography>
          ) : (
            <List dense disablePadding>
              {conversations.map((conversation) => (
                <ListItemButton
                  key={conversation.conversation_id}
                  onClick={() => handlePickConversation(conversation.conversation_id)}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" noWrap>
                          {conversationLabel(conversation)}
                        </Typography>
                        {conversation.unread_count > 0 ? (
                          <Badge color="error" badgeContent={conversation.unread_count} />
                        ) : null}
                      </Stack>
                    }
                    secondary={conversation.last_message_preview}
                  />
                </ListItemButton>
              ))}
            </List>
          )}

          <Divider />
          <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            Start a new conversation
          </Typography>
          {contactsLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 1.5 }}>
              Loading contacts...
            </Typography>
          ) : contacts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 1.5 }}>
              No one is available to message.
            </Typography>
          ) : (
            <List dense disablePadding>
              {contacts.map((contact) => (
                <ListItemButton key={contact.user_id} onClick={() => handleStartWithContact(contact.user_id)}>
                  <ListItemText primary={contact.display_name} secondary={contact.role_code} />
                  <MdAdd />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </Box>
  );
}
