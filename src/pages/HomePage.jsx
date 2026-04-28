import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  Link as MuiLink,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import { Link } from "react-router-dom";

import FloatingActions from "../components/FloatingActions";
import { apiRequest } from "../axious/api";

const testimonials = [
  {
    quote:
      "Before Operoza, we were managing everything in Excel. Now we can track every lead and every agent in one place. It has made our operations much smoother.",
    author: "BPO Owner",
    role: "Multi-Campaign Call Center",
  },
  {
    quote:
      "We finally have visibility on our team. I can see performance, follow-ups, and results without asking anyone.",
    author: "Operations Manager",
    role: "Outbound Sales Program",
  },
  {
    quote:
      "Simple, fast, and actually built for how call centers work. It saves us hours every day.",
    author: "Team Lead",
    role: "Customer Support Team",
  },
];

const heroValuePoints = [
  "Assign and track leads in real-time",
  "Monitor agent performance instantly",
  "Customize workflows for any campaign",
  "Get clear reports without manual work",
];

const problemPoints = [
  "Leads get lost or duplicated",
  "Agents do not follow up properly",
  "No visibility on real performance",
  "Managers rely on manual reports",
  "Scaling operations becomes messy",
];

const solutionBlocks = [
  {
    icon: <GroupsRoundedIcon fontSize="large" color="primary" />,
    title: "Lead and Campaign Management",
    detail: "Organize leads, assign them to agents, and track progress across campaigns.",
  },
  {
    icon: <TimelineRoundedIcon fontSize="large" color="primary" />,
    title: "Agent Performance Tracking",
    detail: "See who is working, who is closing, and who needs support right now.",
  },
  {
    icon: <AdminPanelSettingsRoundedIcon fontSize="large" color="primary" />,
    title: "Role-Based Access Control",
    detail: "Give the right access to admins, managers, and agents with clear boundaries.",
  },
  {
    icon: <InsightsRoundedIcon fontSize="large" color="primary" />,
    title: "Real-Time Reporting",
    detail: "Get instant insights without waiting for manual updates or spreadsheet merges.",
  },
  {
    icon: <SpeedRoundedIcon fontSize="large" color="primary" />,
    title: "Simple Setup",
    detail: "Try CRM free for one week and launch operations quickly with guided setup.",
  },
];

const insightPoints = [
  "Identify top-performing agents instantly",
  "Track conversion rates across campaigns",
  "Spot bottlenecks in your pipeline",
  "Monitor daily activity without chasing reports",
];

const howItWorks = [
  "Set up your campaigns and workflow",
  "Add your team and assign roles",
  "Start managing leads and tracking performance",
];

const pricingHooks = [
  "No setup fees",
  "No complicated plans",
  "Built for cost-sensitive BPOs",
];

const sectionTitleSx = {
  mb: 1,
  fontSize: { xs: "1.7rem", md: "2.2rem" },
};

function BulletList({ items, errorTone = false }) {
  return (
    <List dense sx={{ py: 0 }}>
      {items.map((item) => (
        <ListItem key={item} disableGutters>
          <ListItemIcon sx={{ minWidth: 34 }}>
            {errorTone ? <ErrorOutlineRoundedIcon color="primary" /> : <CheckCircleRoundedIcon color="secondary" />}
          </ListItemIcon>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );
}

function HomePage() {
  const [liveCrmRows, setLiveCrmRows] = useState([]);
  const [isLoadingLiveCrm, setIsLoadingLiveCrm] = useState(true);
  const [liveCrmError, setLiveCrmError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchLiveWorkspaces = async () => {
      setIsLoadingLiveCrm(true);
      setLiveCrmError("");

      try {
        const data = await apiRequest("/api/auth/live-workspaces", { method: "GET" });
        if (!isMounted) {
          return;
        }

        const rows = Array.isArray(data.items)
          ? data.items.map((row) => ({
              workspaceName: row.workspace_name,
              workspaceUrl: row.workspace_url,
              currentUsers: row.current_users,
            }))
          : [];
        setLiveCrmRows(rows);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setLiveCrmRows([]);
        setLiveCrmError(error.message || "Unable to load live CRM data.");
      } finally {
        if (isMounted) {
          setIsLoadingLiveCrm(false);
        }
      }
    };

    fetchLiveWorkspaces();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box className="page-shell">
      <Box className="ambient-bg" />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: "relative", zIndex: 2 }}>
        <Stack spacing={3} alignItems="flex-start" className="fade-up">
          <Chip label="Operoza CRM Platform for BPO Teams" color="secondary" />
          <Typography variant="h1" sx={{ fontSize: { xs: "2.2rem", md: "4rem" }, maxWidth: 900 }}>
            Run Your Call Center Without the Chaos
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 840 }}>
            Operoza is a simple, powerful CRM built specifically for BPOs to manage leads, track agent performance, and control operations without spreadsheets or complicated tools.
          </Typography>
          <BulletList items={heroValuePoints} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              component={Link}
              to="/start"
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              className="pulse-cta"
            >
              Try For Your Team Today
            </Button>
          
          </Stack>
        </Stack>

        <Divider sx={{ my: { xs: 5, md: 7 } }} />

        <Box className="fade-up">
          <Typography variant="h3" sx={sectionTitleSx}>
            Still Running Your BPO on Excel and WhatsApp?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            Operoza replaces disconnected operations with one simple system.
          </Typography>
          <BulletList items={problemPoints} errorTone />
        </Box>

        <Divider sx={{ my: { xs: 5, md: 7 } }} />

        <Box>
          <Typography variant="h3" sx={sectionTitleSx}>
            Everything You Need to Run a BPO In One Place
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Operoza is designed for real call center workflows, not generic CRM use cases.
          </Typography>
          <Grid container spacing={3}>
            {solutionBlocks.map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item.title}>
                <Card className="feature-card fade-up" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      {item.icon}
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography color="text.secondary">{item.detail}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: { xs: 5, md: 7 } }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className="feature-card fade-up" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Real Insights, Not Guesswork
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1.2 }}>
                  Operoza helps you understand what is actually happening inside your call center.
                </Typography>
                <BulletList items={insightPoints} />
                <Typography sx={{ mt: 1.2, fontWeight: 700 }}>
                  Make decisions based on data, not assumptions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className="feature-card fade-up" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Get Started in 3 Simple Steps
                </Typography>
                <BulletList items={howItWorks} />
                <Typography color="text.secondary" sx={{ mt: 1.2 }}>
                  No complex onboarding. No technical headaches.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 5, md: 7 } }} />

        <Box className="fade-up">
          <Typography variant="h3" sx={sectionTitleSx}>
            Live CRM Workspaces Right Now
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            A quick public snapshot of active tenant workspaces and their current user activity.
          </Typography>
          <Card sx={{ border: "1px solid #ead8c4" }}>
            <TableContainer>
              <Table size="small" aria-label="Live CRM workspaces">
                <TableHead>
                  <TableRow>
                    <TableCell>CRM Workspace</TableCell>
                    <TableCell>Live URL</TableCell>
                    <TableCell align="right">Current Users</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoadingLiveCrm ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ py: 0.5 }}>
                          <CircularProgress size={18} />
                          <Typography variant="body2" color="text.secondary">
                            Loading live workspace activity...
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {!isLoadingLiveCrm && liveCrmError ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="error.main">
                          {liveCrmError}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {!isLoadingLiveCrm && !liveCrmError && liveCrmRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">
                          No active CRM workspaces yet. Your team could be the first one listed.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {!isLoadingLiveCrm && !liveCrmError
                    ? liveCrmRows.map((row) => (
                        <TableRow key={`${row.workspaceName}-${row.workspaceUrl}`} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{row.workspaceName}</TableCell>
                          <TableCell>
                            <MuiLink href={row.workspaceUrl} target="_blank" rel="noreferrer" underline="hover">
                              {row.workspaceUrl}
                            </MuiLink>
                          </TableCell>
                          <TableCell align="right">{row.currentUsers}</TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        <Divider sx={{ my: { xs: 5, md: 7 } }} />

        <Box>
          <Typography variant="h3" sx={sectionTitleSx}>
            What BPO Teams Are Saying
          </Typography>
          <Grid container spacing={3}>
            {testimonials.map((t) => (
              <Grid item xs={12} md={4} key={t.author + t.role}>
                <Card className="testimonial-card fade-up" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography sx={{ mb: 2 }}>&quot;{t.quote}&quot;</Typography>
                    <Typography fontWeight={700}>{t.author}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: { xs: 5, md: 7 } }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card className="feature-card fade-up" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Simple, Affordable Pricing
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Start small and scale as your team grows.
                </Typography>
                <BulletList items={pricingHooks} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: { xs: 3, md: 4 }, border: "1px solid #ead8c4" }} className="fade-up">
              <Stack spacing={2}>
                <Typography variant="h4">Take Control of Your Call Center Today</Typography>
                <Typography color="text.secondary">
                  Stop relying on spreadsheets and disconnected tools. Start using a system built for your business.
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>Try CRM free for one week.</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button component={Link} to="/start" variant="contained" size="large">
                    Try For Your Team Today
                  </Button>
                 
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <FloatingActions />
    </Box>
  );
}

export default HomePage;
