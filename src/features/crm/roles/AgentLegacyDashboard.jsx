import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function AgentLegacyDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Agent (Legacy) Workspace"
      subtitle="Backward-compatible agent operations for legacy role assignments."
      tabs={["Dashboard", "My Leads", "Tasks", "Settings"]}
      quickActions={["Open Lead", "Log Interaction", "Schedule Follow-up", "Close Task"]}
      kpiCards={[
        { title: "Active Legacy Leads", value: "141", trend: "+8" },
        { title: "Tasks Due", value: "29", trend: "-4" },
        { title: "Daily Completion", value: "81%", trend: "+5%" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default AgentLegacyDashboard;
