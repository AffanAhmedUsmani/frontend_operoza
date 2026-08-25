import {
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

/**
 * Sprint 8 (docs/SPRINT_PLAN.md) - a real, read-only Campaigns view for
 * Client, replacing a placeholder that just pointed elsewhere ("Read-only
 * campaign milestones are available in the dashboards and reports tabs" -
 * general guide §15.7). useCampaigns already returns only campaigns this
 * client is actually assigned to (server-side scoped, confirmed in
 * Sprint 6's audit) - this is a real fetch, real loading/empty/error
 * state, not a fixed rewording of the old stub.
 */
export default function ClientCampaignsPanel({ accessToken }) {
  const { campaigns, loading, error } = useCampaigns(accessToken);

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Campaigns</Typography>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : campaigns.length === 0 ? (
          <Typography color="text.secondary">You are not assigned to any campaigns yet.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Starts</TableCell>
                  <TableCell>Ends</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.campaign_id} hover>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell><Chip size="small" label={campaign.status_code} /></TableCell>
                    <TableCell>{campaign.starts_at ? new Date(campaign.starts_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{campaign.ends_at ? new Date(campaign.ends_at).toLocaleDateString() : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
