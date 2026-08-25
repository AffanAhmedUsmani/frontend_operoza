import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  MdAudiotrack,
  MdAutoAwesome,
  MdCancel,
  MdCheckCircle,
  MdGraphicEq,
  MdLock,
  MdPending,
  MdSentimentNeutral,
  MdSentimentSatisfied,
  MdSentimentDissatisfied,
} from "react-icons/md";
import { useTheme } from "@mui/material/styles";
import { requestCoachingNote } from "../../services/salesService";
import UpgradeRequiredModal from "../UpgradeRequiredModal";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds || typeof seconds !== "number") return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function sentimentMeta(sentiment) {
  const s = (sentiment || "").toLowerCase();
  if (s.includes("positive"))
    return { label: "Positive", color: "success", icon: <MdSentimentSatisfied size={16} /> };
  if (s.includes("negative") || s.includes("dissatisfied"))
    return { label: "Negative", color: "error", icon: <MdSentimentDissatisfied size={16} /> };
  return { label: "Neutral", color: "default", icon: <MdSentimentNeutral size={16} /> };
}

function sentimentFromScore(score) {
  if (typeof score !== "number") return null;
  if (score > 0.2) return "positive";
  if (score < -0.2) return "negative";
  return "neutral";
}

function normalizeAnalysis(entry) {
  const analysis = entry?.analysis ?? {};

  // Legacy shape support.
  const legacySummary = typeof analysis.summary === "string" ? analysis.summary : null;
  const legacySentiment = typeof analysis.sentiment === "string" ? analysis.sentiment : null;
  const legacyChecks =
    analysis.checks && typeof analysis.checks === "object" && !Array.isArray(analysis.checks)
      ? analysis.checks
      : null;

  // New pipeline shape support.
  const summaryOutputs =
    analysis.summary_outputs && typeof analysis.summary_outputs === "object"
      ? analysis.summary_outputs
      : {};
  const summaryFromOutputs = Object.values(summaryOutputs).find((v) => typeof v === "string" && v.trim()) || null;

  let summaryFromQuestions = null;
  const analysisResults = analysis.analysis_results;
  if (analysisResults && typeof analysisResults === "object" && !Array.isArray(analysisResults)) {
    for (const row of Object.values(analysisResults)) {
      if (
        row &&
        typeof row === "object" &&
        String(row.type || "").toLowerCase() === "summary" &&
        typeof row.value === "string" &&
        row.value.trim()
      ) {
        summaryFromQuestions = row.value;
        break;
      }
    }
  }

  const aggregateSentiment = analysis?.aggregates?.sentiment_score;
  const sentiment = legacySentiment || sentimentFromScore(aggregateSentiment);

  const ruleResults = Array.isArray(analysis.rule_results) ? analysis.rule_results : [];
  const checksFromRules = {};
  for (const rule of ruleResults) {
    const key = String(rule?.id || rule?.label || "").trim();
    if (!key) continue;
    let text = null;
    const spans = rule?.evidence?.spans;
    if (Array.isArray(spans) && spans.length > 0) {
      const firstSnippet = spans[0]?.snippet;
      if (firstSnippet) text = String(firstSnippet);
    }
    checksFromRules[key] = {
      passed: !!rule?.passed,
      score: typeof rule?.confidence === "number" ? rule.confidence : null,
      text,
    };
  }

  const duration =
    analysis?.duration_seconds ??
    analysis?.transcript_metadata?.duration_seconds ??
    null;

  const transcript =
    (typeof analysis?.transcript_metadata?.transcript === "string" && analysis.transcript_metadata.transcript.trim())
      ? analysis.transcript_metadata.transcript
      : null;

  return {
    summary: legacySummary || summaryFromOutputs || summaryFromQuestions,
    transcript,
    sentiment,
    checks: legacyChecks || checksFromRules,
    duration,
    talkRatio: analysis?.talk_ratio_agent ?? null,
  };
}

function CheckRow({ name, result }) {
  const theme = useTheme();
  const passed = result?.passed === true;
  const score = typeof result?.score === "number" ? result.score : null;
  const text = result?.text ?? null;
  const label = name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.75 }}>
      {passed ? (
        <MdCheckCircle size={18} color={theme.palette.success.main} style={{ marginTop: 2, flexShrink: 0 }} />
      ) : (
        <MdCancel size={18} color={theme.palette.error.main} style={{ marginTop: 2, flexShrink: 0 }} />
      )}
      <Stack flex={1} spacing={0.25}>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        {text && (
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
            {text}
          </Typography>
        )}
        {score !== null && (
          <Stack direction="row" spacing={1} alignItems="center">
            <LinearProgress
              variant="determinate"
              value={Math.round(score * 100)}
              color={passed ? "success" : "error"}
              sx={{ flex: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 36 }}>
              {Math.round(score * 100)}%
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

function AnalysisCard({ fieldKey, entry, saleId, accessToken }) {
  const normalized = normalizeAnalysis(entry);
  const summary = normalized.summary;
  const transcript = normalized.transcript;
  const sentiment = normalized.sentiment;
  const checks = normalized.checks || {};
  const duration = normalized.duration;
  const talkRatio = normalized.talkRatio;
  const fileUrl = entry?.file_url ?? null;
  // Sprint 14 (docs/SPRINT_PLAN.md): `locked` is now set true the moment
  // audio is uploaded (it blocks re-upload), well before analysis has run -
  // it no longer implies completion. `status` ("pending"|"failed"|
  // "completed") is what actually reflects analyzer progress; entries from
  // before this sprint have no `status` key at all, so a missing status on
  // an already-locked entry is treated as the legacy "completed" case.
  const status = entry?.status ?? (entry?.locked ? "completed" : "pending");

  const sentMeta = sentimentMeta(sentiment);
  const checkEntries = Object.entries(checks);
  const fieldLabel = fieldKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const hasContent = transcript || summary || sentiment || checkEntries.length > 0 || duration;

  const chipMeta =
    status === "failed"
      ? { color: "error", icon: <MdCancel size={12} />, label: "Analysis failed" }
      : status === "pending"
      ? { color: "warning", icon: <MdPending size={12} />, label: "Pending" }
      : { color: "success", icon: <MdLock size={12} />, label: "Analysis complete" };

  const [coachingNote, setCoachingNote] = useState("");
  const [coachingError, setCoachingError] = useState("");
  const [coachingLoading, setCoachingLoading] = useState(false);
  const [upgradeModalReason, setUpgradeModalReason] = useState(null);

  const handleCoachingNote = async () => {
    if (!accessToken || !saleId) return;
    setCoachingLoading(true);
    setCoachingError("");
    try {
      const result = await requestCoachingNote(accessToken, saleId, fieldKey);
      setCoachingNote(result?.note || "");
    } catch (err) {
      // PLATFORM_OPS_AND_BILLING.md S3 - a real ai_assist_action quota
      // block (crm/ai_assist.py's AIAssistQuotaService), not a generic
      // failure - point the admin at support instead of a bare string.
      if (err.data?.code === "ai_assist_quota_exceeded") {
        setUpgradeModalReason("ai_assist_quota_exceeded");
      } else {
        setCoachingError(err.message || "Failed to generate coaching note.");
      }
    } finally {
      setCoachingLoading(false);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MdAudiotrack size={18} />
              <Typography variant="subtitle2">{fieldLabel}</Typography>
            </Stack>
            <Chip size="small" icon={chipMeta.icon} color={chipMeta.color} label={chipMeta.label} />
          </Stack>

          {/* Audio link */}
          {fileUrl && (
            <Box>
              <audio
                controls
                src={fileUrl}
                style={{ width: "100%", height: 40 }}
              />
            </Box>
          )}

          {status === "failed" && (
            <Typography variant="body2" color="error">
              Analysis failed{entry?.error ? `: ${entry.error}` : "."}
            </Typography>
          )}

          {status === "pending" && (
            <Typography variant="body2" color="text.secondary">
              Analysis is processing - check back shortly.
            </Typography>
          )}

          {status === "completed" && !hasContent && (
            <Typography variant="body2" color="text.secondary">
              No analysis details available yet.
            </Typography>
          )}

          {/* Full transcript (preferred when available) */}
          {transcript && (
            <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                CALL TRANSCRIPT
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {transcript}
              </Typography>
            </Box>
          )}

          {/* Keep summary as fallback for older payloads without transcript */}
          {!transcript && summary && (
            <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                CALL SUMMARY
              </Typography>
              <Typography variant="body2">{summary}</Typography>
            </Box>
          )}

          {/* Sentiment + stats row */}
          {(sentiment || duration || talkRatio !== null) && (
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {sentiment && (
                <Chip
                  size="small"
                  icon={sentMeta.icon}
                  label={`Sentiment: ${sentMeta.label}`}
                  color={sentMeta.color}
                  variant="outlined"
                />
              )}
              {duration && (
                <Chip
                  size="small"
                  icon={<MdGraphicEq size={14} />}
                  label={`Duration: ${formatDuration(duration)}`}
                  variant="outlined"
                />
              )}
              {talkRatio !== null && (
                <Chip
                  size="small"
                  label={`Agent talk: ${Math.round(talkRatio * 100)}%`}
                  variant="outlined"
                />
              )}
            </Stack>
          )}

          {/* Checks */}
          {checkEntries.length > 0 && (
            <>
              <Divider />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                QUALITY CHECKS
              </Typography>
              <Stack divider={<Divider flexItem />}>
                {checkEntries.map(([name, result]) => (
                  <CheckRow key={name} name={name} result={result} />
                ))}
              </Stack>
            </>
          )}

          {status === "completed" && (
            <>
              <Divider />
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCoachingNote}
                  disabled={coachingLoading}
                  startIcon={coachingLoading ? <CircularProgress size={14} color="inherit" /> : <MdAutoAwesome />}
                >
                  {coachingLoading ? "Generating..." : "Get Coaching Note"}
                </Button>
              </Box>
              {coachingError ? <Alert severity="error">{coachingError}</Alert> : null}
              {coachingNote ? (
                <Alert severity="info" icon={<MdAutoAwesome />}>
                  {coachingNote}
                </Alert>
              ) : null}
            </>
          )}
        </Stack>
      </CardContent>
      <UpgradeRequiredModal
        open={!!upgradeModalReason}
        onClose={() => setUpgradeModalReason(null)}
        reasonCode={upgradeModalReason}
      />
    </Card>
  );
}

export default function SaleAnalysisDialog({ open, sale, accessToken, onClose }) {
  const theme = useTheme();
  const entries = Object.entries(sale?.audio_analysis_json || {});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack>
          <Typography variant="h6">Call Analysis</Typography>
          {sale?.lead_name && (
            <Typography variant="caption" color="text.secondary">
              {sale.lead_name}
            </Typography>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {!sale ? null : entries.length === 0 ? (
          <Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
            <MdGraphicEq size={40} color={theme.palette.text.disabled} />
            <Typography color="text.secondary">No audio analysis available for this sale.</Typography>
            <Typography variant="caption" color="text.secondary">
              Upload an audio file in the sale editor to trigger analysis.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {entries.map(([fieldKey, entry]) => (
              <AnalysisCard
                key={fieldKey}
                fieldKey={fieldKey}
                entry={entry}
                saleId={sale?.sale_id}
                accessToken={accessToken}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
