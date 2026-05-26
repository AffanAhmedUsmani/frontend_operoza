import {
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdDeleteForever, MdDownload, MdPeople, MdSettings, MdViewList } from "react-icons/md";
import CampaignSalesWidget from "./CampaignSalesWidget";
import { normalizeRole } from "../sales/salesFormUtils";

const STATUS_COLORS = {
  draft:     { bg: "#f0f0f0", color: "#666" },
  running:   { bg: "#e6f4ea", color: "#2e7d32" },
  paused:    { bg: "#fff3e0", color: "#e65100" },
  completed: { bg: "#e3f2fd", color: "#1565c0" },
  archived:  { bg: "#fafafa", color: "#9e9e9e" },
};

const THEME_BORDER = "rgba(192, 83, 20, 0.62)";
const THEME_DIVIDER = "rgba(192, 83, 20, 0.35)";

export default function CampaignCard({
  campaign,
  accessToken,
  userRole,
  onViewTeam,
  onEditFields,
  onDeleteCampaign,
  onOpenSettings,
  onOpenExport,
}) {
  const schemaFields = Array.isArray(campaign.schema_json) ? campaign.schema_json : [];
  const fieldCount = schemaFields.length;
  const statusKey = (campaign.status_code || "draft").toLowerCase();
  const statusStyle = STATUS_COLORS[statusKey] || STATUS_COLORS.draft;
  const normalizedRole = normalizeRole(userRole || "");
  const isAdmin = normalizedRole === "admin";
  const canManageCampaign = ["admin", "team_lead"].includes(normalizedRole);
  const canExportCampaign = canManageCampaign;

  return (
    <Card
      sx={{
        border: `1.5px solid ${THEME_BORDER}`,
        borderRadius: { xs: 2.5, md: 4 },
        overflow: "hidden",
        width: "100%",
        bgcolor: "#fcfcfc",
        transition: "box-shadow 0.15s, transform 0.15s",
        "&:hover": {
          boxShadow: "0 8px 18px rgba(192, 83, 20, 0.15)",
          transform: "translateY(-1px)",
          borderColor: "#c05314",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2.3fr 1.2fr 2fr 1.9fr" },
          alignItems: "stretch",
        }}
      >
        <Stack
          sx={{
            px: 2.25,
            py: 1.25,
            minHeight: { md: 74 },
            justifyContent: "center",
            borderRight: { md: `1px solid ${THEME_DIVIDER}` },
            borderBottom: { xs: `1px solid ${THEME_DIVIDER}`, md: "none" },
          }}
        >
          <Typography variant="h6" fontWeight={700} noWrap>{campaign.name}</Typography>
        </Stack>

        <Stack
          sx={{
            px: 2.25,
            py: 1.25,
            minHeight: { md: 74 },
            justifyContent: "center",
            borderRight: { md: `1px solid ${THEME_DIVIDER}` },
            borderBottom: { xs: `1px solid ${THEME_DIVIDER}`, md: "none" },
          }}
        >
          <Chip
            label={statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
            size="small"
            sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700, width: "fit-content", height: 24 }}
          />
        </Stack>

        <Stack
          sx={{
            position: "relative",
            px: 2.25,
            py: 1.1,
            minHeight: { md: 74 },
            justifyContent: "center",
            borderRight: { md: `1px solid ${THEME_DIVIDER}` },
            borderBottom: { xs: `1px solid ${THEME_DIVIDER}`, md: "none" },
          }}
        >
          <CampaignSalesWidget campaignId={campaign.campaign_id} accessToken={accessToken} />
          {canExportCampaign ? (
            <Tooltip title="Export">
              <IconButton
                size="small"
                onClick={() => onOpenExport && onOpenExport(campaign)}
                sx={{
                  position: "absolute",
                  right: 8,
                  bottom: 7,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#fff",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                <MdDownload size={15} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: "flex-start", md: "center" }}
          sx={{ px: 1.25, py: 1.1, minHeight: { md: 74 } }}
          spacing={0.2}
        >
          {canManageCampaign ? (
            <Tooltip title="Team">
              <IconButton size="small" onClick={() => onViewTeam && onViewTeam(campaign)}>
                <MdPeople size={18} />
              </IconButton>
            </Tooltip>
          ) : null}

          {isAdmin && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDeleteCampaign && onDeleteCampaign(campaign)}>
                <MdDeleteForever size={18} />
              </IconButton>
            </Tooltip>
          )}

          {canManageCampaign ? (
            <>
              <Tooltip title={`Fields (${fieldCount})`}>
                <IconButton size="small" onClick={() => onEditFields && onEditFields(campaign)}>
                  <MdViewList size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Settings">
                <IconButton size="small" onClick={() => onOpenSettings && onOpenSettings(campaign)}>
                  <MdSettings size={18} />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}

