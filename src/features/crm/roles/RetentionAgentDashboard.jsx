import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function RetentionAgentDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Retention Agent Workspace"
      subtitle="Renewal rescue and churn-prevention operations with retention campaigns."
      tabs={["Dashboard", "My Leads", "Renewals", "Settings"]}
      quickActions={["Open Account", "Launch Offer", "Log Save", "Escalate Risk"]}
      kpiCards={[
        { title: "At-Risk Accounts", value: "73", trend: "-8 today" },
        { title: "Retention Success", value: "64.3%", trend: "+1.7%" },
        { title: "Expiring This Week", value: "41", trend: "+5 new" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default RetentionAgentDashboard;
