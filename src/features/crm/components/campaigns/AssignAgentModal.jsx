import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { fetchTenantUsers } from "../../services/adminService";
import { assignCampaignUsers, fetchCampaignAssignments } from "../../services/campaignService";

export default function AssignAgentModal({ open, campaign, accessToken, onSaved, onClose }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !campaign) return;
    setError("");
    setLoading(true);
    Promise.all([
      fetchTenantUsers(accessToken),
      fetchCampaignAssignments(accessToken, campaign.campaign_id),
    ])
      .then(([allUsers, assignments]) => {
        setUsers(allUsers);
        const assignedIds = new Set(assignments.map((a) => String(a.user_id)));
        setSelected(assignedIds);
      })
      .catch((err) => setError(err.message || "Failed to load users."))
      .finally(() => setLoading(false));
  }, [open, campaign, accessToken]);

  const toggle = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await assignCampaignUsers(accessToken, campaign.campaign_id, [...selected], true);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save assignments.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="span">Assign Agents</Typography>
        {campaign && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {campaign.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : users.length === 0 ? (
          <Typography color="text.secondary">No users found in this workspace.</Typography>
        ) : (
          <Stack spacing={0.25}>
            {users.map((user) => {
              const userId = String(user.user_id || user.id || "");
              const displayName = user.display_name || "—";
              const email = user.email_address || user.email || "";
              const roleCode = user.role_code || "";
              return (
                <FormControlLabel
                  key={userId}
                  control={
                    <Checkbox
                      checked={selected.has(userId)}
                      onChange={() => toggle(userId)}
                      size="small"
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: "primary.light" }}>
                        {(displayName || email || "?")[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                          {displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {email}{roleCode ? ` · ${roleCode}` : ""}
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ m: 0, borderRadius: 1, "&:hover": { bgcolor: "action.hover" }, px: 0.5 }}
                />
              );
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
          {saving ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
          Save Assignments
        </Button>
      </DialogActions>
    </Dialog>
  );
}
