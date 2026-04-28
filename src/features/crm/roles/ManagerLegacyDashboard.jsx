import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function ManagerLegacyDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Manager (Legacy) Workspace"
      subtitle="Backward-compatible manager controls for older role assignments."
      tabs={["Dashboard", "My Team", "Pipeline", "Settings"]}
      quickActions={["Assign Owner", "Rebalance Queue", "Open Review", "Export Team View"]}
      kpiCards={[
        { title: "Legacy Managed Users", value: "26", trend: "stable" },
        { title: "Pipeline Progress", value: "72%", trend: "+3%" },
        { title: "Pending Reviews", value: "12", trend: "-2" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default ManagerLegacyDashboard;
