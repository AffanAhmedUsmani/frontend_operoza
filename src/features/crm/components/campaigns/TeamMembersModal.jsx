import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdClose, MdPeople, MdPersonAdd, MdPersonRemove } from "react-icons/md";
import { fetchTenantUsers } from "../../services/adminService";
import { assignCampaignUsers, fetchCampaignAssignments } from "../../services/campaignService";

const ROLE_LABELS = {
  admin: "Admin",
  team_lead: "Team Lead",
  agent: "Agent",
  hr_manager: "HR Manager",
  client: "Client",
};

function roleLabel(code) {
  return ROLE_LABELS[code] || code || "—";
}

function avatarInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function stringToColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 48%)`;
}

export default function TeamMembersModal({ open, campaign, accessToken, onSaved, onClose }) {
  const [allUsers, setAllUsers] = useState([]);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const loadData = useCallback(async () => {
    if (!campaign || !open) return;
    setLoading(true);
    setError("");
    try {
      const [users, assignments] = await Promise.all([
        fetchTenantUsers(accessToken),
        fetchCampaignAssignments(accessToken, campaign.campaign_id),
      ]);
      setAllUsers(users);
      setAssignedIds(new Set(assignments.map((a) => String(a.user_id))));
    } catch (err) {
      setError(err.message || "Failed to load team data.");
    } finally {
      setLoading(false);
    }
  }, [campaign, accessToken, open]);

  useEffect(() => {
    if (open) {
      setSelectedUserId("");
      setError("");
      loadData();
    }
  }, [open, loadData]);

  const teamMembers = allUsers.filter((u) => assignedIds.has(String(u.user_id)));
  const unassignedUsers = allUsers.filter((u) => !assignedIds.has(String(u.user_id)));

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setError("");
    try {
      const newIds = [...assignedIds, selectedUserId];
      await assignCampaignUsers(accessToken, campaign.campaign_id, newIds, true);
      setAssignedIds(new Set(newIds));
      setSelectedUserId("");
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || "Failed to add member.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (userId) => {
    setSaving(true);
    setError("");
    try {
      const newIds = [...assignedIds].filter((id) => id !== String(userId));
      await assignCampaignUsers(accessToken, campaign.campaign_id, newIds, true);
      setAssignedIds(new Set(newIds));
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || "Failed to remove member.");
    } finally {
      setSaving(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: "primary.light",
                color: "primary.contrastText",
              }}
            >
              <MdPeople size={18} />
            </Box>
            <Box>
              <Typography variant="h6" component="div" lineHeight={1.2}>
                Team Members
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {campaign.name}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose} disabled={saving}>
            <MdClose />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* ── Assign new user section ── */}
        <Box sx={{ px: 3, py: 2, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Add to Campaign
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Select user</InputLabel>
              <Select
                value={selectedUserId}
                label="Select user"
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loading || saving}
                renderValue={(val) => {
                  const u = allUsers.find((x) => String(x.user_id) === String(val));
                  return u ? `${u.display_name || u.email_address} — ${roleLabel(u.role_code)}` : "";
                }}
              >
                {unassignedUsers.length === 0 && (
                  <MenuItem disabled value="">
                    All users already assigned
                  </MenuItem>
                )}
                {unassignedUsers.map((u) => (
                  <MenuItem key={u.user_id} value={String(u.user_id)}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        sx={{ width: 28, height: 28, fontSize: 11, bgcolor: stringToColor(u.display_name || u.email_address) }}
                      >
                        {avatarInitials(u.display_name || u.email_address)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" lineHeight={1.2}>
                          {u.display_name || u.email_address}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {roleLabel(u.role_code)}
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <MdPersonAdd />}
              onClick={handleAdd}
              disabled={!selectedUserId || saving}
              sx={{ whiteSpace: "nowrap", minWidth: 110 }}
            >
              Assign
            </Button>
          </Stack>
        </Box>

        {/* ── Error banner ── */}
        {error && (
          <Box sx={{ px: 3, pt: 2 }}>
            <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
          </Box>
        )}

        {/* ── Team member list ── */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Current Team ({teamMembers.length})
          </Typography>

          {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={28} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Loading team…
              </Typography>
            </Stack>
          ) : teamMembers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No team members assigned yet.
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              {teamMembers.map((user, i) => (
                <Box key={user.user_id}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ py: 1.25, px: 1, borderRadius: 2, "&:hover": { bgcolor: "grey.50" } }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 13,
                          bgcolor: stringToColor(user.display_name || user.email_address),
                        }}
                      >
                        {avatarInitials(user.display_name || user.email_address)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500} lineHeight={1.3}>
                          {user.display_name || user.email_address}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email_address}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={roleLabel(user.role_code)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                      <Tooltip title="Remove from campaign">
                        <IconButton
                          size="small"
                          disabled={saving}
                          onClick={() => handleRemove(user.user_id)}
                          sx={{ color: "error.main", "&:hover": { bgcolor: "error.lighter" } }}
                        >
                          <MdPersonRemove size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  {i < teamMembers.length - 1 && <Divider />}
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
