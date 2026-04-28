import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function InboundAgentDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Inbound Agent Workspace"
      subtitle="Real-time incoming lead qualification and response SLA workflows."
      tabs={["Dashboard", "My Leads", "Call Log", "Settings"]}
      quickActions={["Accept Lead", "Qualify", "Schedule Follow-up", "Mark Outcome"]}
      kpiCards={[
        { title: "Live Queue", value: "28", trend: "+6 in last hour" },
        { title: "Avg Response Time", value: "41 sec", trend: "-9 sec" },
        { title: "Qualified Today", value: "63", trend: "+11" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default InboundAgentDashboard;
