import {
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { MdDeleteForever, MdDownload, MdPeople, MdSettings, MdViewList } from "react-icons/md";
import CampaignSalesWidget from "./CampaignSalesWidget";
import { normalizeRole } from "../sales/salesFormUtils";

// Post-Sprint-20 - status is a semantic signal (draft/running/paused/...),
// not a brand identity, so it reads from MUI's built-in success/warning/
// info/error palette (already mode-aware) rather than the tenant's
// primary/secondary - the same "semantic color is separate from the
// accent hue" rule the rest of the theme follows.
// QA_FIX_PLAN.md step 14 - icons alone required a hover (invisible on
// touch) or an actual click to discover what each one did. A permanently
// visible micro-label under the icon removes that discovery step
// entirely, without needing the horizontal space a full text button
// would take in this card's narrow action column.
function LabeledAction({ icon, label, onClick, color = "inherit" }) {
  return (
    <Stack alignItems="center" spacing={0} sx={{ minWidth: 44 }}>
      <IconButton size="small" color={color} onClick={onClick} aria-label={label}>
        {icon}
      </IconButton>
      <Typography variant="caption" color={color === "error" ? "error" : "text.secondary"} sx={{ fontSize: 10, lineHeight: 1 }}>
        {label}
      </Typography>
    </Stack>
  );
}

function getStatusStyles(theme) {
  return {
    draft: { bg: alpha(theme.palette.text.secondary, 0.12), color: theme.palette.text.secondary },
    running: { bg: alpha(theme.palette.success.main, 0.16), color: theme.palette.success.dark },
    paused: { bg: alpha(theme.palette.warning.main, 0.18), color: theme.palette.warning.dark },
    completed: { bg: alpha(theme.palette.info.main, 0.16), color: theme.palette.info.dark },
    archived: { bg: alpha(theme.palette.text.disabled, 0.12), color: theme.palette.text.disabled },
  };
}

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
  const theme = useTheme();
  const statusStyles = getStatusStyles(theme);
  const themeBorder = alpha(theme.palette.primary.main, 0.55);
  const themeDivider = alpha(theme.palette.primary.main, 0.28);
  const schemaFields = Array.isArray(campaign.schema_json) ? campaign.schema_json : [];
  const fieldCount = schemaFields.length;
  const statusKey = (campaign.status_code || "draft").toLowerCase();
  const statusStyle = statusStyles[statusKey] || statusStyles.draft;
  const normalizedRole = normalizeRole(userRole || "");
  const isAdmin = normalizedRole === "admin";
  const canManageCampaign = ["admin", "team_lead"].includes(normalizedRole);
  const canExportCampaign = canManageCampaign;

  return (
    <Card
      sx={{
        border: `1.5px solid ${themeBorder}`,
        borderRadius: { xs: 2.5, md: 4 },
        overflow: "hidden",
        width: "100%",
        bgcolor: "background.paper",
        transition: "box-shadow 0.15s, transform 0.15s",
        "&:hover": {
          boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.18)}`,
          transform: "translateY(-1px)",
          borderColor: "primary.main",
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
            borderRight: { md: `1px solid ${themeDivider}` },
            borderBottom: { xs: `1px solid ${themeDivider}`, md: "none" },
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
            borderRight: { md: `1px solid ${themeDivider}` },
            borderBottom: { xs: `1px solid ${themeDivider}`, md: "none" },
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
            borderRight: { md: `1px solid ${themeDivider}` },
            borderBottom: { xs: `1px solid ${themeDivider}`, md: "none" },
          }}
        >
          <CampaignSalesWidget campaignId={campaign.campaign_id} accessToken={accessToken} />
          {canExportCampaign ? (
            <Stack
              alignItems="center"
              spacing={0}
              sx={{ position: "absolute", right: 8, bottom: 2 }}
            >
              <IconButton
                size="small"
                aria-label="Export"
                onClick={() => onOpenExport && onOpenExport(campaign)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <MdDownload size={15} />
              </IconButton>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, lineHeight: 1 }}>
                Export
              </Typography>
            </Stack>
          ) : null}
        </Stack>

        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent={{ xs: "flex-start", md: "center" }}
          sx={{ px: 1.25, py: 0.6, minHeight: { md: 74 } }}
          spacing={0.4}
        >
          {canManageCampaign ? (
            <LabeledAction
              icon={<MdPeople size={18} />}
              label="Team"
              onClick={() => onViewTeam && onViewTeam(campaign)}
            />
          ) : null}

          {isAdmin && (
            <LabeledAction
              icon={<MdDeleteForever size={18} />}
              label="Delete"
              color="error"
              onClick={() => onDeleteCampaign && onDeleteCampaign(campaign)}
            />
          )}

          {canManageCampaign ? (
            <>
              <LabeledAction
                icon={<MdViewList size={18} />}
                label={`Fields (${fieldCount})`}
                onClick={() => onEditFields && onEditFields(campaign)}
              />

              <LabeledAction
                icon={<MdSettings size={18} />}
                label="Settings"
                onClick={() => onOpenSettings && onOpenSettings(campaign)}
              />
            </>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}

