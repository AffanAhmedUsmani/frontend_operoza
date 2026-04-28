import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function ClientViewerDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Client Viewer Workspace"
      subtitle="Read-only campaign transparency with SLA and progress visibility for clients."
      tabs={["Dashboard", "Campaigns", "Exports", "Settings"]}
      quickActions={["Download Summary", "View SLA", "Open Milestones", "Share Snapshot"]}
      kpiCards={[
        { title: "Campaigns in Progress", value: "8", trend: "+1 this week" },
        { title: "Delivered Leads", value: "4,280", trend: "+312 today" },
        { title: "Average SLA", value: "98.2%", trend: "+0.4%" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default ClientViewerDashboard;
