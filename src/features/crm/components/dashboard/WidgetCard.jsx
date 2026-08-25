import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MdDelete, MdEdit, MdSave, MdClose } from "react-icons/md";
import { updateSale } from "../../services/salesService";
import FunnelWidget from "./widgets/FunnelWidget";
import LeaderboardWidget from "./widgets/LeaderboardWidget";
import CommissionWidget from "./widgets/CommissionWidget";
import TargetWidget from "./widgets/TargetWidget";
import QAScoreWidget from "./widgets/QAScoreWidget";
import FlaggedCallsWidget from "./widgets/FlaggedCallsWidget";
import ROIWidget from "./widgets/ROIWidget";
import { evaluateSafeExpression } from "./safeExpressionEvaluator";

const INLINE_EDIT_ROLES = new Set(["admin", "client"]);

// Post-Sprint-20 - the central color controller (theme.js's buildTheme())
// only produces MUI theme tokens, which recharts' own props (stroke,
// fill, stopColor...) can't resolve on their own - they need real color
// values. This is the one place per-tenant color has to be read out of
// the theme object explicitly rather than via an sx token string, so
// chart segments still track the tenant's palette instead of a
// hardcoded 6-color array.
function getChartColors(theme) {
  return [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.primary.dark,
    theme.palette.secondary.dark,
  ];
}

// Sprint 7 (docs/SPRINT_PLAN.md) - CRITICAL fix: this used to build and
// `new Function(...)` a tenant-authored expression string directly -
// genuine stored-XSS, since this component renders once per table row for
// every viewer of the dashboard. evaluateSafeExpression (imported above)
// never constructs or executes code from the string; see
// safeExpressionEvaluator.js for the full explanation.
const evaluateComputedColumn = evaluateSafeExpression;

function MetricWidget({ widget }) {
  if (widget.error) {
    return <Alert severity="warning" sx={{ mt: 1 }}>{widget.error}</Alert>;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
        Live Metric
      </Typography>
      <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ lineHeight: 1 }}>
        {widget.value ?? "—"}
      </Typography>
    </Stack>
  );
}

function renderChartByVariant(data, variant, theme) {
  const chartColors = getChartColors(theme);
  const gridColor = theme.palette.divider;
  const tickStyle = { fontSize: 11, fill: theme.palette.text.secondary };
  const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
  };

  if (variant === "line") {
    return (
      <LineChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="label" tick={tickStyle} interval={0} angle={data.length > 7 ? -25 : 0} textAnchor={data.length > 7 ? "end" : "middle"} height={data.length > 7 ? 62 : 36} />
        <YAxis tick={tickStyle} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    );
  }

  if (variant === "area") {
    return (
      <AreaChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 18 }}>
        <defs>
          <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.75} />
            <stop offset="95%" stopColor={theme.palette.primary.light} stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="label" tick={tickStyle} interval={0} angle={data.length > 7 ? -25 : 0} textAnchor={data.length > 7 ? "end" : "middle"} height={data.length > 7 ? 62 : 36} />
        <YAxis tick={tickStyle} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2.5} fill="url(#dashboardArea)" />
      </AreaChart>
    );
  }

  if (variant === "pie") {
    return (
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={110} innerRadius={45} paddingAngle={3}>
          {data.map((_, idx) => <Cell key={idx} fill={chartColors[idx % chartColors.length]} />)}
        </Pie>
        <Legend verticalAlign="bottom" height={36} />
        <RechartsTooltip contentStyle={tooltipStyle} />
      </PieChart>
    );
  }

  return (
    <BarChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 18 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
      <XAxis dataKey="label" tick={tickStyle} interval={0} angle={data.length > 7 ? -25 : 0} textAnchor={data.length > 7 ? "end" : "middle"} height={data.length > 7 ? 62 : 36} />
      <YAxis tick={tickStyle} />
      <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: alpha(theme.palette.primary.main, 0.12) }} />
      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
        {data.map((_, idx) => <Cell key={idx} fill={chartColors[idx % chartColors.length]} />)}
      </Bar>
    </BarChart>
  );
}

function ChartWidget({ widget }) {
  const theme = useTheme();

  if (widget.error) {
    return <Alert severity="warning">{widget.error}</Alert>;
  }

  const data = (widget.data || []).map((point) => ({ label: point.label, value: parseFloat(point.value) || 0 }));
  const variant = widget.config_json?.chart_variant || "bar";

  if (data.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data to display.</Typography>;
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0, minHeight: 340, height: 340 }} role="img" aria-label={`${widget.title} ${variant} chart`}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChartByVariant(data, variant, theme)}
      </ResponsiveContainer>
    </Box>
  );
}

function TableWidget({ widget, accessToken, actorRole, onRefresh }) {
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [draftPayload, setDraftPayload] = useState({});
  const [savingSaleId, setSavingSaleId] = useState(null);
  const [rowError, setRowError] = useState("");

  const rows = widget.rows || [];
  const canInlineEdit = INLINE_EDIT_ROLES.has(actorRole) && widget.config_json?.editable !== false;

  const columns = useMemo(() => {
    const configCols = widget.config_json?.columns;
    if (Array.isArray(configCols) && configCols.length > 0) {
      return configCols
        .map((ref, index) => {
          if (typeof ref === "string") {
            const dotIdx = ref.indexOf(".");
            if (dotIdx === -1) return { kind: "field", ns: ref, key: null, label: ref };
            return { kind: "field", ns: ref.slice(0, dotIdx), key: ref.slice(dotIdx + 1), label: ref, ref };
          }

          if (ref && typeof ref === "object" && (ref.kind === "computed" || ref.expression)) {
            return {
              kind: "computed",
              label: ref.label || `Calculated ${index + 1}`,
              expression: ref.expression || "",
            };
          }

          return null;
        })
        .filter(Boolean);
    }
    if (rows.length === 0) return [];
    const firstRow = rows[0];
    const namespaces = Object.keys(firstRow);
    return namespaces.flatMap((ns) =>
      typeof firstRow[ns] === "object" && firstRow[ns] !== null
        ? Object.keys(firstRow[ns]).map((k) => ({ kind: "field", ns, key: k, label: `${ns}.${k}` }))
        : [{ kind: "field", ns, key: null, label: ns }]
    );
  }, [rows, widget.config_json?.columns]);

  if (widget.error) {
    return <Alert severity="warning">{widget.error}</Alert>;
  }

  if (rows.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data available.</Typography>;
  }

  const startEdit = (row) => {
    const saleId = row?.sale?.sale_id;
    setEditingSaleId(saleId);
    setDraftPayload({ ...(row.payload || {}) });
    setRowError("");
  };

  const cancelEdit = () => {
    setEditingSaleId(null);
    setDraftPayload({});
    setRowError("");
  };

  const saveEdit = async (row) => {
    const saleId = row?.sale?.sale_id;
    if (!saleId) return;
    setSavingSaleId(saleId);
    setRowError("");
    try {
      await updateSale(accessToken, saleId, { payload_json: draftPayload });
      setEditingSaleId(null);
      setDraftPayload({});
      await onRefresh?.();
    } catch (err) {
      setRowError(err.message || "Failed to save row changes");
    } finally {
      setSavingSaleId(null);
    }
  };

  return (
    <Box>
      {rowError ? <Alert severity="error" sx={{ mb: 1.5 }}>{rowError}</Alert> : null}
      <TableContainer sx={{ maxHeight: 420, overflowY: "auto", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Table size="small" stickyHeader aria-label={`${widget.title} table`}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.label} sx={{ fontWeight: 700, bgcolor: "brand.subtle", fontSize: "0.72rem" }}>
                  {col.label}
                </TableCell>
              ))}
              {canInlineEdit ? <TableCell sx={{ fontWeight: 700, bgcolor: "brand.subtle", width: 96 }}>Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => {
              const saleId = row?.sale?.sale_id || i;
              const isEditing = editingSaleId === row?.sale?.sale_id;
              return (
                <TableRow key={saleId} hover>
                  {columns.map((col) => {
                    const val = col.kind === "computed"
                      ? evaluateComputedColumn(col.expression, row)
                      : col.key !== null
                        ? row[col.ns]?.[col.key]
                        : row[col.ns];
                    const isEditablePayloadCell = isEditing && col.kind !== "computed" && col.ns === "payload" && col.key !== null;
                    return (
                      <TableCell key={`${saleId}-${col.label}`} sx={{ fontSize: "0.78rem", verticalAlign: "top" }}>
                        {isEditablePayloadCell ? (
                          <TextField
                            size="small"
                            value={draftPayload[col.key] ?? ""}
                            onChange={(e) => setDraftPayload((prev) => ({ ...prev, [col.key]: e.target.value }))}
                            fullWidth
                          />
                        ) : val === null || val === undefined ? (
                          "—"
                        ) : (
                          String(val)
                        )}
                      </TableCell>
                    );
                  })}
                  {canInlineEdit ? (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Save row">
                            <span>
                              <IconButton size="small" color="primary" onClick={() => saveEdit(row)} disabled={savingSaleId === row?.sale?.sale_id}>
                                <MdSave size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Cancel edit">
                            <IconButton size="small" onClick={cancelEdit} disabled={savingSaleId === row?.sale?.sale_id}>
                              <MdClose size={16} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Tooltip title="Edit payload fields in this row">
                          <IconButton size="small" onClick={() => startEdit(row)}>
                            <MdEdit size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
        Showing {rows.length} of {widget.total ?? rows.length} rows
      </Typography>
    </Box>
  );
}

export function WidgetCardSkeleton() {
  return (
    <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
      <CardHeader title={<Skeleton width="55%" height={20} />} subheader={<Skeleton width="30%" height={14} />} />
      <CardContent>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
}

function WidgetCard({ widget, canEdit = false, onEdit, onDelete, accessToken, actorRole, onRefresh }) {
  const typeLabel = widget.type ? widget.type.charAt(0).toUpperCase() + widget.type.slice(1) : "";

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
      <CardHeader
        title={<Typography variant="subtitle1" fontWeight={700} noWrap>{widget.title}</Typography>}
        subheader={<Chip label={typeLabel} size="small" sx={{ bgcolor: "brand.subtle", color: "primary.dark", fontWeight: 700, fontSize: "0.68rem", height: 18, mt: 0.25 }} />}
        action={canEdit ? (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit widget">
              <IconButton size="small" onClick={() => onEdit?.(widget)} aria-label={`Edit ${widget.title}`}>
                <MdEdit size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete widget">
              <IconButton size="small" onClick={() => onDelete?.(widget)} aria-label={`Delete ${widget.title}`} color="error">
                <MdDelete size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null}
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ pt: 1, flexGrow: 1 }}>
        {widget.type === "metric" && <MetricWidget widget={widget} />}
        {widget.type === "table" && <TableWidget widget={widget} accessToken={accessToken} actorRole={actorRole} onRefresh={onRefresh} />}
        {widget.type === "chart" && <ChartWidget widget={widget} />}
        {widget.type === "funnel" && <FunnelWidget widget={widget} />}
        {widget.type === "leaderboard" && <LeaderboardWidget widget={widget} actorUserId={window.__actorUserId} />}
        {widget.type === "commission" && <CommissionWidget widget={widget} />}
        {widget.type === "target" && <TargetWidget widget={widget} />}
        {widget.type === "qa_score" && <QAScoreWidget widget={widget} />}
        {widget.type === "flagged_calls" && <FlaggedCallsWidget widget={widget} />}
        {widget.type === "roi" && <ROIWidget widget={widget} />}
        {! ["metric", "table", "chart", "funnel", "leaderboard", "commission", "target", "qa_score", "flagged_calls", "roi"].includes(widget.type) && (
          <Typography variant="body2" color="text.secondary">Unknown widget type: {widget.type}</Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default WidgetCard;