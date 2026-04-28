import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function CloserDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Closer Workspace"
      subtitle="High-intent closure pipeline with commitment and payment milestones."
      tabs={["Dashboard", "My Leads", "Closures", "Settings"]}
      quickActions={["Call Lead", "Send Proposal", "Mark Closed", "Create Follow-up"]}
      kpiCards={[
        { title: "Hot Leads", value: "54", trend: "+9 today" },
        { title: "Closures This Week", value: "17", trend: "+3 vs last week" },
        { title: "Closure Rate", value: "31.5%", trend: "+2.0%" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default CloserDashboard;
