import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MdDownload } from "react-icons/md";

import { fetchDataExports, requestDataExport } from "../services/adminService";

const STATUS_COLOR = {
  completed: "success",
  failed: "error",
  expired: "default",
  pending: "warning",
  running: "warning",
  retrying: "warning",
};

/**
 * Sprint 18 (docs/SPRINT_PLAN.md) - self-service tenant data export.
 * Runs as a background job on the backend (a large tenant's dump can
 * take real time), so this polls for status rather than expecting an
 * immediate result - same pattern as ReportViewer's export flow.
 */
export default function TenantDataExportPanel({ accessToken }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  const load = async () => {
    try {
      const items = await fetchDataExports(accessToken);
      setJobs(items);
    } catch (err) {
      setError(err.message || "Failed to load export history.");
    }
  };

  const hasInFlight = jobs.some((j) => ["pending", "running", "retrying"].includes(j.status_code));

  // Sprint 20 (docs/SPRINT_PLAN.md) hardening - the initial load now has
  // its own visible loading state (previously an in-flight fetch and a
  // genuinely empty history both rendered the same "No exports requested
  // yet" text).
  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Sprint 20 (docs/SPRINT_PLAN.md) hardening - this previously keyed off
  // `jobs.length`, which doesn't change when an in-flight job transitions
  // to a terminal status, so the interval kept firing every 5s forever
  // once started. Keying off the derived `hasInFlight` boolean means the
  // effect (and its cleanup) actually re-runs the moment there's nothing
  // left to poll for.
  useEffect(() => {
    if (!accessToken || !hasInFlight) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, hasInFlight]);

  const handleRequest = async () => {
    setRequesting(true);
    setError("");
    try {
      await requestDataExport(accessToken);
      await load();
    } catch (err) {
      setError(err.message || "Failed to start export.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
          Download a complete export of this workspace's data - useful before pausing or offboarding.
          Files are available for 7 days.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRequest}
          disabled={requesting}
          startIcon={requesting ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {requesting ? "Starting..." : "Export My Data"}
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LinearProgress sx={{ borderRadius: 4 }} />
      ) : jobs.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Requested</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="right">Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.export_job_id} hover>
                  <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip size="small" label={job.status_code} color={STATUS_COLOR[job.status_code] || "default"} />
                    {job.error_message ? (
                      <Typography variant="caption" color="error" display="block">{job.error_message}</Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>{job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "-"}</TableCell>
                  <TableCell align="right">
                    {job.status_code === "completed" && job.file_url ? (
                      <Link href={job.file_url} target="_blank" rel="noreferrer">
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                          <MdDownload /> Download
                        </Box>
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="text.secondary">No exports requested yet.</Typography>
      )}
    </Stack>
  );
}
