function normalizeSchema(campaign) {
  const schema = Array.isArray(campaign?.schema_json) ? campaign.schema_json : [];
  return schema.filter((field) => field && field.key && field.label);
}

function firstMatchingField(schema, predicate, fallback) {
  return schema.find(predicate)?.key || fallback;
}

function numericPayloadField(schema) {
  return firstMatchingField(
    schema,
    (field) => field.type === "number",
    null
  );
}

function selectPayloadField(schema) {
  return firstMatchingField(
    schema,
    (field) => field.type === "select",
    null
  );
}

function textPayloadField(schema) {
  return firstMatchingField(
    schema,
    (field) => ["text", "textarea"].includes(field.type),
    null
  );
}

function payloadRef(key) {
  return key ? `payload.${key}` : null;
}

export const DASHBOARD_TEMPLATE_PRESETS = [
  {
    code: "performance_cockpit",
    label: "Performance Cockpit",
    description: "Exec-style view with totals, conversion, pipeline state, and a live editable leads table.",
    accent: "primary.main",
  },
  {
    code: "client_storyboard",
    label: "Client Storyboard",
    description: "A client-friendly dashboard with readable KPIs, soft charts, and a compact progress table.",
    accent: "secondary.main",
  },
  {
    code: "agent_focus_board",
    label: "Agent Focus Board",
    description: "Day-to-day lead flow, wins, and editable working fields for front-line execution.",
    accent: "primary.dark",
  },
  {
    code: "pipeline_lab",
    label: "Pipeline Lab",
    description: "Exploratory dashboard mixing distribution, trend, and record-level table widgets.",
    accent: "secondary.light",
  },
];

export function buildDashboardTemplateWidgets(presetCode, campaign) {
  const schema = normalizeSchema(campaign);
  const numericKey = numericPayloadField(schema);
  const selectKey = selectPayloadField(schema);
  const textKey = textPayloadField(schema);

  const amountExpr = payloadRef(numericKey) || "sale.amount";
  const groupingField = payloadRef(selectKey) || "sale.status_code";
  const textField = payloadRef(textKey) || "sale.lead_name";

  const editableColumns = [groupingField, textField, amountExpr].filter(Boolean);

  const baseTable = {
    title: "Lead Workbench",
    type: "table",
    config_json: {
      page_size: 12,
      editable: true,
      editable_fields: editableColumns,
    },
  };

  if (presetCode === "client_storyboard") {
    return [
      {
        title: "Visible Revenue",
        type: "metric",
        config_json: { formula: `SUM(${amountExpr})` },
      },
      {
        title: "Lead Count",
        type: "metric",
        config_json: { formula: "COUNT(*)" },
      },
      {
        title: "Status Mix",
        type: "chart",
        config_json: { group_by: groupingField, aggregate: "COUNT", chart_variant: "pie" },
      },
      {
        ...baseTable,
        title: "Client Lead Snapshot",
        config_json: { ...baseTable.config_json, page_size: 8 },
      },
    ];
  }

  if (presetCode === "agent_focus_board") {
    return [
      {
        title: "My Volume",
        type: "metric",
        config_json: { formula: "COUNT(*)" },
      },
      {
        title: "Potential Value",
        type: "metric",
        config_json: { formula: `SUM(${amountExpr})` },
      },
      {
        title: "Work Trend",
        type: "chart",
        config_json: { group_by: groupingField, aggregate: "COUNT", chart_variant: "area" },
      },
      baseTable,
    ];
  }

  if (presetCode === "pipeline_lab") {
    return [
      {
        title: "Opportunity Map",
        type: "chart",
        config_json: { group_by: groupingField, aggregate: "SUM", aggregate_field: amountExpr, chart_variant: "bar" },
      },
      {
        title: "Flow Curve",
        type: "chart",
        config_json: { group_by: groupingField, aggregate: "COUNT", chart_variant: "line" },
      },
      {
        title: "Average Ticket",
        type: "metric",
        config_json: { formula: `AVG(${amountExpr})` },
      },
      baseTable,
    ];
  }

  return [
    {
      title: "Revenue Pulse",
      type: "metric",
      config_json: { formula: `SUM(${amountExpr})` },
    },
    {
      title: "Record Count",
      type: "metric",
      config_json: { formula: "COUNT(*)" },
    },
    {
      title: "Pipeline Composition",
      type: "chart",
      config_json: { group_by: groupingField, aggregate: "COUNT", chart_variant: "bar" },
    },
    baseTable,
  ];
}

/**
 * Pre-built backend templates for quick dashboard creation.
 * Users can create a new dashboard from any of these templates.
 * Each template is pre-configured with widgets and formulas.
 */
export const BACKEND_DASHBOARD_TEMPLATES = [
  {
    name: "Sales Manager Dashboard",
    description: "Overview of team sales performance, pipeline, and individual agent performance",
    icon: "📊",
    recommended_for: ["admin", "team_lead", "manager"],
  },
  {
    name: "QA Manager Dashboard",
    description: "Monitor call quality, compliance scores, and flagged issues requiring attention",
    icon: "🎯",
    recommended_for: ["admin", "team_lead", "qa_manager"],
  },
  {
    name: "Finance Dashboard",
    description: "Track ROI, commission payouts, revenue streams, and profitability metrics",
    icon: "💰",
    recommended_for: ["admin", "hr_manager", "finance_manager"],
  },
  {
    name: "Agent Dashboard",
    description: "Personal performance metrics, ranking, calls, and individual targets",
    icon: "👤",
    recommended_for: ["agent"],
  },
  {
    name: "Executive Dashboard",
    description: "High-level business overview with key metrics, ROI, and team performance summaries",
    icon: "👑",
    recommended_for: ["admin", "superadmin"],
  },
  {
    name: "Conversion War Room",
    description: "Campaign conversion bottlenecks, drop-off analysis, and fast action insights",
    icon: "⚔️",
    recommended_for: ["admin", "team_lead", "client"],
  },
  {
    name: "Revenue Acceleration Dashboard",
    description: "Revenue momentum with target tracking and commission pressure points",
    icon: "🚀",
    recommended_for: ["admin", "team_lead", "hr_manager", "finance_manager"],
  },
  {
    name: "Quality Control Center",
    description: "Audio quality governance focused on risk calls and compliance health",
    icon: "🛡️",
    recommended_for: ["admin", "qa_manager", "team_lead"],
  },
  {
    name: "Agent Performance Sprint",
    description: "Personal productivity, conversion cadence, and daily execution board",
    icon: "🏃",
    recommended_for: ["agent", "team_lead"],
  },
  {
    name: "Portfolio Health Dashboard",
    description: "Cross-campaign board balancing pipeline, ROI, quality, and targets",
    icon: "🧭",
    recommended_for: ["admin", "superadmin", "team_lead", "client"],
  },
];