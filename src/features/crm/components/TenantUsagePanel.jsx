import { useEffect, useState } from "react";
import { Alert, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";

import { fetchTenantUsage } from "../services/adminService";

function formatMb(value) {
  const n = Number(value) || 0;
  return n >= 1024 ? `${(n / 1024).toFixed(2)} GB` : `${n.toFixed(1)} MB`;
}

function UsageRow({ label, used, allocated, formatValue = (v) => v }) {
  const usedNum = Number(used) || 0;
  const allocatedNum = Number(allocated) || 0;
  const pct = allocatedNum > 0 ? Math.min(100, (usedNum / allocatedNum) * 100) : 0;
  const overQuota = usedNum > allocatedNum;

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" fontWeight={500}>{label}</Typography>
        <Typography variant="body2" color={overQuota ? "error" : "text.secondary"}>
          {formatValue(usedNum)} / {formatValue(allocatedNum)}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={overQuota ? "error" : pct > 85 ? "warning" : "primary"}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Stack>
  );
}

/**
 * Sprint 17 (docs/SPRINT_PLAN.md) - the tenant's own Settings usage
 * display, reading GET /api/auth/admin/usage which is itself sourced
 * from the exact same BillingService.get_allocation()/get_usage() calls
 * the enforcement checks make - this display can never disagree with
 * what actually gets blocked.
 */
export default function TenantUsagePanel({ accessToken }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      // Sprint 20 (docs/SPRINT_PLAN.md) hardening - loading started true
      // and nothing else ever set it false on this path, so the panel
      // showed a permanent spinner (looked hung) whenever accessToken
      // wasn't ready yet, instead of just quietly waiting.
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchTenantUsage(accessToken)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load usage.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 0.5 }}>Usage &amp; Capacity</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Every plan runs the same product - a tier only controls how much capacity your workspace has.
          Contact support to raise any of these allowances.
        </Typography>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading ? <LinearProgress sx={{ borderRadius: 4 }} /> : null}

        {!loading && !error && data ? (
          <Stack spacing={2}>
            <UsageRow
              label="Team seats"
              used={data.usage.seats_used}
              allocated={data.allocation.seat_quota}
              formatValue={(v) => `${v}`}
            />
            <UsageRow
              label="Audio transcription"
              used={data.usage.transcription_mb_used}
              allocated={data.allocation.transcription_quota_mb}
              formatValue={formatMb}
            />
            <UsageRow
              label="File storage"
              used={data.usage.storage_mb_used}
              allocated={data.allocation.storage_quota_mb}
              formatValue={formatMb}
            />
            <UsageRow
              label="AI-assist actions (this month)"
              used={data.usage.ai_assist_actions_used}
              allocated={data.allocation.ai_assist_quota_count}
              formatValue={(v) => `${v}`}
            />
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}
