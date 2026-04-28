import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function HRManagerDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="HR Manager Workspace"
      subtitle="Attendance governance, leave approvals, and hiring readiness controls."
      tabs={["Dashboard", "Attendance", "Timesheets", "Settings"]}
      quickActions={["Mark Attendance", "Approve Leave", "Add Holiday", "Export Roster"]}
      kpiCards={[
        { title: "Today Attendance", value: "92%", trend: "+2.1% vs yesterday" },
        { title: "Pending Leaves", value: "18", trend: "-4 requests" },
        { title: "Open Positions", value: "6", trend: "+1 this week" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default HRManagerDashboard;
