import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function OutboundAgentDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Outbound Agent Workspace"
      subtitle="Campaign outreach queues, dialing tasks, and callback performance."
      tabs={["Dashboard", "My Leads", "Call Log", "Settings"]}
      quickActions={["Start Batch", "Log Call", "Set Callback", "Tag Lead"]}
      kpiCards={[
        { title: "Calls Attempted", value: "154", trend: "+27 today" },
        { title: "Connected Calls", value: "68", trend: "+12" },
        { title: "Callback Backlog", value: "35", trend: "-6" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default OutboundAgentDashboard;
