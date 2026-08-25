import { useMemo } from "react";
import {
  Alert,
  Box,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { MdShowChart } from "react-icons/md";

/**
 * ROIWidget — Return on Investment calculator.
 * Shows revenue, cost, profit, and ROI% with visual progress.
 * Jakob's Law: Familiar finance metrics layout (primacy: ROI first).
 */
function ROIWidget({ widget }) {
  const theme = useTheme();

  if (widget.error) {
    return <Alert severity="warning">{widget.error}</Alert>;
  }

  const revenue = parseFloat(widget.revenue || 0);
  const cost = parseFloat(widget.cost || 0);
  const profit = parseFloat(widget.profit || 0);
  const roiPercent = widget.roi_percent || 0;

  const currencyCode = widget.currency_code || "USD";

  // Format as currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const revenueFormatted = useMemo(() => formatCurrency(revenue), [revenue, currencyCode]);
  const costFormatted = useMemo(() => formatCurrency(cost), [cost, currencyCode]);
  const profitFormatted = useMemo(() => formatCurrency(profit), [profit, currencyCode]);

  // ROI interpretation
  const roiColor =
    roiPercent > 100 ? theme.palette.success.main :
    roiPercent > 0 ? theme.palette.info.main :
    theme.palette.error.main;

  const roiLabel =
    roiPercent > 100 ? "Excellent" :
    roiPercent > 0 ? "Positive" :
    "Negative";

  return (
    <Stack spacing={2}>
      {/* Primacy: ROI metric first (largest) */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
        <MdShowChart size={24} color={roiColor} />
        <Stack spacing={0}>
          <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "text.secondary", fontSize: "0.7rem" }}>
            Return on Investment
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color: roiColor, lineHeight: 1 }}>
            {roiPercent.toFixed(1)}%
          </Typography>
          <Typography variant="caption" sx={{ color: roiColor, fontWeight: 600 }}>
            {roiLabel}
          </Typography>
        </Stack>
      </Box>

      {/* ROI progress bar */}
      <Box sx={{ pt: 0.5 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(Math.max(roiPercent, 0), 150)}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: theme.palette.action.hover,
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              background:
                roiPercent > 100
                  ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`
                  : roiPercent > 0
                  ? `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`
                  : `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
            },
          }}
          aria-label={`ROI: ${roiPercent}%`}
        />
      </Box>

      {/* Supporting metrics (Miller's Law: chunked) */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, pt: 1 }}>
        {/* Revenue box */}
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "success.light" }}>
          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>
            Revenue
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem", color: "success.dark", mt: 0.5 }}>
            {revenueFormatted}
          </Typography>
        </Box>

        {/* Cost box */}
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "warning.light" }}>
          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>
            Cost
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem", color: "warning.dark", mt: 0.5 }}>
            {costFormatted}
          </Typography>
        </Box>
      </Box>

      {/* Profit (recency cue: final metric) */}
      <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: profit >= 0 ? "action.hover" : "error.light", border: `1px solid ${profit >= 0 ? theme.palette.divider : theme.palette.error.light}` }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>
            Net Profit
          </Typography>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              fontSize: "1.2rem",
              color: profit >= 0 ? "success.main" : "error.main",
            }}
          >
            {profitFormatted}
          </Typography>
        </Box>
      </Box>

      {/* Formula note */}
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", fontStyle: "italic", pt: 0.5 }}>
        ROI = (Revenue - Cost) / Cost × 100
      </Typography>
    </Stack>
  );
}

export default ROIWidget;
