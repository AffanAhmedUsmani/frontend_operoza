import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function QAManagerDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="QA Manager Workspace"
      subtitle="Call quality analytics, compliance checks, and coaching cycles."
      tabs={["Dashboard", "Call Review", "Scorecards", "Settings"]}
      quickActions={["Start Review", "Flag Call", "Publish Scorecard", "Assign Coaching"]}
      kpiCards={[
        { title: "Calls Pending Review", value: "246", trend: "-18 today" },
        { title: "Average QA Score", value: "86.4", trend: "+1.3 pts" },
        { title: "Compliance Alerts", value: "11", trend: "-2 this week" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default QAManagerDashboard;
