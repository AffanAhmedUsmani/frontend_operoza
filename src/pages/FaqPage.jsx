import { useMemo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";

// Post-Sprint-20, public-website Phase 3 Step 2. Every answer here
// traces to a verified fact in PUBLIC_WEBSITE_AUDIT.md §4 - none of
// these are generic SaaS-FAQ filler.
const faqItems = [
  {
    question: "Is there a free trial?",
    answer:
      "There's a free tier with real capacity (10 seats, 1GB audio transcription, 500MB storage, 20 AI-assist actions a month) and no time limit - not a trial that expires. No credit card is required to start. You only pay if you need more capacity than that.",
  },
  {
    question: "Can each campaign use a different currency?",
    answer:
      "Yes. Every campaign has its own currency, and payroll can be paid in a different one - for example, a campaign running in USD while agents are paid in PKR. Currency conversion for commission is handled automatically.",
  },
  {
    question: "Can our clients see our whole system?",
    answer:
      "No. Clients get their own scoped view - the specific dashboards and reports you choose to share with them - not access to your internal operations, other campaigns, or other clients' data.",
  },
  {
    question: "Is our data separated from other companies using Operoza?",
    answer:
      "Yes. Every tenant's data is isolated at the data layer, not just hidden in the interface. See our Security page for specifics.",
  },
  {
    question: "What happens if we go over our plan's capacity?",
    answer:
      "Only the specific action tied to the exceeded capacity is affected (for example, inviting an 11th seat past the free allowance) - it isn't a whole-account lockout. You can add capacity as needed; see Pricing for the exact rates.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No. Create a workspace and start configuring campaigns immediately.",
  },
  {
    question: "Do agents need to be technical to use it?",
    answer:
      "No. Campaigns are built from admin-configured templates and fields, not code - the day-to-day agent experience is a guided form and a simple dashboard, not a technical tool.",
  },
  {
    question: "How does call analysis actually work?",
    answer:
      "An agent uploads call audio tied to a sale, and it's analyzed asynchronously by a dedicated service - the upload returns immediately, so agents are never blocked waiting for a result. Once ready, sentiment, compliance flags, and a summary attach to the sale record, and calls that need attention surface for QA review automatically.",
  },
  {
    question: "What are the different roles, and what can each one actually see?",
    answer:
      "Five roles - Admin, Team Lead, Agent, HR Manager, and Client - each with permissions enforced on the server, not just hidden menu items. An Agent sees their own leads and sales, a Team Lead sees their team's, an HR Manager handles attendance/payroll exceptions, and a Client sees only what an Admin explicitly marks as client-visible.",
  },
  {
    question: "Can we restrict which networks agents can log in from?",
    answer:
      "Yes. An Admin can restrict Agent sign-in to specific IP addresses or ranges, so an agent account can't be used from an unapproved network.",
  },
  {
    question: "How is payroll and commission actually calculated?",
    answer:
      "A real computation engine combines base salary, attendance-based deductions (respecting HR-approved exceptions), and commission - flat, percentage, or tiered - on won sales. If a campaign's currency differs from an employee's payroll currency, conversion happens automatically at the live exchange rate.",
  },
  {
    question: "Can we get our data out if we ever want to leave?",
    answer:
      "Yes. An Admin can request a full workspace data export at any time from Settings. It runs as a background job (built for real data volume, not a request that times out), and the same export format can restore a full workspace later.",
  },
  {
    question: "Are we stuck with the 10 campaign templates, or can we build our own?",
    answer:
      "The 10 templates are a real starting point, not a limit - every field, its type, and its per-role visibility stay admin-configurable afterward, and you can start a campaign from scratch instead of a template if none of them fit.",
  },
  {
    question: "Does the system tell anyone when something needs attention?",
    answer:
      "Yes. An event-driven notification system surfaces moments that matter - a follow-up coming due, a payout pending approval, an export finishing - directly in-app to the right person, alongside direct messages and campaign team channels scoped by assignment.",
  },
  {
    question: "Can our workspace look like our own brand, not a generic CRM?",
    answer:
      "Yes. Four tenant-selectable colors (primary, secondary, background, surface) plus your logo apply consistently across the whole workspace and its own login screen, in both light and dark mode.",
  },
  {
    question: "What kind of dashboards and reports come with it?",
    answer:
      "Ten widget types (metric, table, chart, funnel, leaderboard, commission, target, QA score, flagged calls, ROI) compute live from real campaign data, with ten ready-made dashboard templates as a starting point. A formula-driven report builder (SUM, COUNT, AVG, WHERE) layers on top, with scheduled delivery and CSV/XLSX/PDF export.",
  },
];

function FaqPage() {
  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }),
    []
  );

  return (
    <PublicLayout>
      <SeoHead
        path="/faq"
        title="FAQ"
        description="Answers to common questions about Operoza: free tier limits, multi-currency campaigns and payroll, client visibility, data isolation, and more."
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Stack spacing={1.5} sx={{ mb: 5 }} className="fade-up">
          <Chip label="FAQ" color="secondary" sx={{ alignSelf: "flex-start" }} />
          <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
            Frequently Asked Questions
          </Typography>
        </Stack>

        <Stack spacing={1} className="fade-up">
          {faqItems.map((item) => (
            <Accordion key={item.question} disableGutters sx={{ border: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography fontWeight={600}>{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{item.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 5 }}>
          <Button component={Link} to="/start" variant="contained" size="large">
            Start Free
          </Button>
          <Button component={Link} to="/contact" variant="outlined" size="large">
            Still Have Questions?
          </Button>
        </Stack>
      </Container>
    </PublicLayout>
  );
}

export default FaqPage;
