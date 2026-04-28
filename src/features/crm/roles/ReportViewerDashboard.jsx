import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function ReportViewerDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Report Viewer Workspace"
      subtitle="Read-only KPI insights, campaign snapshots, and trend reporting."
      tabs={["Dashboard", "Reports", "Exports", "Settings"]}
      quickActions={["Refresh Data", "Pin Report", "Schedule Export", "Share Snapshot"]}
      kpiCards={[
        { title: "Active Campaigns", value: "23", trend: "+2 this week" },
        { title: "Overall Conversion", value: "14.7%", trend: "+0.8%" },
        { title: "SLA Breaches", value: "4", trend: "-1 today" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default ReportViewerDashboard;
