import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdRefresh } from "react-icons/md";
import { useDashboardData } from "../../hooks/useDashboards";
import WidgetCard, { WidgetCardSkeleton } from "./WidgetCard";

/**
 * DashboardViewer
 *
 * Read-only view of a single dashboard's computed widget data.
 * Props:
 *   accessToken  — JWT string
 *   dashboard    — dashboard object { dashboard_id, name, campaign_id, ... }
 *   canEdit      — show edit/delete controls on each widget (admin/team_lead)
 *   onEditWidget — (widgetResult) => void  — open edit dialog
 *   onDeleteWidget — (widgetResult) => void
 */
function DashboardViewer({ accessToken, dashboard, actorRole, canEdit = false, onEditWidget, onDeleteWidget }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  const { data, loading, error, reload } = useDashboardData(
    accessToken,
    dashboard?.dashboard_id,
    { dateFrom: appliedDateFrom, dateTo: appliedDateTo }
  );

  const handleApplyFilter = () => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const handleClearFilter = () => {
    setDateFrom("");
    setDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
  };

  const widgets = data?.widgets || [];

  return (
    <Stack spacing={2.5}>
      {/* Filter bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        flexWrap="wrap"
        useFlexGap
      >
        <TextField
          label="From date"
          type="datetime-local"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 190 }}
          inputProps={{ "aria-label": "Filter from date" }}
        />
        <TextField
          label="To date"
          type="datetime-local"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 190 }}
          inputProps={{ "aria-label": "Filter to date" }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleApplyFilter}
          disabled={loading}
          aria-label="Apply date filter"
        >
          Apply
        </Button>
        {(appliedDateFrom || appliedDateTo) && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilter}
            aria-label="Clear date filter"
          >
            Clear
          </Button>
        )}
        <Tooltip title="Refresh data">
          <span>
            <IconButton
              size="small"
              onClick={reload}
              disabled={loading}
              aria-label="Refresh dashboard data"
            >
              <MdRefresh />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Error */}
      {error && (
        <Alert severity="error" onClose={reload}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && widgets.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed #ead8c4",
            borderRadius: 3,
          }}
          role="status"
          aria-live="polite"
        >
          <Typography variant="h6" color="text.secondary">
            No widgets yet
          </Typography>
          {canEdit && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Use the Builder tab to add your first widget.
            </Typography>
          )}
        </Box>
      )}

      {/* Widget grid */}
      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i} sx={{ minWidth: 0 }}>
                <WidgetCardSkeleton />
              </Grid>
            ))
          : widgets.map((w) => (
              <Grid
                size={{
                  xs: 12,
                  sm: w.type === "metric" ? 6 : 12,
                  md: w.type === "metric" ? 4 : 12,
                }}
                key={w.widget_id}
                sx={{ minWidth: 0 }}
              >
                <WidgetCard
                  widget={w}
                  canEdit={canEdit}
                  onEdit={onEditWidget}
                  onDelete={onDeleteWidget}
                  accessToken={accessToken}
                  actorRole={actorRole}
                  onRefresh={reload}
                />
              </Grid>
            ))}
      </Grid>
    </Stack>
  );
}

export default DashboardViewer;
