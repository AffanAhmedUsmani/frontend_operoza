import { Badge } from "@mui/material";

import { useMessaging } from "../MessagingContext";

/**
 * Sprint 13 (docs/SPRINT_PLAN.md) - a small child of MessagingProvider so
 * it can read totalUnread via context; TenantCrmLayout itself renders
 * the Provider, so it can't consume its own context directly.
 */
export default function MessagingNavBadge() {
  const { totalUnread } = useMessaging();
  if (!totalUnread) return null;
  return <Badge color="error" badgeContent={totalUnread} max={99} sx={{ ml: 1 }} />;
}
