import { useMemo } from "react";
import {
  Alert,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MdWarning } from "react-icons/md";
import { useTheme } from "@mui/material/styles";

/**
 * FlaggedCallsWidget — Highlights poor-quality calls (worst first).
 * Progressive Disclosure (Miller's Law): Show worst calls first, limited to avoid overwhelm.
 * Serial Position (Recency): Highest-severity issues first (lowest score first).
 * RBAC-gated: audio-only visibility enforced server-side.
 */
function FlaggedCallsWidget({ widget }) {
  const theme = useTheme();
  if (widget.error) {
    return <Alert severity="warning">{widget.error}</Alert>;
  }

  if (!widget.flagged_calls || widget.flagged_calls.length === 0) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2, bgcolor: "success.light", borderRadius: 1 }}>
        <MdWarning size={20} color={theme.palette.success.main} />
        <Typography variant="body2" fontWeight={600} color="success.dark">
          No flagged calls — quality is good!
        </Typography>
      </Box>
    );
  }

  const thresholds = widget.thresholds || { sentiment: 0.5, compliance: 0.7 };

  const rows = useMemo(() => {
    return widget.flagged_calls.map((call, idx) => ({
      ...call,
      rank: idx + 1,
    }));
  }, [widget.flagged_calls]);

  // Helper: determine severity badge color
  const getSeverityColor = (severity) => {
    if (severity < 0.3) return "error";
    if (severity < 0.6) return "warning";
    return "info";
  };

  return (
    <Stack spacing={2}>
      {/* Header with thresholds */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <MdWarning size={18} color={theme.palette.error.main} />
          <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "text.secondary", fontSize: "0.7rem" }}>
            Quality Issues
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Chip
            label={`Sentiment threshold: ${(thresholds.sentiment * 100).toFixed(0)}%`}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.65rem" }}
          />
          <Chip
            label={`Compliance threshold: ${(thresholds.compliance * 100).toFixed(0)}%`}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.65rem" }}
          />
        </Box>
      </Box>

      {/* Flagged calls table (worst first) */}
      <TableContainer sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider", maxHeight: 350, overflowY: "auto" }}>
        <Table size="small" stickyHeader aria-label="Flagged calls table">
          <TableHead>
            <TableRow sx={{ bgcolor: "brand.subtle" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", width: 32 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Lead Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Sentiment</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Compliance</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Severity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((call) => (
              <TableRow key={call.sale_id} hover>
                <TableCell sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                  {call.rank}
                </TableCell>
                <TableCell sx={{ fontSize: "0.78rem", fontWeight: 500 }}>
                  {call.lead_name}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: "0.78rem" }}>
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                    }}
                  >
                    {(call.sentiment * 100).toFixed(0)}%
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontSize: "0.78rem" }}>
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                    }}
                  >
                    {(call.compliance * 100).toFixed(0)}%
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: "0.78rem" }}>
                  <Chip
                    label={`${(call.severity * 100).toFixed(0)}%`}
                    size="small"
                    color={getSeverityColor(call.severity)}
                    variant="filled"
                    sx={{ fontWeight: 700, height: 20, fontSize: "0.65rem" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary footer (recency cue) */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
          Showing {widget.shown} of {widget.total_flagged} flagged calls
        </Typography>
        <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
          {((widget.total_flagged / Math.max(1, widget.total_flagged + 50)) * 100).toFixed(1)}% flagged rate
        </Typography>
      </Box>
    </Stack>
  );
}

export default FlaggedCallsWidget;
