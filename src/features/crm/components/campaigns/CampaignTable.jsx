import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdDeleteForever, MdPeople, MdViewList } from "react-icons/md";
import CampaignSalesWidget from "./CampaignSalesWidget";
import { normalizeRole } from "../sales/salesFormUtils";

const STATUS_COLORS = {
  draft:     { bg: "#f0f0f0", color: "#666" },
  running:   { bg: "#e6f4ea", color: "#2e7d32" },
  paused:    { bg: "#fff3e0", color: "#e65100" },
  completed: { bg: "#e3f2fd", color: "#1565c0" },
  archived:  { bg: "#fafafa", color: "#9e9e9e" },
};

export default function CampaignTable({
  campaigns,
  accessToken,
  userRole,
  onViewTeam,
  onEditFields,
  onDeleteCampaign,
}) {
  if (!campaigns || campaigns.length === 0) return null;

  const isAdmin = normalizeRole(userRole) === "admin";

  return (
    <TableContainer component="div">
      <Table
        size="small"
        sx={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: 12, pb: 0, border: 0 }}>
              CAMPAIGN
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: 12, pb: 0, border: 0 }}>
              STATUS
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: 12, pb: 0, border: 0 }}>
              SALES
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", fontSize: 12, pb: 0, border: 0 }}>
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {campaigns.map((campaign) => {
            const statusKey = (campaign.status_code || "draft").toLowerCase();
            const statusStyle = STATUS_COLORS[statusKey] || STATUS_COLORS.draft;
            const schemaFields = Array.isArray(campaign.schema_json) ? campaign.schema_json : [];
            const fieldCount = schemaFields.length;
            const createdAt = campaign.created_at
              ? new Date(campaign.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null;

            return (
              <TableRow
                key={campaign.campaign_id || campaign.name}
                component={Paper}
                elevation={1}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.09)",
                  transition: "box-shadow 0.18s",
                  "&:hover": { boxShadow: "0 3px 10px rgba(0,0,0,0.13)" },
                  "& td": {
                    border: 0,
                    py: 1.5,
                    "&:first-of-type": { borderRadius: "12px 0 0 12px", pl: 2.5 },
                    "&:last-of-type": { borderRadius: "0 12px 12px 0", pr: 2 },
                  },
                }}
              >
                {/* Campaign name + date */}
                <TableCell sx={{ minWidth: 200 }}>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.3} noWrap>
                    {campaign.name}
                  </Typography>
                  {createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      {createdAt}
                    </Typography>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell sx={{ minWidth: 110 }}>
                  <Chip
                    label={statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                    size="small"
                    sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600, fontSize: 11, height: 22 }}
                  />
                </TableCell>

                {/* Sales widget */}
                <TableCell sx={{ minWidth: 160 }}>
                  <CampaignSalesWidget campaignId={campaign.campaign_id} accessToken={accessToken} />
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center">
                    <Tooltip title="Team members">
                      <IconButton
                        size="small"
                        onClick={() => onViewTeam && onViewTeam(campaign)}
                        sx={{ color: "primary.main", "&:hover": { bgcolor: "primary.lighter", color: "primary.dark" } }}
                      >
                        <MdPeople size={19} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={`Fields (${fieldCount})`}>
                      <IconButton
                        size="small"
                        onClick={() => onEditFields && onEditFields(campaign)}
                        sx={{ color: "secondary.main", "&:hover": { bgcolor: "secondary.lighter", color: "secondary.dark" } }}
                      >
                        <MdViewList size={19} />
                      </IconButton>
                    </Tooltip>

                    {isAdmin && (
                      <Tooltip title="Delete campaign">
                        <IconButton
                          size="small"
                          onClick={() => onDeleteCampaign && onDeleteCampaign(campaign)}
                          sx={{ color: "error.main", "&:hover": { bgcolor: "error.lighter", color: "error.dark" } }}
                        >
                          <MdDeleteForever size={19} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

