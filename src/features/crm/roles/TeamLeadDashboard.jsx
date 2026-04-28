import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function TeamLeadDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Team Lead Workspace"
      subtitle="Pipeline execution, agent coaching, and daily team outcomes."
      tabs={["Dashboard", "My Team", "Pipeline", "Settings"]}
      quickActions={["Assign Leads", "Start Huddle", "Create Coaching Note", "View Team SLA"]}
      kpiCards={[
        { title: "Team Conversion", value: "18.9%", trend: "+1.2%" },
        { title: "Leads in Follow-up", value: "312", trend: "+27 today" },
        { title: "Coaching Due", value: "14", trend: "-3 completed" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default TeamLeadDashboard;
