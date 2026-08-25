import { useMemo } from "react";
import {
  Alert,
  Box,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { MdCheckCircle, MdWarning } from "react-icons/md";
import { useTheme } from "@mui/material/styles";

/**
 * TargetWidget — Compares actual performance against target goal.
 * Jakob's Law: predictable on_track boolean for quick status (familiar pattern).
 * Single responsibility: render target/actual comparison.
 */
export function TargetWidget({ widget }) {
  const theme = useTheme();
  if (widget.error) {
    return <Alert severity="warning" sx={{ mt: 1 }}>{widget.error}</Alert>;
  }

  const actual = parseFloat(widget.actual || 0);
  const target = parseFloat(widget.target || 0);
  const variance = parseFloat(widget.variance || 0);
  const percentToTarget = widget.percent_to_target || 0;
  const onTrack = widget.on_track === true;

  const currencyCode = widget.currency_code || "USD";

  const varianceFormatted = useMemo(() => {
    const fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      signDisplay: "always",
      maximumFractionDigits: 2,
    }).format(variance);
    return fmt;
  }, [variance, currencyCode]);

  const actualFormatted = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(actual);
  }, [actual, currencyCode]);

  const targetFormatted = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(target);
  }, [target, currencyCode]);

  return (
    <Stack spacing={2}>
      {/* Primacy: current status (Jakob's Law: predictable indicator) */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {onTrack ? (
          <>
            <MdCheckCircle size={24} color={theme.palette.success.main} />
            <Typography variant="subtitle2" fontWeight={700} color="success.dark">
              On Track
            </Typography>
          </>
        ) : (
          <>
            <MdWarning size={24} color={theme.palette.error.main} />
            <Typography variant="subtitle2" fontWeight={700} color="error.dark">
              Below Target
            </Typography>
          </>
        )}
      </Box>

      {/* Actual value: primary metric */}
      <Box>
        <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "text.secondary", fontSize: "0.7rem" }}>
          Actual
        </Typography>
        <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ lineHeight: 1 }}>
          {actualFormatted}
        </Typography>
      </Box>

      {/* Progress bar: visual representation */}
      <Box sx={{ pt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(percentToTarget, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "brand.subtle",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: onTrack
                ? `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`
                : `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
            },
          }}
          aria-label={`Progress to target: ${percentToTarget}%`}
        />
      </Box>

      {/* Target and variance: supporting details (Miller's Law: chunked) */}
      <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
            Target
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.88rem" }}>
            {targetFormatted}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
            Variance
          </Typography>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              fontSize: "0.88rem",
              color: variance >= 0 ? "success.main" : "error.main",
            }}
          >
            {varianceFormatted}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
            % to Target
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.88rem", color: "primary.main" }}>
            {percentToTarget.toFixed(1)}%
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}

export default TargetWidget;
