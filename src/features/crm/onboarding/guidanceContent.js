// QA_FIX_PLAN.md steps 19 & 20 - short, task-focused guidance per role per
// screen, distilled from the existing role guides (docs/ADMIN_GUIDE.md,
// AGENT_GUIDE.md, TEAM_LEAD_GUIDE.md, HR_MANAGER_GUIDE.md, CLIENT_GUIDE.md
// - see step 16) into UI-appropriate copy, not a re-export of that prose.
// Shared as the single source both delivery mechanisms (the first-login
// tour and the persistent per-screen help popover) read from - write once,
// used twice, rather than duplicating this content for each.
//
// Keys match the nav item keys already used by TenantCrmLayout.jsx's
// NAV_MAP. A (role, screen) pair with no entry here just shows nothing in
// the help popover - not every screen needs guidance, and this is meant to
// grow incrementally, not be exhaustive on day one.

export const GUIDANCE_CONTENT = {
  admin: {
    "Users & Roles": {
      title: "Users & Roles",
      body: "Create accounts for your team and assign each person exactly one role. Toggle which roles are even available before creating users, so a mis-click can't hand out access you don't want offered yet.",
    },
    Campaigns: {
      title: "Campaigns",
      body: "Build a campaign's custom fields here - what an agent fills in per sale, and who (admin/agent/client) can see each field. Set the campaign's country once at creation; it decides which regions a State field offers.",
    },
    Sales: {
      title: "Sales",
      body: "See every sale across every campaign. Uploading a call recording queues it for automatic analysis in the background - no need to wait on the upload screen.",
    },
    Attendance: {
      title: "Attendance",
      body: "Review clock-in/out records and exceptions across the whole tenant. A campaign only shows attendance data once it has a shift configured.",
    },
    Reports: {
      title: "Reports",
      body: "Build a report from scratch or from a template, then generate an AI summary of it in plain English - the summary is always grounded in the report's real numbers, never invented.",
    },
    Dashboards: {
      title: "Dashboards",
      body: "Create a dashboard from a template (the ones recommended for your role show first) or build one widget-by-widget for a specific campaign.",
    },
    Payroll: {
      title: "Payroll",
      body: "Configure salary structures, commission rules, and deduction policies, then review computed payouts before they're approved.",
    },
    Messages: {
      title: "Messages",
      body: "Direct-message anyone on your team, or use a campaign-scoped channel, without leaving the CRM.",
    },
    Settings: {
      title: "Settings",
      body: "Tenant-wide configuration - branding, network access restrictions, currency, and audit log - lives here. Only Admin can reach this screen.",
    },
  },

  team_lead: {
    Campaigns: {
      title: "Campaigns",
      body: "You'll see the campaigns you're assigned to lead. You can adjust fields and settings for those campaigns the same way an Admin can.",
    },
    Sales: {
      title: "Sales",
      body: "Review sales across your team's campaigns - useful for spotting a rep who needs coaching before it shows up in the numbers.",
    },
    Reports: {
      title: "Reports",
      body: "Build reports scoped to your team's campaigns, and use the AI summary to get a quick read before a stand-up.",
    },
    "My Team": {
      title: "My Team",
      body: "A roster view of everyone assigned to your campaigns - their attendance, sales, and status in one place.",
    },
    Dashboards: {
      title: "Dashboards",
      body: "Templates tagged for Team Lead surface first - built around pipeline health and team performance, not company-wide finance.",
    },
    Payroll: {
      title: "Payroll",
      body: "See payout records for your team so you can flag a discrepancy before it reaches HR.",
    },
    "Follow-Ups": {
      title: "Follow-Ups",
      body: "See every follow-up task due or overdue across your team's campaigns, not just your own.",
    },
    Messages: {
      title: "Messages",
      body: "Message your team directly or use a campaign channel - the same messaging tool every role has access to.",
    },
  },

  agent: {
    Attendance: {
      title: "Attendance",
      body: "Clock in and out for your shift here. If your campaign requires it, you can only do this from an approved network - check with your Team Lead if you're blocked unexpectedly.",
    },
    Campaigns: {
      title: "Campaigns",
      body: "Only campaigns you're personally assigned to show up here, with the exact custom fields that campaign needs.",
    },
    Sales: {
      title: "Sales",
      body: "Create and update your own sales. If a campaign has an audio field, upload the call recording here - it's saved and queued for analysis automatically, you don't need to wait on this screen.",
    },
    Payroll: {
      title: "Payroll",
      body: "See your own computed payout - base pay, commission, and any deductions - once it's been processed.",
    },
    "Follow-Ups": {
      title: "Follow-Ups",
      body: "Tasks you've created to circle back on a lead or sale later. Only campaigns with follow-ups enabled show this option.",
    },
    Messages: {
      title: "Messages",
      body: "Message your Team Lead or teammates directly, without needing a separate chat app.",
    },
  },

  hr_manager: {
    Attendance: {
      title: "Attendance",
      body: "Attendance governance across the tenant - exceptions, timesheets, and docking policy all connect from here.",
    },
    Timesheets: {
      title: "Timesheets",
      body: "Review recorded hours before they feed into payroll calculations.",
    },
    Payroll: {
      title: "Payroll",
      body: "Configure docking policy for lateness/absence, and review payouts before approval - this is your primary screen.",
    },
    Reports: {
      title: "Reports",
      body: "Available once you're assigned as a report's viewer - useful for pulling payroll or attendance data without asking Admin each time.",
    },
    Messages: {
      title: "Messages",
      body: "Message anyone on the team directly about a payroll or attendance question.",
    },
  },

  client: {
    Campaigns: {
      title: "Campaigns",
      body: "You're seeing only the campaigns you're a client on, and only the fields your account manager chose to make visible to you.",
    },
    Reports: {
      title: "Reports",
      body: "Available once you're assigned as a viewer on a specific report - ask your account manager if you expect one and don't see it.",
    },
  },
};

export function getGuidanceForScreen(role, screenLabel) {
  const roleKey = String(role || "").trim().toLowerCase();
  return GUIDANCE_CONTENT[roleKey]?.[screenLabel] || null;
}

export function getAllGuidanceForRole(role) {
  const roleKey = String(role || "").trim().toLowerCase();
  return GUIDANCE_CONTENT[roleKey] || {};
}
