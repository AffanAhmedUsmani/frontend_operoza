/**
 * Widget Library — Metadata and catalog for all available widget types
 * 
 * Used by WidgetPalette to display available widgets.
 * Each entry describes: name, icon, description, default config, grid span.
 * 
 * Follows Jakob's Law: familiar widget types consistent with industry-standard CRM dashboards.
 */

export const WIDGET_LIBRARY = [
  {
    type: "metric",
    name: "Metric",
    icon: "📊",
    description: "Single KPI with formula",
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
    gridPosition: null, // Set by canvas
  };
}
