import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { MdAdd, MdFileUpload } from "react-icons/md";

import { useCampaigns } from "../hooks/useCampaigns";
import CampaignBuilder from "./campaigns/CampaignBuilder";
import CampaignCard from "./campaigns/CampaignCard";
import CampaignExportModal from "./campaigns/CampaignExportModal";
import CampaignFieldsModal from "./campaigns/CampaignFieldsModal";
import CampaignImportDialog from "./campaigns/CampaignImportDialog";
import CampaignSettingsModal from "./campaigns/CampaignSettingsModal";
import DeleteCampaignDialog from "./campaigns/DeleteCampaignDialog";
import TeamMembersModal from "./campaigns/TeamMembersModal";
import { resolveActorContext } from "./sales/salesFormUtils";

// Sprint 8 (docs/SPRINT_PLAN.md): this file was 801 lines, embedding the
// campaign-creation wizard (now CampaignBuilder.jsx) and the CSV/XLSX
// import dialog (now CampaignImportDialog.jsx) alongside this
// orchestrator - split into the three actual concerns per general
// guide's separation-of-concerns rule.
function CampaignsPanel({ accessToken }) {
  const [view, setView] = useState("list"); // "list" | "create"
  const [importOpen, setImportOpen] = useState(false);
  const [teamTarget, setTeamTarget] = useState(null);
  const [fieldsTarget, setFieldsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [settingsTarget, setSettingsTarget] = useState(null);
  const [exportTarget, setExportTarget] = useState(null);

  const userRole = resolveActorContext(accessToken).role;
  const canManageCampaigns = ["admin", "team_lead"].includes(userRole);

  const { campaigns, loading: isLoading, error: loadError, reload: loadCampaigns, patchCampaign } = useCampaigns(accessToken);

  const handleCreated = () => {
    setView("list");
    loadCampaigns();
  };

  if (view === "create" && canManageCampaigns) {
    return (
      <CampaignBuilder
        accessToken={accessToken}
        onCreated={handleCreated}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="h6">Campaigns</Typography>
        {canManageCampaigns ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdFileUpload />}
              onClick={() => setImportOpen(true)}
              sx={{ borderColor: "primary.light", color: "primary.dark" }}
            >
              Import CSV / Excel
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<MdAdd />}
              onClick={() => setView("create")}
            >
              New Campaign
            </Button>
          </Stack>
        ) : null}
      </Stack>

      {loadError ? (
        <Alert severity="error" action={<Button size="small" onClick={loadCampaigns}>Retry</Button>}>
          {loadError}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : null}

      {!isLoading && !loadError && campaigns.length === 0 ? (
        <Box sx={{ border: "2px dashed", borderColor: "divider", borderRadius: 2, p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {canManageCampaigns
              ? "No campaigns yet. Create your first campaign or import from a spreadsheet."
              : "No campaigns are currently assigned to you."}
          </Typography>
          {canManageCampaigns ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="center">
              <Button variant="contained" startIcon={<MdAdd />} onClick={() => setView("create")}>
                Create Campaign
              </Button>
              <Button
                variant="outlined"
                startIcon={<MdFileUpload />}
                onClick={() => setImportOpen(true)}
                sx={{ borderColor: "primary.light", color: "primary.dark" }}
              >
                Import from CSV / Excel
              </Button>
            </Stack>
          ) : null}
        </Box>
      ) : null}

      {!isLoading && campaigns.length > 0 ? (
        <Stack spacing={2} sx={{ width: "100%", maxWidth: 1280, mx: "auto" }}>
          {campaigns.map((campaign) => (
            <Box key={campaign.campaign_id || campaign.name} sx={{ width: "100%" }}>
              <CampaignCard
                campaign={campaign}
                accessToken={accessToken}
                userRole={userRole}
                onViewTeam={(c) => setTeamTarget(c)}
                onEditFields={(c) => setFieldsTarget(c)}
                onDeleteCampaign={(c) => setDeleteTarget(c)}
                onOpenSettings={(c) => setSettingsTarget(c)}
                onOpenExport={(c) => setExportTarget(c)}
              />
            </Box>
          ))}
        </Stack>
      ) : null}

      {canManageCampaigns ? (
        <CampaignImportDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          accessToken={accessToken}
          onImported={loadCampaigns}
        />
      ) : null}

      <TeamMembersModal
        open={!!teamTarget}
        campaign={teamTarget}
        accessToken={accessToken}
        onSaved={loadCampaigns}
        onClose={() => setTeamTarget(null)}
      />

      <DeleteCampaignDialog
        open={!!deleteTarget}
        campaign={deleteTarget}
        accessToken={accessToken}
        onDeleted={() => { loadCampaigns(); setDeleteTarget(null); }}
        onClose={() => setDeleteTarget(null)}
      />

      <CampaignSettingsModal
        open={!!settingsTarget}
        campaign={settingsTarget}
        accessToken={accessToken}
        onSaved={patchCampaign}
        onClose={() => setSettingsTarget(null)}
      />

      <CampaignExportModal
        open={!!exportTarget}
        campaign={exportTarget}
        accessToken={accessToken}
        onClose={() => setExportTarget(null)}
      />

      <CampaignFieldsModal
        open={!!fieldsTarget}
        campaign={fieldsTarget}
        accessToken={accessToken}
        onSaved={loadCampaigns}
        onClose={() => setFieldsTarget(null)}
      />
    </Stack>
  );
}

export default CampaignsPanel;
