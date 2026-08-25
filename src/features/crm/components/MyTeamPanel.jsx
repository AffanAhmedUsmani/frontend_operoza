import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useCampaigns } from "../hooks/useCampaigns";
import { fetchCampaignAssignments } from "../services/campaignService";

/**
 * Sprint 8 (docs/SPRINT_PLAN.md) - a real roster view for Team Lead's "My
 * Team" tab, replacing a fixed set of fake numbers ("Active Agents: 24",
 * etc, general guide §15.7). Reuses the campaign-assignments endpoint
 * already used elsewhere (TeamMembersModal) - no new backend needed - to
 * show the actual agents on the Team Lead's own campaigns.
 */
export default function MyTeamPanel({ accessToken }) {
  const { campaigns, loading: campaignsLoading, error: campaignsError } = useCampaigns(accessToken);
  const [rosterByCampaign, setRosterByCampaign] = useState({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken || campaigns.length === 0) return;
    let cancelled = false;

    (async () => {
      setLoadingRoster(true);
      setError("");
      try {
        const entries = await Promise.all(
          campaigns.map(async (campaign) => {
            const assignments = await fetchCampaignAssignments(accessToken, campaign.campaign_id);
            return [campaign.campaign_id, assignments.filter((a) => a.role_code === "agent")];
          })
        );
        if (!cancelled) setRosterByCampaign(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load team roster.");
      } finally {
        if (!cancelled) setLoadingRoster(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, campaigns]);

  const loading = campaignsLoading || loadingRoster;
  const totalAgents = Object.values(rosterByCampaign).reduce((sum, list) => sum + list.length, 0);

  return (
    <Stack spacing={2.5}>
      {(error || campaignsError) ? <Alert severity="error">{error || campaignsError}</Alert> : null}

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>My Team</Typography>

          {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
          ) : campaigns.length === 0 ? (
            <Typography color="text.secondary">You are not leading any campaigns yet.</Typography>
          ) : totalAgents === 0 ? (
            <Typography color="text.secondary">No agents are assigned to your campaigns yet.</Typography>
          ) : (
            <Stack spacing={2}>
              {campaigns.map((campaign) => {
                const roster = rosterByCampaign[campaign.campaign_id] || [];
                if (roster.length === 0) return null;
                return (
                  <div key={campaign.campaign_id}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {campaign.name} <Chip size="small" label={`${roster.length} agent${roster.length === 1 ? "" : "s"}`} sx={{ ml: 1 }} />
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {roster.map((agent) => (
                            <TableRow key={agent.user_id} hover>
                              <TableCell>{agent.display_name}</TableCell>
                              <TableCell>{agent.email}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
