import { useMemo, useState } from "react";
import { Box, Card, Grid, Slider, Stack, Typography } from "@mui/material";

// Real rate card (billing/migrations/0002_seed_tier_rate_card.py) and
// Free-tier allowance (PLATFORM_OPS_AND_BILLING.md §1) - the same
// numbers already on PricingPage's tiles, just computed live instead
// of read from three fixed worked examples.
const FREE_SEATS = 10;
const FREE_TRANSCRIPTION_GB = 1;
const FREE_STORAGE_GB = 0.5;
const FREE_AI_ACTIONS = 20;

const RATE_SEAT = 2.0;
const RATE_TRANSCRIPTION_GB = 5.0;
const RATE_STORAGE_GB = 1.0;
const RATE_AI_ACTION = 0.25;

const DIMENSIONS = [
  { key: "seats", label: "Team seats", min: 1, max: 200, step: 1, free: FREE_SEATS, rate: RATE_SEAT, unit: "seat" },
  { key: "transcriptionGb", label: "Audio transcription (GB / month)", min: 0, max: 50, step: 0.5, free: FREE_TRANSCRIPTION_GB, rate: RATE_TRANSCRIPTION_GB, unit: "GB" },
  { key: "storageGb", label: "File storage (GB)", min: 0, max: 50, step: 0.5, free: FREE_STORAGE_GB, rate: RATE_STORAGE_GB, unit: "GB" },
  { key: "aiActions", label: "AI-assist actions / month", min: 0, max: 500, step: 5, free: FREE_AI_ACTIONS, rate: RATE_AI_ACTION, unit: "action" },
];

/**
 * Public-website UI/UX revamp - a real, live pricing calculator using
 * the exact same rate card as the static tiles above it on
 * PricingPage.jsx, not a separate/approximated formula. Every
 * dimension is billed independently past its own free allowance -
 * there's no bundled "plan" to jump between.
 */
export default function PriceCalculator() {
  const [values, setValues] = useState({ seats: 10, transcriptionGb: 1, storageGb: 0.5, aiActions: 20 });

  const breakdown = useMemo(
    () =>
      DIMENSIONS.map((dim) => {
        const overage = Math.max(0, values[dim.key] - dim.free);
        return { ...dim, overage, cost: overage * dim.rate };
      }),
    [values]
  );

  const total = breakdown.reduce((sum, dim) => sum + dim.cost, 0);

  return (
    <Card sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider" }}>
      <Typography variant="h2" sx={{ mb: 0.5, fontSize: "1.4rem" }}>Estimate Your Own Cost</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Move the sliders to your team's real footprint - this uses the exact rates above, live.
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3.5}>
            {DIMENSIONS.map((dim) => (
              <Box key={dim.key}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>{dim.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {values[dim.key]} {dim.unit}{values[dim.key] === 1 ? "" : "s"}
                  </Typography>
                </Stack>
                <Slider
                  value={values[dim.key]}
                  min={dim.min}
                  max={dim.max}
                  step={dim.step}
                  onChange={(_e, newValue) => setValues((prev) => ({ ...prev, [dim.key]: newValue }))}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  Free up to {dim.free} {dim.unit}{dim.free === 1 ? "" : "s"}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack
            spacing={1.5}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "brand.subtle",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">Estimated monthly cost</Typography>
            <Typography variant="h2" sx={{ fontSize: "2.6rem" }}>
              ${total.toFixed(2)}
              <Typography component="span" variant="body1" color="text.secondary"> /month</Typography>
            </Typography>
            <Stack spacing={0.5} sx={{ pt: 1 }}>
              {breakdown
                .filter((dim) => dim.overage > 0)
                .map((dim) => (
                  <Stack direction="row" justifyContent="space-between" key={dim.key}>
                    <Typography variant="caption" color="text.secondary">{dim.label}</Typography>
                    <Typography variant="caption" fontWeight={600}>${dim.cost.toFixed(2)}</Typography>
                  </Stack>
                ))}
              {total === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  Fully within the free tier - $0/month.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
}
