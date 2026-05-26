import { useMemo } from "react";
import {
  Alert,
  Box,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MdAttachMoney } from "react-icons/md";

/**
 * CommissionWidget — Shows earnings breakdown by agent or total.
 * Recency: highest earners first (Serial Position Effect).
 * Single responsibility: render commission data.
 * Progressive disclosure: by_agent sorted by total descending.
 */
export function CommissionWidget({ widget }) {
  if (widget.error) {
    return <Alert severity="warning" sx={{ mt: 1 }}>{widget.error}</Alert>;
  }

  const totalFormatted = useMemo(() => {
    const val = parseFloat(widget.total || 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  }, [widget.total]);

  const agentRows = useMemo(() => {
    if (!widget.by_agent || widget.by_agent.length === 0) return [];
    return widget.by_agent.map((row, idx) => ({
      ...row,
      rank: idx + 1,
      formatted: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(parseFloat(row.total || 0)),
    }));
  }, [widget.by_agent]);

  const showBreakdown = widget.by_agent && widget.by_agent.length > 0;

  return (
    <Stack spacing={2}>
      {/* Primacy: total commission first (Jakob's Law) */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <MdAttachMoney size={24} color="#0f8a7a" />
        <Stack spacing={0}>
          <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "text.secondary", fontSize: "0.7rem" }}>
            Total Commission
          </Typography>
          <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ lineHeight: 1 }}>
            {totalFormatted}
          </Typography>
        </Stack>
      </Box>

      {showBreakdown && (
        <>
          <Divider sx={{ my: 0.5 }} />

          {/* Recency: breakdown by agent (highest earners first) */}
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "text.secondary", fontSize: "0.7rem", mb: 1 }}>
              By Agent ({agentRows.length})
            </Typography>

            <TableContainer sx={{ borderRadius: 1, border: "1px solid #ead8c4", maxHeight: 250, overflowY: "auto" }}>
              <Table size="small" stickyHeader aria-label="Commission breakdown by agent">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#fffaf3" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Agent</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agentRows.map((row) => (
                    <TableRow key={row.agent_id} hover>
                      <TableCell sx={{ fontSize: "0.78rem", fontWeight: 500 }}>
                        {row.agent_name}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 700, color: "success.main" }}>
                        {row.formatted}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}

      {!showBreakdown && (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
          No agent breakdown configured
        </Typography>
      )}
    </Stack>
  );
}

export default CommissionWidget;
