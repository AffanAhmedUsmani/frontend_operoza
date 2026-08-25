import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";

// Public-website Phase 3, Step 3 (PUBLIC_WEBSITE_SITEMAP.md). Single
// source of truth for every /features/* page - the hub (FeaturesIndexPage)
// and each detail page (rendered by FeaturePageTemplate via the dynamic
// /features/:slug route) both read from this one array, so there is
// nothing to keep in sync by hand across files.
//
// Every "mechanism"/"workflow" entry traces to a verified real capability
// in PUBLIC_WEBSITE_AUDIT.md §4 - nothing here describes a planned or
// deleted feature.
export const FEATURES = [
  {
    slug: "campaign-management",
    eyebrow: "Campaigns",
    title: "Campaign Management",
    icon: GroupsRoundedIcon,
    heroSubhead: "Every line of business gets its own fields, workflow, and reporting - without separate software per vertical.",
    metaDescription: "Build campaigns from 10 ready-made templates or from scratch, with admin-configured fields, per-campaign currency, and role-scoped visibility.",
    roles: ["Admin", "Team Lead", "Agent"],
    problem: {
      intro: "Generic CRMs force every line of business through one rigid pipeline. A BPO running insurance, solar, and support campaigns at once needs different fields and workflows for each - not one shape stretched to fit all of them.",
      points: [
        "Custom fields require a developer, or don't exist at all",
        "Every campaign ends up looking the same regardless of what it actually tracks",
        "Client-visible vs. internal-only data isn't a real distinction",
      ],
    },
    mechanism: "A Campaign carries its own field schema - text, number, date, select, textarea, or audio fields - each with its own visibility rule per role, including whether a client can see it. Ten real templates (Medical Insurance, Auto Insurance, Burial Insurance, Solar Sales, Real Estate Leads, Customer Support, Tech Support, Debt Collection, Appointment Setting, Retention Campaign) give you a real starting point; every field stays admin-configurable afterward.",
    workflow: [
      { label: "Choose a template", detail: "Or start from a blank campaign" },
      { label: "Configure fields", detail: "Set type and per-role visibility, including client-visible" },
      { label: "Assign your team", detail: "Team leads and agents scoped to this campaign" },
      { label: "Go live", detail: "Leads and sales flow through the fields you defined" },
    ],
    whyItMatters: "One platform covers every line of business you run, each shaped exactly like that business actually works - not a generic pipeline everyone has to adapt to.",
    related: ["sales-leads", "dashboards-reports", "branding"],
  },
  {
    slug: "sales-leads",
    eyebrow: "Sales",
    title: "Leads & Sales Management",
    icon: TimelineRoundedIcon,
    heroSubhead: "A clean, auditable trail from first contact to closed sale - not a status flag anyone can quietly edit.",
    metaDescription: "Track leads through to a sale with a real conversion action, agent-scoped visibility, and a trail that feeds commission and reporting automatically.",
    roles: ["Agent", "Team Lead", "Admin", "Client"],
    problem: {
      intro: "In a spreadsheet or a generic CRM, leads get lost, duplicated, or silently marked \"won\" with no real record of what happened.",
      points: [
        "No clear line between a captured contact and an actual sale",
        "Agents only see leads relevant to them - or see everything, with no scoping at all",
        "Managers can't tell real conversion from a status someone edited",
      ],
    },
    mechanism: "A Lead and a Sale are deliberately different things: a Lead is a captured contact, not yet a deal; converting one to a Sale is one explicit, transactional action - never an implicit status edit. Visibility is scoped by assignment, so an Agent sees their own leads and sales, a Team Lead sees their team's.",
    workflow: [
      { label: "Lead captured", detail: "Assigned to an agent on the right campaign" },
      { label: "Agent works it", detail: "Follow-ups, notes, and the campaign's own fields" },
      { label: "Converts to a Sale", detail: "One explicit action, not a status edit" },
      { label: "Feeds everything else", detail: "Commission, dashboards, and reports update automatically" },
    ],
    whyItMatters: "Every sale in the system is real and traceable back to the lead it came from - the number a manager sees is the number that actually happened.",
    related: ["campaign-management", "payroll-commission", "dashboards-reports"],
  },
  {
    slug: "call-analysis",
    eyebrow: "Call Intelligence",
    title: "AI Call & Audio Analysis",
    icon: GraphicEqRoundedIcon,
    heroSubhead: "QA coverage on every call, not a manual sample - without slowing agents down waiting for a result.",
    metaDescription: "Upload call audio and get automatic sentiment, compliance, and summary analysis on every recorded interaction, without blocking your agents.",
    roles: ["Agent", "Team Lead", "Admin"],
    problem: {
      intro: "Manually listening to calls for quality assurance doesn't scale past a handful of agents, so most calls never get reviewed at all - and compliance issues surface only after a client complains.",
      points: [
        "QA teams can only sample a small fraction of real calls",
        "Sentiment and compliance problems go unnoticed until it's too late",
        "Waiting on analysis in real time would slow agents down",
      ],
    },
    mechanism: "Uploaded call audio is analyzed asynchronously by a dedicated analysis service - the agent's request returns immediately, and the job runs in the background. The result (sentiment, compliance flags, and a summary) attaches to the sale record once it's ready, and calls that need attention surface automatically for review.",
    workflow: [
      { label: "Agent uploads audio", detail: "Tied to the sale it belongs to" },
      { label: "Analyzed in the background", detail: "Never blocks the agent's own workflow" },
      { label: "Sentiment, compliance, summary", detail: "Attached to the sale automatically" },
      { label: "Flagged calls surface", detail: "QA reviews what actually needs attention" },
    ],
    whyItMatters: "Every recorded call gets the same scrutiny a manual sample never could, without adding a single second to an agent's day.",
    related: ["sales-leads", "dashboards-reports"],
  },
  {
    slug: "attendance-workforce",
    eyebrow: "Workforce",
    title: "Attendance & Workforce Management",
    icon: EventAvailableRoundedIcon,
    heroSubhead: "Shift-based attendance that feeds payroll automatically, with HR keeping the final say.",
    metaDescription: "Shift-based attendance tied to each campaign, automatic no-show/late detection, network-restricted agent sign-in, and HR-reviewed exceptions.",
    roles: ["Agent", "HR Manager", "Team Lead", "Admin"],
    problem: {
      intro: "Manual attendance tracking - or none at all - makes payroll docking unreliable and no-shows invisible until someone notices a gap.",
      points: [
        "No automatic way to catch a no-show or a late clock-in",
        "Agent accounts can be used from anywhere, with no network restriction",
        "Genuine, HR-approved exceptions get lost or ignored by payroll",
      ],
    },
    mechanism: "Attendance is tied to a campaign's own shift configuration. Automatic detection flags no-shows and late clock-ins; Agent sign-in can be restricted to specific IP networks you control. HR Manager can mark a flagged day as an approved exception, and payroll respects that final, HR-reviewed record - not the raw system flag.",
    workflow: [
      { label: "Shift configured", detail: "Set once per campaign" },
      { label: "Agent clocks in/out", detail: "From an approved network, if you've restricted one" },
      { label: "System flags exceptions", detail: "Late or absent, detected automatically" },
      { label: "HR reviews", detail: "Approves genuine exceptions before payroll runs" },
    ],
    whyItMatters: "Attendance data is trustworthy enough to actually dock pay on - and fair, because HR has the final word on real exceptions.",
    related: ["payroll-commission", "campaign-management"],
  },
  {
    slug: "payroll-commission",
    eyebrow: "Payroll",
    title: "Payroll & Commission",
    icon: PaymentsRoundedIcon,
    heroSubhead: "Base salary, attendance-based deductions, and commission - computed automatically, even across currencies.",
    metaDescription: "Automatic payroll: base salary, HR-aware attendance deductions, and flat/percentage/tiered commission, with automatic currency conversion between campaigns and payroll.",
    roles: ["HR Manager", "Admin", "Team Lead", "Agent"],
    problem: {
      intro: "Calculating commission by hand across agents, campaigns, and currencies is slow and error-prone - and it only gets harder once a campaign runs in one currency while payroll runs in another.",
      points: [
        "Manual spreadsheets for base pay, deductions, and commission drift out of sync",
        "A late or absent day doesn't automatically affect pay",
        "Mixed currencies between a campaign and payroll mean manual conversion, if anyone remembers to do it",
      ],
    },
    mechanism: "A real computation engine combines base salary, attendance-based deductions (respecting HR-approved exceptions), and commission (flat, percentage, or tiered) on won sales. When a campaign's currency differs from an employee's payroll currency, the conversion happens automatically using live exchange rates - a campaign can run in USD while an agent is paid in PKR without anyone doing the math by hand.",
    workflow: [
      { label: "Rules set once", detail: "Salary, deduction, and commission policy" },
      { label: "Period accumulates", detail: "Attendance and won sales, automatically" },
      { label: "Computed automatically", detail: "Base − deductions + commission, currency-converted" },
      { label: "Reviewed and approved", detail: "Admin approves before it's final" },
    ],
    whyItMatters: "Payroll closes faster and more accurately, and a currency mismatch between a campaign and your team is never a manual reconciliation problem.",
    related: ["attendance-workforce", "sales-leads"],
  },
  {
    slug: "dashboards-reports",
    eyebrow: "Reporting",
    title: "Dashboards & Reports",
    icon: DashboardRoundedIcon,
    heroSubhead: "Real-time visibility without anyone manually compiling a spreadsheet.",
    metaDescription: "Ten dashboard widget types and ten ready-made templates, plus a formula-driven report builder with scheduled delivery and CSV/XLSX/PDF export.",
    roles: ["Admin", "Team Lead", "Agent", "Client"],
    problem: {
      intro: "Managers wait on manually-assembled spreadsheets to know what's actually happening, and every team ends up reinventing the same charts from scratch.",
      points: [
        "Reporting means someone exporting data and building a chart by hand",
        "No consistent view of performance across campaigns",
        "Clients ask for updates that take real time to prepare",
      ],
    },
    mechanism: "Ten widget types - metric, table, chart, funnel, leaderboard, commission, target, QA score, flagged calls, and ROI - compute live from real campaign data. Ten ready-made dashboard templates (Sales Manager, QA Manager, Finance, Agent, Executive, Conversion War Room, Revenue Acceleration, Quality Control Center, Agent Performance Sprint, Portfolio Health) give you a real starting point. A formula-driven report builder (SUM, COUNT, AVG, WHERE) layers on top, with scheduled delivery and CSV/XLSX/PDF export.",
    workflow: [
      { label: "Pick a template", detail: "Or build widgets from scratch" },
      { label: "Widgets compute live", detail: "Directly from real campaign data" },
      { label: "Reports layer formulas", detail: "SUM, COUNT, AVG, WHERE - on the same data" },
      { label: "Schedule or export", detail: "Delivered automatically, or on demand" },
    ],
    whyItMatters: "The number on the dashboard is the current, real number - not last week's export.",
    related: ["client-portal", "campaign-management"],
  },
  {
    slug: "client-portal",
    eyebrow: "Client Visibility",
    title: "Client Portal",
    icon: BadgeRoundedIcon,
    heroSubhead: "Give clients real visibility into results, without handing them the keys to your whole operation.",
    metaDescription: "A scoped Client role: the specific dashboards, reports, and fields you choose to share - never your internal operations or other clients' data.",
    roles: ["Client", "Admin"],
    problem: {
      intro: "BPO clients want to see how their campaign is performing. Giving them full system access to get there means exposing far more than they should ever see.",
      points: [
        "Full access is all-or-nothing in most systems",
        "Clients shouldn't see other clients' campaigns, or your internal notes",
        "But clients do need real, current numbers - not a monthly PDF",
      ],
    },
    mechanism: "Client is a genuine, narrowly-scoped role: an Admin marks specific dashboards, reports, and campaign fields as client-visible, and that's exactly what a Client sees - nothing else. A deliberately narrow inline-edit exception lets a Client update specific client-visible fields directly, without ever touching anything beyond that.",
    workflow: [
      { label: "Admin marks visibility", detail: "Per dashboard, report, and field" },
      { label: "Client signs in", detail: "To their own scoped view only" },
      { label: "Sees exactly what's shared", detail: "Nothing from other campaigns or internal data" },
    ],
    whyItMatters: "Real transparency with your clients, on your terms - not an all-or-nothing tradeoff.",
    related: ["dashboards-reports", "campaign-management"],
  },
  {
    slug: "messaging-notifications",
    eyebrow: "Collaboration",
    title: "Messaging & Notifications",
    icon: ForumRoundedIcon,
    heroSubhead: "The system tells the right person the moment something needs attention - without leaving the CRM.",
    metaDescription: "In-app direct messages and team channels scoped by campaign assignment, plus event-driven notifications for the moments that actually need attention.",
    roles: ["Admin", "Team Lead", "Agent", "HR Manager"],
    problem: {
      intro: "Team communication and system alerts end up scattered across outside chat apps, disconnected from the actual data they're about.",
      points: [
        "No record of who was told what, or when",
        "Important events (an overdue follow-up, a payout needing approval) go unnoticed",
        "Switching to a separate chat app breaks the flow of actually working a campaign",
      ],
    },
    mechanism: "Direct messages and auto-created team channels are scoped by campaign assignment - you can only reach who you're actually meant to. An event-driven notification system surfaces the moments that matter (a follow-up coming due, a payout pending approval, an export finishing) directly in-app, to the right person.",
    workflow: [
      { label: "An event happens", detail: "A follow-up, a payout, an export - anything real" },
      { label: "The right person is notified", detail: "In-app, scoped to who should act on it" },
      { label: "The team talks it through", detail: "Direct message or their campaign's team channel" },
    ],
    whyItMatters: "Nothing important gets missed, and the conversation about it happens right next to the data it's about.",
    related: ["sales-leads", "attendance-workforce"],
  },
  {
    slug: "branding",
    eyebrow: "Branding",
    title: "Workspace Branding",
    icon: PaletteRoundedIcon,
    heroSubhead: "Your workspace looks like your business - including the login screen your own team and clients see.",
    metaDescription: "Four tenant-selectable colors, a logo, and full light/dark mode - applied consistently across your workspace and its own login screen.",
    roles: ["Admin"],
    problem: {
      intro: "A generic-looking CRM doesn't feel like part of your own operation - especially uncomfortable when a client logs in and sees a stock template with someone else's name on it.",
      points: [
        "Most CRMs offer no real branding beyond a small logo somewhere",
        "Login screens rarely reflect the workspace at all",
        "Dark mode support, if it exists, ignores tenant branding entirely",
      ],
    },
    mechanism: "Four colors - primary, secondary, background, and surface - are yours to set from Settings, along with your logo. The choice applies consistently across the whole workspace and its own login screen, in both light and dark mode - not just a corner icon.",
    workflow: [
      { label: "Pick your colors", detail: "Real color-wheel pickers, four independent tokens" },
      { label: "Upload your logo", detail: "Shown across the workspace and its login screen" },
      { label: "Applied everywhere", detail: "Light and dark mode, automatically" },
    ],
    whyItMatters: "Everyone who signs in - your team and your clients - sees your business, not a stock template.",
    related: ["client-portal", "campaign-management"],
  },
  {
    slug: "data-export",
    eyebrow: "Data Portability",
    title: "Data Export & Backup",
    icon: CloudDownloadRoundedIcon,
    heroSubhead: "Your data is always genuinely yours to take with you.",
    metaDescription: "Request a full workspace export any time, run as a background job - and use it to restore a full workspace later. Real portability, not lock-in.",
    roles: ["Admin"],
    problem: {
      intro: "Teams are reasonably wary of a platform that has no real way to get their own data back out - a spreadsheet export button isn't the same as an actual backup.",
      points: [
        "No confidence you could leave, or recover, if you needed to",
        "A large export shouldn't block the rest of the system while it runs",
        "\"Export\" often means a partial CSV, not your actual data",
      ],
    },
    mechanism: "An Admin can request a full tenant data export at any time. It runs as a background job, built for real data volume rather than a request that times out - a download link is ready shortly after. The same export format can restore a full workspace later.",
    workflow: [
      { label: "Request an export", detail: "Any time, from Settings" },
      { label: "Runs in the background", detail: "Doesn't block anything else you're doing" },
      { label: "Download when ready", detail: "Or use it to restore a workspace later" },
    ],
    whyItMatters: "You're never locked in - your data can leave with you, in full, whenever you need it to.",
    related: ["branding", "campaign-management"],
  },
];

export function getFeatureBySlug(slug) {
  return FEATURES.find((feature) => feature.slug === slug) || null;
}
