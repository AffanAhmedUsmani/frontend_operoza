/**
 * USAGE GUIDE — DashboardStudio Integration
 * 
 * This file shows how to integrate the studio into existing dashboard flows.
 * It's not executable code, but a reference for developers.
 */

// ============================================================================
// INTEGRATION EXAMPLE — DashboardBuilderPanel
// ============================================================================

import { DashboardStudio } from "./studio";
import { createWidget, updateWidget } from "../../services/dashboardService";

function DashboardBuilderPanel({ dashboard, accessToken, ...props }) {
  const [widgets, setWidgets] = useState(dashboard.widgets || []);

  // Save studio changes to backend
  const handleStudioSave = async (updatedWidgets) => {
    // Filter into new vs existing
    const newWidgets = updatedWidgets.filter((w) => w.widget_id.startsWith("temp-"));
    const existingWidgets = updatedWidgets.filter((w) => !w.widget_id.startsWith("temp-"));

    // Create new widgets
    for (const w of newWidgets) {
      await createWidget(accessToken, dashboard.dashboard_id, {
        type: w.type,
        title: w.title,
        config_json: w.config_json,
      });
    }

    // Update existing widgets
    for (const w of existingWidgets) {
      await updateWidget(accessToken, dashboard.dashboard_id, w.widget_id, {
        type: w.type,
        title: w.title,
        config_json: w.config_json,
      });
    }

    // Refresh from backend
    const detail = await fetchDashboardDetail(accessToken, dashboard.dashboard_id);
    setWidgets(detail.widgets);
  };

  // Save as draft locally
  const handleStudioDraft = async (draftWidgets, draftState) => {
    localStorage.setItem(
      `dashboard-draft-${dashboard.dashboard_id}`,
      JSON.stringify({
        widgets: draftWidgets,
        savedAt: draftState.draftAt,
        dashboardName: dashboard.name,
      })
    );
    alert("Draft saved locally. Not yet published.");
  };

  return (
    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
      <Tab label="Live View" />
      <Tab label="Builder (Simple)" />
      <Tab label="Studio Builder (Visual)" />

      {tab === 2 && (
        <DashboardStudio
          dashboardId={dashboard.dashboard_id}
          dashboardName={dashboard.name}
          initialWidgets={widgets}
          onSave={handleStudioSave}
          onSaveDraft={handleStudioDraft}
          onCancel={() => setTab(0)}
        />
      )}
    </Tabs>
  );
}

// ============================================================================
// WIDGET LIBRARY — EXTENDING WITH NEW TYPES
// ============================================================================

import { WIDGET_LIBRARY } from "./studio";

// Add a custom widget type
const CUSTOM_WIDGET_LIBRARY = [
  ...WIDGET_LIBRARY,
  {
    type: "custom_heatmap",
    name: "Heatmap",
    icon: "🔥",
    description: "Geographic or temporal heatmap visualization",
    category: "Analytics",
    defaultConfig: {
      dataSource: "sales",
      groupBy: "region",
      colorScale: "viridis",
    },
    minSpan: 2,
    defaultSpan: 3,
  },
];

// ============================================================================
// COMPONENT COMPOSITION — REUSING PIECES
// ============================================================================

// Use just the palette in a widget picker modal
import { WidgetPalette } from "./studio";

function WidgetPickerModal() {
  return <WidgetPalette onWidgetSelect={(type) => addWidget(type)} />;
}

// Use just the grid in a dashboard view mode
import { GridCanvas } from "./studio";

function DashboardViewerWithGrid({ widgets }) {
  return (
    <GridCanvas
      widgets={widgets}
      selectedWidget={null}
      onSelectWidget={() => {}}
      onEditWidget={() => {}}
      onDeleteWidget={() => {}}
      onUpdateWidget={() => {}}
      onAddWidget={() => {}}
    />
  );
}

// ============================================================================
// CUSTOMIZATION — STYLING & THEMING
// ============================================================================

// All components use MUI theme tokens, so customize via theme provider:

import { createTheme, ThemeProvider } from "@mui/material/styles";

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#c05314", // warm orange
    },
    background: {
      default: "#faf6f0", // light cream
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <DashboardStudio {...props} />
    </ThemeProvider>
  );
}

// ============================================================================
// STATE MANAGEMENT — LIFTING STATE UP
// ============================================================================

// If you need to manage studio state externally:

function ParentComponent() {
  const [widgets, setWidgets] = useState([]);
  const [studioOpen, setStudioOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setStudioOpen(true)}>Open Studio</Button>
      {studioOpen && (
        <DashboardStudio
          initialWidgets={widgets}
          onSave={async (updated) => {
            // Save logic
            setWidgets(updated);
            setStudioOpen(false);
          }}
          onCancel={() => setStudioOpen(false)}
        />
      )}
    </>
  );
}

// ============================================================================
// TESTING — MOCK DATA & SCENARIOS
// ============================================================================

import { createNewWidget } from "./studio";

// Test data: pre-populated dashboard
const testWidgets = [
  createNewWidget("metric"),
  createNewWidget("chart"),
  createNewWidget("table"),
  {
    ...createNewWidget("leaderboard"),
    title: "Top Performers",
    gridSpan: 2,
  },
];

// Test save flow
async function testSave() {
  const widgets = testWidgets;
  // Simulate backend save
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Saved:", widgets);
}

// ============================================================================
// KEYBOARD SHORTCUTS — FUTURE ENHANCEMENT
// ============================================================================

// Could add to DashboardStudio:
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    if (e.key === "Delete" && selectedWidget) {
      handleDeleteWidget(selectedWidget.widget_id);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [selectedWidget, handleUndo, handleSave]);

// ============================================================================
// ACCESSIBILITY — SCREEN READER SUPPORT
// ============================================================================

// All components include proper ARIA labels:
// - <GridCell> has draggable with role/aria-label
// - <StudioToolbar> buttons have aria-label
// - <WidgetPalette> has semantic structure
// - <PropertiesPanel> has fieldset wrapping with legend
// - Tab navigation works with keyboard

// Test with screen reader:
// 1. Tab through: Toolbar buttons → Palette items → Canvas cells → Properties inputs
// 2. Announce: "Save button, disabled", "Widget Palette, 10 widgets in 5 categories"
// 3. Drill down: "Metric widget, click to add or drag"

// ============================================================================
// PERFORMANCE — OPTIMIZATION TIPS
// ============================================================================

// Current performance is good, but for large dashboards:

// 1. Memoize GridCell to prevent re-renders:
export const GridCell = memo(GridCellComponent, (prev, next) => {
  return (
    prev.widget.widget_id === next.widget.widget_id &&
    prev.isSelected === next.isSelected
  );
});

// 2. Virtualize grid for 100+ widgets:
import { FixedSizeGrid } from "react-window";

// 3. Lazy-load PropertiesPanel:
const PropertiesPanel = lazy(() => import("./PropertiesPanel"));

// 4. Debounce JSON config edits:
const debouncedUpdate = useCallback(
  debounce((updated) => onUpdate(updated), 500),
  [onUpdate]
);

// ============================================================================
// END OF USAGE GUIDE
// ============================================================================
