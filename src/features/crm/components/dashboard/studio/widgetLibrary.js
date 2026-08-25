/**
 * Widget Library — Metadata and catalog for all available widget types
 *
 * Used by WidgetPalette to display available widgets.
 * Each entry describes: name, icon, description, default config, grid span.
 *
 * `useCase` (Sprint 19, docs/SPRINT_PLAN.md) is the static, always-on,
 * unmetered in-app guidance layer's contextual-tooltip copy - "explaining
 * what it's for and when to use it", per the sprint's own worked
 * examples ("Funnel - pipeline drop-off by stage, use for conversion
 * tracking"). Shown as a Tooltip in WidgetPalette; `description` stays as
 * the terser always-visible caption it already was.
 *
 * Follows Jakob's Law: familiar widget types consistent with industry-standard CRM dashboards.
 */

export const WIDGET_LIBRARY = [
  {
    type: "metric",
    name: "Metric",
    icon: "📊",
    description: "Single KPI with formula",
    useCase: "A single KPI number driven by a formula (SUM/COUNT/AVG). Use for a headline number like total revenue or calls this week.",
    category: "Analytics",
    defaultConfig: {
      formula: "SUM(sale.amount)",
      label: "Total Revenue",
    },
    minSpan: 1,
    defaultSpan: 1,
  },
  {
    type: "chart",
    name: "Chart",
    icon: "📈",
    description: "Grouped aggregation chart",
    useCase: "Compares a metric across groups (e.g. sales by campaign). Use to spot trends or compare categories at a glance.",
    category: "Analytics",
    defaultConfig: {
      chartType: "bar",
      groupBy: "campaign.name",
      aggregation: "SUM",
      aggregationField: "sale.amount",
    },
    minSpan: 2,
    defaultSpan: 2,
  },
  {
    type: "table",
    name: "Table",
    icon: "📋",
    description: "Paginated data table",
    useCase: "A raw, sortable list of records. Use when someone needs to see (or export) the underlying rows, not just a summary.",
    category: "Data",
    defaultConfig: {
      entityType: "sale",
      limit: 10,
      columns: ["id", "name", "amount", "status"],
    },
    minSpan: 2,
    defaultSpan: 3,
  },
  {
    type: "funnel",
    name: "Funnel",
    icon: "🎯",
    description: "Stage drop-off analysis",
    useCase: "Pipeline drop-off by stage. Use for conversion tracking - where leads fall out of your process.",
    category: "Analytics",
    defaultConfig: {
      stageField: "stage_pipeline.stage_name",
    },
    minSpan: 2,
    defaultSpan: 2,
  },
  {
    type: "leaderboard",
    name: "Leaderboard",
    icon: "🏆",
    description: "Agent performance ranking",
    useCase: "Ranks agents by a metric. Use for performance visibility and friendly competition across a team.",
    category: "Performance",
    defaultConfig: {
      sortBy: "commission",
      limit: 10,
    },
    minSpan: 1,
    defaultSpan: 1,
  },
  {
    type: "commission",
    name: "Commission",
    icon: "💰",
    description: "Earnings breakdown",
    useCase: "Breaks down commission earned, grouped by agent. Use for payout transparency and coaching conversations.",
    category: "Finance",
    defaultConfig: {
      formula: "SUM(commission.amount)",
      groupBy: "agent.name",
    },
    minSpan: 2,
    defaultSpan: 2,
  },
  {
    type: "target",
    name: "Target",
    icon: "🎪",
    description: "Actual vs goal tracking",
    useCase: "Actual results against a set goal. Use to track progress toward a campaign's revenue target.",
    category: "Performance",
    defaultConfig: {
      targetField: "campaign.target_revenue",
      actualField: "SUM(sale.amount)",
    },
    minSpan: 1,
    defaultSpan: 1,
  },
  {
    type: "qa_score",
    name: "QA Score",
    icon: "⭐",
    description: "Audio quality metrics",
    useCase: "Aggregate call-quality scoring from the AI analyzer. Use to monitor sentiment/compliance trends across a campaign.",
    category: "Quality",
    defaultConfig: {
      sentimentThreshold: 0.7,
      complianceThreshold: 0.9,
    },
    minSpan: 1,
    defaultSpan: 1,
  },
  {
    type: "flagged_calls",
    name: "Flagged Calls",
    icon: "🚩",
    description: "Quality issues sorted by severity",
    useCase: "Surfaces the specific calls that failed a compliance check. Use when a Team Lead needs to triage coaching cases.",
    category: "Quality",
    defaultConfig: {
      limit: 20,
      severityFilter: ["error", "warning"],
    },
    minSpan: 2,
    defaultSpan: 2,
  },
  {
    type: "roi",
    name: "ROI",
    icon: "📊",
    description: "Revenue, cost, profit analysis",
    useCase: "Revenue minus cost, side by side. Use to judge whether a campaign is actually profitable, not just busy.",
    category: "Finance",
    defaultConfig: {
      revenueFormula: "SUM(sale.amount)",
      costFormula: "SUM(campaign.cost)",
    },
    minSpan: 1,
    defaultSpan: 1,
  },
];

/**
 * Get widget metadata by type
 */
export function getWidgetByType(type) {
  return WIDGET_LIBRARY.find((w) => w.type === type);
}

/**
 * Get widgets by category (for palette grouping)
 */
export function getWidgetsByCategory(category) {
  return WIDGET_LIBRARY.filter((w) => w.category === category);
}

/**
 * Get all categories
 */
export function getWidgetCategories() {
  return [...new Set(WIDGET_LIBRARY.map((w) => w.category))];
}

/**
 * Create new widget with defaults
 */
export function createNewWidget(type) {
  const meta = getWidgetByType(type);
  if (!meta) return null;

  return {
    widget_id: `temp-${Date.now()}`, // Temporary ID before save
    type,
    title: meta.name,
    config_json: meta.defaultConfig,
    gridSpan: meta.defaultSpan,
    gridRowSpan: 1,
    gridPosition: null, // Set by canvas
    position: {
      row: 0,
      col: 0,
      span: meta.defaultSpan,
      rowSpan: 1,
    },
  };
}
