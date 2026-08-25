import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { MdNotifications } from "react-icons/md";

import { useNotifications } from "../NotificationContext";

const CATEGORY_LABELS = {
  security: "Security",
  user_management: "Users",
  campaigns: "Campaigns",
  attendance: "Attendance",
  payroll: "Payroll",
  follow_up: "Follow-Up",
  exports: "Exports",
};

const SEVERITY_COLORS = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "default",
};

const UNREAD_STATUSES = new Set(["delivered", "pending"]);

/**
 * Sprint 11 (docs/SPRINT_PLAN.md) - the notification center: bell icon,
 * unread count, category filters, mark-all-read. Reads/writes entirely
 * through NotificationContext, the first shared frontend state this
 * codebase has - no per-component fetch logic here.
 */
export default function NotificationBell() {
  const { unreadCount, notifications, loading, loadNotifications, markRead, markAllRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [category, setCategory] = useState("");

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    loadNotifications(category || undefined);
  };

  const handleClose = () => setAnchorEl(null);

  const handleCategoryClick = (nextCategory) => {
    const value = nextCategory === category ? "" : nextCategory;
    setCategory(value);
    loadNotifications(value || undefined);
  };

  const handleItemClick = async (notification) => {
    if (UNREAD_STATUSES.has(notification.status_code)) {
      await markRead(notification.recipient_id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const presentCategories = [...new Set(notifications.map((n) => n.category))];

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Notifications" sx={{ color: "#f5c58a" }}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <MdNotifications size={22} />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ width: 380, maxHeight: 480, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
            <Button size="small" onClick={markAllRead}>Mark all read</Button>
          </Stack>
          <Divider />
          {presentCategories.length > 0 ? (
            <Stack direction="row" spacing={0.5} sx={{ px: 1.5, py: 1 }} flexWrap="wrap" useFlexGap>
              {presentCategories.map((cat) => (
                <Chip
                  key={cat}
                  label={CATEGORY_LABELS[cat] || cat}
                  size="small"
                  variant={category === cat ? "filled" : "outlined"}
                  onClick={() => handleCategoryClick(cat)}
                />
              ))}
            </Stack>
          ) : null}
          <Box sx={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={24} /></Stack>
            ) : notifications.length === 0 ? (
              <Typography color="text.secondary" sx={{ px: 2, py: 3, textAlign: "center" }}>
                No notifications.
              </Typography>
            ) : (
              <List dense disablePadding>
                {notifications.map((notification) => {
                  const unread = UNREAD_STATUSES.has(notification.status_code);
                  return (
                    <ListItemButton
                      key={notification.recipient_id}
                      onClick={() => handleItemClick(notification)}
                      sx={{ alignItems: "flex-start", background: unread ? "#fff8f2" : "transparent" }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight={unread ? 700 : 400}>{notification.title}</Typography>
                            <Chip
                              label={notification.severity}
                              size="small"
                              color={SEVERITY_COLORS[notification.severity] || "default"}
                              sx={{ height: 18, fontSize: 10, textTransform: "capitalize" }}
                            />
                          </Stack>
                        }
                        secondary={notification.body}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}
