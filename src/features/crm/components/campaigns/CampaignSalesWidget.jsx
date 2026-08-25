import { useEffect, useState } from "react";
import {
  ButtonGroup,
  Button,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MdTrendingUp } from "react-icons/md";
import { fetchCampaignStats } from "../../services/campaignService";

const PERIODS = [
  { value: "all", label: "All" },
  { value: "day", label: "Today" },
  { value: "month", label: "Month" },
];

export default function CampaignSalesWidget({ campaignId, accessToken }) {
  const theme = useTheme();
  const [period, setPeriod] = useState("all");
  const [totals, setTotals] = useState({ all: null, day: null, month: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId || !accessToken) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetchCampaignStats(accessToken, campaignId, "all"),
      fetchCampaignStats(accessToken, campaignId, "day"),
      fetchCampaignStats(accessToken, campaignId, "month"),
    ])
      .then(([allData, dayData, monthData]) => {
        if (!active) return;
        setTotals({ all: allData?.total ?? 0, day: dayData?.total ?? 0, month: monthData?.total ?? 0 });
      })
      .catch(() => {
        if (!active) return;
        setTotals({ all: null, day: null, month: null });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [campaignId, accessToken]);

  const activeTotal = totals[period];
  const periodLabel = period === "all" ? "All time" : period === "day" ? "Today" : "Month";

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <MdTrendingUp size={14} color={theme.palette.primary.light} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Sales
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {loading ? (
          <Skeleton variant="text" width={90} height={26} />
        ) : (
          <Tooltip title={activeTotal === null ? "Stats unavailable" : `${activeTotal} sales this ${periodLabel.toLowerCase()}`}>
            <Typography variant="h6" fontWeight={700} color={activeTotal ? "success.main" : "text.secondary"} lineHeight={1}>
              {activeTotal === null ? "—" : activeTotal}
            </Typography>
          </Tooltip>
        )}
        <ButtonGroup size="small" variant="outlined" sx={{ "& .MuiButton-root": { py: 0, minWidth: 52, fontSize: 11, lineHeight: 1.2 } }}>
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              variant={period === p.value ? "contained" : "outlined"}
              sx={
                period === p.value
                  ? { bgcolor: "primary.light", borderColor: "primary.light", color: "primary.contrastText", "&:hover": { bgcolor: "primary.main" } }
                  : { borderColor: "divider", color: "primary.dark" }
              }
            >
              {p.label}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
    </Stack>
  );
}
