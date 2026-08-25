import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";

// Public-website Phase 3, Step 4 (PUBLIC_WEBSITE_SITEMAP.md /
// CONTENT_ARCHITECTURE.md Template C). Single source of truth for every
// /campaigns/* page - the hub (CampaignsIndexPage) and each detail page
// (CampaignPageTemplate, via the dynamic /campaigns/:slug route) both
// read from this one array.
//
// Every fieldGroups entry is copied from the real, shipped template in
// backend/crm/template_registry.v1.json (templateCode below is that
// file's own template_code, kept here for traceability) - never a
// generic industry field list. Every dashboard in `reporting` is a real
// template from backend/crm/dashboard_templates.py. Dashboards are
// admin-assignable to any campaign (there is no automatic per-template
// mapping in the code), so copy here must read as "a strong fit for
// this workflow," never as "the system automatically assigns this."
export const CAMPAIGNS = [
  {
    slug: "medical-insurance",
    templateCode: "medical_insurance",
    eyebrow: "Insurance",
    title: "Medical Insurance",
    icon: LocalHospitalRoundedIcon,
    heroSubhead: "Enrollments, health underwriting details, and dependents - captured once, correctly, with a compliant payment method on file.",
    metaDescription: "Run medical insurance sales on Operoza: health-underwriting fields, dependents and beneficiaries, carrier and plan details, call analysis, and payroll-ready commission.",
    involves: {
      intro: "A medical insurance sale isn't just a name and a phone number - it's a health history, a specific carrier plan, dependents who need their own coverage, and a payment method that has to be right the first time.",
      points: [
        "Health underwriting detail (tobacco use, BMI, pre-existing conditions, medications) that affects the plan itself",
        "Carrier, plan, and metal-tier detail tied to a real monthly premium and subsidy",
        "Dependents and beneficiaries, each with their own identifying and eligibility detail",
        "A payment method and frequency that has to be captured accurately, not re-collected later",
      ],
    },
    fieldGroups: [
      { name: "Lead Info", fields: ["Full Legal Name", "Date of Birth", "SSN (Last 4)", "Primary Phone", "Email Address"] },
      { name: "Policy Details", fields: ["Insurance Carrier", "Plan Name", "Metal Tier", "Coverage Amount", "Monthly Premium", "Monthly Subsidy"] },
      { name: "Health Info", fields: ["Height / Weight / BMI", "Tobacco Use", "Pre-existing Conditions", "Current Medications"] },
      { name: "Payment Info", fields: ["Payment Method", "Payment Frequency", "Bank Name", "Routing / Account Number"] },
      { name: "Dependents & Beneficiaries", fields: ["Full Name", "Relationship", "Date of Birth", "Benefit %"] },
    ],
    workflow: [
      { label: "Lead qualified", detail: "Health info and household captured on intake" },
      { label: "Plan selected", detail: "Carrier, plan, premium, and subsidy recorded" },
      { label: "Enrollment closed", detail: "Dependents, beneficiaries, payment method on file" },
      { label: "Call analyzed", detail: "Compliance and sentiment on the enrollment call" },
      { label: "Reporting updates", detail: "Commission, QA, and dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["Sales Manager Dashboard", "QA Manager Dashboard"],
      note: "Enrollment volume and premium performance for managers, alongside the compliance visibility a health-underwriting sale needs.",
    },
    whyItMatters: "Every field a health plan enrollment legally and operationally needs exists on the campaign from day one - not bolted on after a client asks where it went.",
    related: ["auto-insurance", "burial-insurance"],
    relatedFeatures: ["sales-leads", "call-analysis", "payroll-commission"],
  },
  {
    slug: "auto-insurance",
    templateCode: "car_insurance",
    eyebrow: "Insurance",
    title: "Auto Insurance",
    icon: DirectionsCarRoundedIcon,
    heroSubhead: "Driver, vehicle, and coverage detail on one policy - down to the exact deductible and limit the customer chose.",
    metaDescription: "Run auto insurance sales on Operoza: driver and vehicle detail, coverage limits and deductibles, multi-term premiums, call analysis, and payroll-ready commission.",
    involves: {
      intro: "An auto policy is really three records at once: the driver, the vehicle, and the coverage they agreed to - each with its own detail that has to match what's actually being insured.",
      points: [
        "Driver history (license, years licensed, accidents) that affects rating and eligibility",
        "Vehicle identity (year, make, model, VIN, lienholder) tied to the specific policy",
        "Coverage chosen line by line - liability limits, deductibles, uninsured motorist, rental",
        "Premium quoted multiple ways - monthly, 6-month, and annual - not just one number",
      ],
    },
    fieldGroups: [
      { name: "Driver Info", fields: ["Driver Full Name", "License Number", "License State", "Years Licensed", "Accidents (3 yrs)"] },
      { name: "Vehicle Info", fields: ["Year / Make / Model", "VIN", "Ownership", "Lienholder / Bank", "Primary Use"] },
      { name: "Coverage", fields: ["Coverage Type", "Bodily Injury Limits", "Deductibles", "Uninsured Motorist", "Rental Reimbursement"] },
      { name: "Policy Details", fields: ["Insurance Carrier", "Policy Number", "Monthly Premium", "Down Payment", "Effective Date"] },
    ],
    workflow: [
      { label: "Driver & vehicle captured", detail: "Every record tied to the actual policy" },
      { label: "Coverage configured", detail: "Limits and deductibles the customer chose" },
      { label: "Policy bound", detail: "Premium terms and effective date recorded" },
      { label: "Call analyzed", detail: "Sentiment and compliance on the closing call" },
      { label: "Reporting updates", detail: "Commission and pipeline dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["Sales Manager Dashboard", "Conversion War Room"],
      note: "Pipeline volume for managers, plus drop-off analysis for a policy type where quote-to-bind conversion is the number that matters.",
    },
    whyItMatters: "Driver, vehicle, and coverage data live on the one policy record they actually describe - nothing reconstructed from a notes field later.",
    related: ["medical-insurance", "burial-insurance"],
    relatedFeatures: ["sales-leads", "call-analysis", "dashboards-reports"],
  },
  {
    slug: "burial-insurance",
    templateCode: "burial_insurance",
    eyebrow: "Insurance",
    title: "Burial / Final Expense Insurance",
    icon: VolunteerActivismRoundedIcon,
    heroSubhead: "Final expense policies with the health underwriting, beneficiaries, and draft schedule a sensitive sale needs to get right.",
    metaDescription: "Run final expense insurance sales on Operoza: underwriting class and health detail, beneficiaries, draft-day payment scheduling, call analysis, and payroll-ready commission.",
    involves: {
      intro: "Final expense sales move fast and are almost always closed on the phone with an older applicant - the underwriting and payment detail has to be captured correctly the first time, without a second call to fix it.",
      points: [
        "Health detail (tobacco use, hospitalizations, underwriting class) that sets the face amount and rate",
        "A face amount and premium tied to a specific draft day, not just a monthly figure",
        "Beneficiary detail recorded precisely - this is the policy's entire purpose",
        "A payment method captured accurately on a call, with no in-person follow-up",
      ],
    },
    fieldGroups: [
      { name: "Policy Details", fields: ["Carrier", "Plan Type", "Face Amount", "Monthly Premium", "Draft Day (1-28)"] },
      { name: "Health Info", fields: ["Tobacco Use (2yr)", "Pre-existing Conditions", "Hospitalized (2yr)", "Underwriting Class"] },
      { name: "Payment Info", fields: ["Payment Method", "Payment Frequency", "Bank Name", "Routing / Account Number"] },
      { name: "Beneficiaries", fields: ["Full Name", "Relationship", "Benefit %", "Beneficiary Type"] },
    ],
    workflow: [
      { label: "Health detail captured", detail: "Sets underwriting class and rate" },
      { label: "Plan and draft day set", detail: "Face amount, premium, and payment schedule" },
      { label: "Beneficiaries recorded", detail: "The reason the policy exists" },
      { label: "Call analyzed", detail: "Compliance on a sensitive, phone-closed sale" },
      { label: "Reporting updates", detail: "Commission and QA dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["QA Manager Dashboard", "Finance Dashboard"],
      note: "Compliance visibility for a sensitive, phone-closed sale, alongside the commission and premium tracking finance needs.",
    },
    whyItMatters: "Underwriting, payment, and beneficiary detail are locked in on the same call that closes the sale - nothing left to a follow-up that may never happen.",
    related: ["medical-insurance", "auto-insurance"],
    relatedFeatures: ["call-analysis", "payroll-commission", "sales-leads"],
  },
  {
    slug: "solar-sales",
    templateCode: "solar_sales",
    eyebrow: "Home Services",
    title: "Solar Sales",
    icon: WbSunnyRoundedIcon,
    heroSubhead: "Property, utility usage, system design, and financing - the full picture a solar quote actually depends on.",
    metaDescription: "Run solar sales on Operoza: property and roof detail, utility usage, system design, financing math, call analysis on the qualifying call, and payroll-ready commission.",
    involves: {
      intro: "A solar deal is a long sales cycle with a lot of moving technical and financial detail - the roof, the utility bill, the system designed for it, and the financing that makes the number work.",
      points: [
        "Property and roof detail (type, age, condition, shading) that determines if the site even qualifies",
        "Actual utility usage and rate, not an estimate, to size the system correctly",
        "A system design - panels, inverter, battery - specific to that property",
        "Financing math worked out in full: gross cost, tax credit, rebate, loan terms",
      ],
    },
    fieldGroups: [
      { name: "Property Info", fields: ["Property Type", "Roof Type / Age / Condition", "Home Sq. Footage", "Shading Level"] },
      { name: "Energy Info", fields: ["Utility Provider", "Avg Monthly Bill", "Annual Usage (kWh)", "Net Metering Available"] },
      { name: "System Design", fields: ["System Size (kW)", "Panel Brand / Wattage", "Inverter Type", "Battery Storage"] },
      { name: "Financial", fields: ["Gross System Cost", "Federal Tax Credit", "Net Cost", "Loan Amount / Term / APR"] },
    ],
    workflow: [
      { label: "Lead qualified by phone", detail: "Property, utility bill, and interest confirmed" },
      { label: "Call analyzed", detail: "Sentiment on the qualifying call" },
      { label: "System designed", detail: "Sized to the property's real usage" },
      { label: "Financing structured", detail: "Full cost, incentives, and loan terms" },
      { label: "Reporting updates", detail: "Pipeline and commission dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["Sales Manager Dashboard", "Revenue Acceleration Dashboard"],
      note: "Pipeline visibility across a long cycle, plus commission pressure points on a high-ticket, big-commission sale.",
    },
    whyItMatters: "The property, usage, and financing detail a real solar quote depends on lives on the deal itself - not scattered across a spreadsheet and a proposal PDF.",
    related: ["real-estate-leads", "appointment-setting"],
    relatedFeatures: ["sales-leads", "dashboards-reports", "payroll-commission"],
  },
  {
    slug: "real-estate-leads",
    templateCode: "real_estate_leads",
    eyebrow: "Real Estate",
    title: "Real Estate Leads",
    icon: HomeWorkRoundedIcon,
    heroSubhead: "Buyer and seller leads on one campaign, each qualified against what actually matters for that side of the deal.",
    metaDescription: "Run real estate lead generation on Operoza: buyer and seller profiles, motivation and timeline qualification, appointment tracking, call analysis, and reporting.",
    involves: {
      intro: "Buyer leads and seller leads aren't the same conversation - a buyer needs a budget and a target area qualified, a seller needs their property and motivation qualified - but both need to convert into a real appointment.",
      points: [
        "Buyer qualification: budget range, bedrooms/bathrooms, target area, purchase timeline",
        "Seller qualification: the property itself, plus how motivated they actually are to sell",
        "A real appointment - date, time, type - not just a lead sitting in a queue",
        "Callback and follow-up dates that don't get lost between agents",
      ],
    },
    fieldGroups: [
      { name: "Buyer Profile", fields: ["Property Type", "Min / Max Budget", "Target City/Area", "Purchase Timeline"] },
      { name: "Seller Profile", fields: ["Property Address", "Property Type", "Bedrooms / Bathrooms", "Square Footage"] },
      { name: "Qualification", fields: ["Motivation Level", "Decision Maker", "Callback Date", "Appointment Date"] },
    ],
    workflow: [
      { label: "Lead captured", detail: "Buyer or seller, assigned to an agent" },
      { label: "Qualified by phone", detail: "Budget/area or property/motivation" },
      { label: "Call analyzed", detail: "Sentiment and follow-up quality" },
      { label: "Appointment set", detail: "Real date, time, and type - not just a note" },
      { label: "Reporting updates", detail: "Conversion and agent dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["Conversion War Room", "Agent Performance Sprint"],
      note: "Where leads stall between qualification and appointment, plus the daily execution view an agent working a high lead volume actually needs.",
    },
    whyItMatters: "Buyer and seller leads run through the qualification that actually fits them, on the same platform, without forcing one generic pipeline onto both.",
    related: ["appointment-setting", "solar-sales"],
    relatedFeatures: ["sales-leads", "call-analysis", "dashboards-reports"],
  },
  {
    slug: "customer-support",
    templateCode: "customer_support",
    eyebrow: "Support",
    title: "Customer Support",
    icon: SupportAgentRoundedIcon,
    heroSubhead: "Every ticket tracked against a real SLA, with resolution and satisfaction recorded - not just closed and forgotten.",
    metaDescription: "Run customer support operations on Operoza: ticket categorization, SLA timers, resolution and CSAT tracking, call analysis on phone contacts, and reporting.",
    involves: {
      intro: "Support isn't one queue - it's tickets arriving on different channels, each needing a response inside a real SLA window, and a resolution that actually gets recorded, not just closed.",
      points: [
        "A ticket categorized by priority and category, from whatever channel it arrived on",
        "Response and resolution time measured against a real SLA target, not guessed at",
        "A resolution type and CSAT score recorded, not left blank once the ticket closes",
        "Escalation tracked with a reason and a destination, when a ticket needs it",
      ],
    },
    fieldGroups: [
      { name: "Ticket Info", fields: ["Priority", "Category", "Contact Channel", "Issue Description"] },
      { name: "SLA Tracking", fields: ["Ticket Opened", "First Response", "Resolved At", "SLA Met"] },
      { name: "Resolution", fields: ["Resolution Type", "Escalated", "Refund Amount", "CSAT Score (1-5)"] },
    ],
    workflow: [
      { label: "Ticket logged", detail: "Priority and category set on intake" },
      { label: "Agent responds", detail: "Timed against the SLA target" },
      { label: "Call analyzed", detail: "For contacts handled by phone" },
      { label: "Resolved & scored", detail: "Resolution type and CSAT recorded" },
      { label: "Reporting updates", detail: "SLA and QA dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["QA Manager Dashboard", "Agent Dashboard"],
      note: "Quality and compliance visibility across the team, alongside each agent's own ticket and satisfaction performance.",
    },
    whyItMatters: "SLA performance and customer satisfaction are real, measured numbers on every ticket - not an impression someone forms at the end of the month.",
    related: ["tech-support", "retention-campaign"],
    relatedFeatures: ["call-analysis", "client-portal", "dashboards-reports"],
  },
  {
    slug: "tech-support",
    templateCode: "tech_support",
    eyebrow: "Support",
    title: "Tech Support",
    icon: BuildRoundedIcon,
    heroSubhead: "Device, troubleshooting steps, and root cause recorded on every ticket - so a repeat issue is never a fresh investigation.",
    metaDescription: "Run tech support operations on Operoza: device and troubleshooting detail, root cause and escalation tracking, call analysis on phone contacts, and reporting.",
    involves: {
      intro: "Technical tickets need more than a resolution note - the device, the exact steps already tried, and the actual root cause, so the next agent (or the same customer, next time) isn't starting from zero.",
      points: [
        "Device and OS detail specific enough to actually reproduce the issue",
        "Every troubleshooting step taken recorded - remote session, updates, reinstall - not summarized after the fact",
        "A real root cause and fix applied, not just \"resolved\"",
        "Escalation tier and reason tracked when first-line support can't close it",
      ],
    },
    fieldGroups: [
      { name: "Customer & Device", fields: ["Device Type", "Device Brand/Model", "Operating System", "Account / License"] },
      { name: "Troubleshooting", fields: ["Steps Taken", "Remote Tool Used", "Driver/Software Updated", "Reinstall Performed"] },
      { name: "Resolution", fields: ["Root Cause", "Fix Applied", "Escalation Tier", "First Contact Resolution"] },
    ],
    workflow: [
      { label: "Ticket logged", detail: "Device and issue detail captured" },
      { label: "Troubleshooting steps recorded", detail: "As they're actually taken, not after" },
      { label: "Call analyzed", detail: "For contacts handled by phone" },
      { label: "Root cause & fix recorded", detail: "Or escalated with a clear reason" },
      { label: "Reporting updates", detail: "Resolution and QA dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["Quality Control Center", "Agent Performance Sprint"],
      note: "Risk and compliance visibility on technical calls, alongside each technician's daily resolution throughput.",
    },
    whyItMatters: "The exact steps tried and the real root cause are on the ticket - so a repeat issue is a five-second lookup, not a re-investigation.",
    related: ["customer-support", "debt-collection"],
    relatedFeatures: ["call-analysis", "dashboards-reports", "messaging-notifications"],
  },
  {
    slug: "debt-collection",
    templateCode: "debt_collection",
    eyebrow: "Financial Services",
    title: "Debt Collection",
    icon: AccountBalanceRoundedIcon,
    heroSubhead: "Balances, payment arrangements, and compliance disclosures tracked on every account - the record a regulated call center needs.",
    metaDescription: "Run debt collection operations on Operoza: account balances, contact logs, payment arrangements, FDCPA compliance fields, call analysis, and reporting.",
    involves: {
      intro: "Collections is one of the most compliance-sensitive workflows a call center runs - every contact, every disclosure, and every payment promise needs a real, timestamped record, not a memory of the call.",
      points: [
        "Account balances - original, current, past due - kept accurate as arrangements happen",
        "A contact log entry for every attempt, with channel, outcome, and notes",
        "Payment arrangements (promise-to-pay, settlement, plan) recorded precisely, not verbally agreed and forgotten",
        "Compliance fields - FDCPA disclosure, do-not-call, cease & desist, disputes - tracked with dates, not assumptions",
      ],
    },
    fieldGroups: [
      { name: "Account Details", fields: ["Original Creditor", "Original / Current Balance", "Past Due Amount"] },
      { name: "Contact Log", fields: ["Date/Time", "Channel", "Outcome", "Notes"] },
      { name: "Payment Arrangement", fields: ["Promise-to-Pay Date/Amount", "Settlement Amount / %", "Payment Plan"] },
      { name: "Compliance", fields: ["FDCPA Disclosure Given", "Do Not Call", "Cease & Desist Received", "Dispute Filed"] },
    ],
    workflow: [
      { label: "Account loaded", detail: "Balance and original creditor on file" },
      { label: "Contact attempted", detail: "Every attempt logged, whatever the outcome" },
      { label: "Call analyzed", detail: "Compliance and disclosure verification" },
      { label: "Arrangement recorded", detail: "Promise, settlement, or plan - precisely" },
      { label: "Reporting updates", detail: "Collections and compliance dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["Finance Dashboard", "QA Manager Dashboard"],
      note: "Recovery and payout tracking for finance, alongside the compliance visibility a regulated collections floor has to have.",
    },
    whyItMatters: "Every disclosure, promise, and dispute has a timestamped record - the exact protection a collections operation needs if a call is ever questioned.",
    related: ["tech-support", "retention-campaign"],
    relatedFeatures: ["call-analysis", "sales-leads", "dashboards-reports"],
  },
  {
    slug: "appointment-setting",
    templateCode: "appointment_setting",
    eyebrow: "Sales Development",
    title: "Appointment Setting",
    icon: CalendarMonthRoundedIcon,
    heroSubhead: "Qualified appointments handed to closers with real BANT detail - not just a name and a time slot.",
    metaDescription: "Run appointment-setting campaigns on Operoza: BANT qualification, appointment scheduling with show/no-show outcomes, call analysis, and reporting.",
    involves: {
      intro: "An appointment setter's entire job is the handoff - a closer needs to walk into that meeting already knowing the budget, the decision maker, and the real pain point, not discover it live.",
      points: [
        "Budget, authority, need, and timeline (BANT) qualified before a slot is even booked",
        "A real appointment - date, time, platform, assigned closer - not a vague callback note",
        "Show/no-show outcome tracked, with a reschedule path when it's needed",
        "Meeting notes and next steps that actually reach the closer who's taking the call",
      ],
    },
    fieldGroups: [
      { name: "Qualification", fields: ["Product / Service Interest", "Budget Confirmed / Range", "Purchase Timeline", "BANT Score (1-10)"] },
      { name: "Appointment", fields: ["Appointment Date/Time", "Duration", "Platform / Location", "Assigned Closer / AE"] },
      { name: "Outcome", fields: ["Showed", "No-Show Reason", "Outcome", "Next Step"] },
    ],
    workflow: [
      { label: "Lead qualified by phone", detail: "BANT captured before booking" },
      { label: "Call analyzed", detail: "Sentiment on the qualifying call" },
      { label: "Appointment booked", detail: "Real slot, platform, and assigned closer" },
      { label: "Outcome recorded", detail: "Showed, rescheduled, or converted" },
      { label: "Reporting updates", detail: "Conversion and pipeline dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["Conversion War Room", "Sales Manager Dashboard"],
      note: "Where booked appointments actually convert versus stall, alongside overall setter performance for the manager running the floor.",
    },
    whyItMatters: "A closer opens every meeting already knowing the budget, the decision maker, and the real need - because the setter captured it, not because they got lucky.",
    related: ["real-estate-leads", "solar-sales"],
    relatedFeatures: ["sales-leads", "call-analysis", "dashboards-reports"],
  },
  {
    slug: "retention-campaign",
    templateCode: "retention_campaign",
    eyebrow: "Customer Success",
    title: "Retention Campaign",
    icon: AutorenewRoundedIcon,
    heroSubhead: "Churn risk, real reasons for leaving, and the offer made to keep them - tracked through to the actual outcome.",
    metaDescription: "Run retention campaigns on Operoza: churn-risk scoring, stated reasons for leaving, retention offers, win-back tracking, call analysis, and reporting.",
    involves: {
      intro: "Saving an account at risk means knowing why they're actually leaving, what's been offered before, and whether the last save attempt worked - not calling in blind hoping a discount fixes it.",
      points: [
        "A churn-risk score built from real signals - complaints, support tickets, late payments, usage",
        "The stated reason for leaving recorded, including a named competitor if there is one",
        "A specific retention offer - discount, new plan, contract extension - tied to that account",
        "The actual outcome tracked: retained, churned, or eligible for a later win-back",
      ],
    },
    fieldGroups: [
      { name: "Churn Signals", fields: ["Churn Risk Score (1-10)", "Stated Reasons for Leaving", "Competitor Named", "Recent Product Usage"] },
      { name: "Retention Offer", fields: ["Offer Type", "Discount Offered", "New Plan / Rate", "Offer Expires"] },
      { name: "Outcome", fields: ["Retained", "Retention Method", "Win-Back Eligible", "Outcome Notes"] },
    ],
    workflow: [
      { label: "At-risk account flagged", detail: "Churn signals scored on the account" },
      { label: "Specialist calls", detail: "Real reason for leaving established" },
      { label: "Call analyzed", detail: "Sentiment on a save-or-lose conversation" },
      { label: "Offer made & tracked", detail: "Tied to the account, with an expiry" },
      { label: "Reporting updates", detail: "Retention and revenue dashboards, automatically" },
    ],
    reporting: {
      dashboards: ["Revenue Acceleration Dashboard", "Portfolio Health Dashboard"],
      note: "Revenue saved versus at risk, alongside a cross-account health view for a team managing retention across an entire portfolio.",
    },
    whyItMatters: "Every save attempt has a real reason, a real offer, and a real outcome on record - so the next attempt with that account starts smarter, not from scratch.",
    related: ["customer-support", "debt-collection"],
    relatedFeatures: ["sales-leads", "dashboards-reports", "payroll-commission"],
  },
];

export function getCampaignBySlug(slug) {
  return CAMPAIGNS.find((campaign) => campaign.slug === slug) || null;
}
