import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function LicensedAgentDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Licensed Agent Workspace"
      subtitle="Compliance-first lead engagement with licensed outreach workflows."
      tabs={["Dashboard", "My Leads", "Compliance", "Settings"]}
      quickActions={["Open Script", "Start Outreach", "Mark Compliance", "Schedule Callback"]}
      kpiCards={[
        { title: "Licensed Leads", value: "189", trend: "+14 today" },
        { title: "Compliance Pass", value: "97.6%", trend: "+0.9%" },
        { title: "Callback Due", value: "22", trend: "-5 completed" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default LicensedAgentDashboard;
