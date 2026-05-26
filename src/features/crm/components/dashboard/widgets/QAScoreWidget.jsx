import { useMemo } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

/**
 * QAScoreWidget — Displays audio quality metrics (sentiment & compliance averages).
 * Miller's Law: Split sentiment and compliance into separate blocks (chunked choices).
 * RBAC-gated: audio_allowed enforced server-side (graceful error if unauthorized).
 */
function QAScoreWidget({ widget }) {
  const theme = useTheme();

  if (widget.error) {
    return <Alert severity="warning">{widget.error}</Alert>;
  }

  if (!widget.sentiment && !widget.compliance) {
    return (
      <Typography variant="body2" color="text.secondary">
        No QA data available
      </Typography>
    );
  }

  // Helper: render a gauge-style progress ring
  const ScoreGauge = ({ label, score, samples }) => {
    const normalizedScore = Math.min(Math.max(score * 100, 0), 100);
    const scoreColor =
      normalizedScore >= 70 ? theme.palette.success.main : 
      normalizedScore >= 50 ? theme.palette.warning.main : 
      theme.palette.error.main;

    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Box sx={{ position: "relative", width: 100, height: 100 }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={100}
            thickness={4}
            sx={{ color: theme.palette.action.hover }}
          />
          <CircularProgress
            variant="determinate"
            value={normalizedScore}
            size={100}
            thickness={4}
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              color: scoreColor,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.2rem" }}>
              {score.toFixed(2)}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" fontWeight={600} sx={{ mt: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          n={samples}
        </Typography>
      </Box>
    );
  };

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box>
        <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "text.secondary", fontSize: "0.7rem" }}>
          Call Quality Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.5 }}>
          {widget.total_calls} calls analyzed
        </Typography>
      </Box>

      {/* Metric Gauges (Miller's Law: chunked into two blocks) */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {widget.sentiment && (
          <ScoreGauge
            label="Sentiment"
            score={widget.sentiment.average}
            samples={widget.sentiment.samples}
          />
        )}
        {widget.compliance && (
          <ScoreGauge
            label="Compliance"
            score={widget.compliance.average}
            samples={widget.compliance.samples}
          />
        )}
      </Box>

      {/* Footer note */}
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", fontStyle: "italic", pt: 1 }}>
        Scale: 0.00 (poor) to 1.00 (excellent)
      </Typography>
    </Stack>
  );
}

export default QAScoreWidget;
