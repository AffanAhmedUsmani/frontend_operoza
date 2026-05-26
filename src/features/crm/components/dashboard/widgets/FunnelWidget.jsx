import { useMemo } from "react";
import {
  Alert,
  Box,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MdTrendingDown } from "react-icons/md";

/**
 * FunnelWidget — Shows conversion pipeline with drop-off percentages.
 * Progressive disclosure: displays all stages in order (Miller's Law).
 * Single responsibility: render funnel data only.
 */
export function FunnelWidget({ widget }) {
  if (widget.error) {
    return <Alert severity="warning" sx={{ mt: 1 }}>{widget.error}</Alert>;
  }

  if (!widget.funnel || widget.funnel.length === 0) {
    return <Typography variant="body2" color="text.secondary">No funnel data available</Typography>;
  }

  const stageRows = useMemo(() => {
    return widget.funnel.map((stage, idx) => ({
      ...stage,
      rank: idx + 1,
    }));
  }, [widget.funnel]);

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "text.secondary" }}>
          Conversion Funnel
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {widget.total || 0} total
        </Typography>
      </Box>

      {/* Primacy: show top stage first; recency: highlight last stage */}
      <TableContainer sx={{ borderRadius: 1, border: "1px solid #ead8c4" }}>
        <Table size="small" aria-label="Conversion funnel stages">
          <TableHead>
            <TableRow sx={{ bgcolor: "#fffaf3" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Stage</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Count</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stageRows.map((stage) => (
              <TableRow key={stage.stage} hover sx={{ "&:last-child td": { borderBottom: "2px solid #c05314" } }}>
                <TableCell sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{stage.rank}</TableCell>
                <TableCell sx={{ fontSize: "0.78rem", fontWeight: 500 }}>{stage.stage}</TableCell>
                <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 700, color: "primary.main" }}>
                  {stage.count}
                </TableCell>
                <TableCell sx={{ fontSize: "0.78rem" }}>
                  <Stack spacing={0.25}>
                    <LinearProgress
                      variant="determinate"
                      value={stage.percentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "#f5ece0",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background: "linear-gradient(90deg, #c05314 0%, #f58a3c 100%)",
                        },
                      }}
                      aria-label={`${stage.stage} progress: ${stage.percentage}%`}
                    />
                    <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                      {stage.percentage}%
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Optional: drop-off indicator (recency cue) */}
      {stageRows.length > 1 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pt: 1 }}>
          <MdTrendingDown size={14} color="#d32f2f" />
          <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
            Drop-off: {(
              ((stageRows[0].count - stageRows[stageRows.length - 1].count) / stageRows[0].count * 100) || 0
            ).toFixed(1)}%
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

export default FunnelWidget;
