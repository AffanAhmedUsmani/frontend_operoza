import RoleWorkspaceScaffold from "../components/RoleWorkspaceScaffold";

function FinanceManagerDashboard({ activeNavLabel }) {
  return (
    <RoleWorkspaceScaffold
      title="Finance Manager Workspace"
      subtitle="Commission policies, payouts, and dispute resolution controls."
      tabs={["Dashboard", "Commission", "Payouts", "Settings"]}
      quickActions={["Run Commission", "Approve Batch", "Open Dispute", "Export Ledger"]}
      kpiCards={[
        { title: "Pending Payouts", value: "37", trend: "-5 today" },
        { title: "This Month Commission", value: "$48.2K", trend: "+6.4%" },
        { title: "Open Disputes", value: "9", trend: "+1 new" },
      ]}
      activeNavLabel={activeNavLabel}
    />
  );
}

export default FinanceManagerDashboard;
