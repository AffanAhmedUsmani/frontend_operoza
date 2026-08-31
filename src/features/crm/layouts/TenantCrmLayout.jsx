import { cloneElement, isValidElement, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha, darken, lighten } from "@mui/material/styles";
import {
  MdBarChart,
  MdCampaign,
  MdChat,
  MdDashboard,
  MdMonetizationOn,
  MdEventAvailable,
  MdEventNote,
  MdGroup,
  MdManageAccounts,
  MdMenu,
  MdPayments,
  MdPeople,
  MdSettings,
  MdTimeline,
} from "react-icons/md";
import ColorModeToggle from "../../../components/ColorModeToggle";
import { normalizeRole } from "../components/sales/salesFormUtils";
import { fetchDashboards } from "../services/dashboardService";
import { listReports } from "../services/reportingService";
import { NotificationProvider } from "../../notifications/NotificationContext";
import NotificationBell from "../../notifications/components/NotificationBell";
import { MessagingProvider } from "../../messaging/MessagingContext";
import ChatDock from "../../messaging/components/ChatDock";
import FirstLoginTour from "../onboarding/FirstLoginTour";
import HelpGuidanceButton from "../onboarding/HelpGuidanceButton";
import MessagingNavBadge from "../../messaging/components/MessagingNavBadge";

const DRAWER_WIDTH = 220;

function getNavItems(role, assignedDashboards = [], includeReportsForAssignees = false) {
  const dashboard  = { key: "Dashboard", label: "Dashboard", icon: <MdDashboard /> };
  const settings   = { key: "Settings", label: "Settings", icon: <MdSettings /> };
  const campaigns  = { key: "Campaigns", label: "Campaigns", icon: <MdCampaign /> };
  const sales      = { key: "Sales", label: "Sales", icon: <MdMonetizationOn /> };
  const attendance = { key: "Attendance", label: "Attendance", icon: <MdEventNote /> };
  const dashboards = { key: "Dashboards", label: "Dashboards", icon: <MdDashboard /> };
  const reports    = { key: "Reports", label: "Reports", icon: <MdBarChart /> };
  const usersRoles = { key: "Users & Roles", label: "Users & Roles", icon: <MdManageAccounts /> };
  const myTeam     = { key: "My Team", label: "My Team", icon: <MdGroup /> };
  const timesheets = { key: "Timesheets", label: "Timesheets", icon: <MdTimeline /> };
  // Sprint 10 (docs/SPRINT_PLAN.md) - real payroll/commission visibility.
  // Deliberately absent from Client's nav: payroll_commission is NONE for
  // that role in the permission matrix, so there is nothing for Client
  // to see here at all.
  const payroll    = { key: "Payroll", label: "Payroll", icon: <MdPayments /> };
  // Sprint 12 (docs/SPRINT_PLAN.md) - only Agent/Team Lead per this
  // sprint's own deliverable text; Admin already reaches every
  // FollowUpTask via the permission matrix's FULL level but has no
  // named UI here yet (not part of this sprint's scope).
  const followUps  = { key: "Follow-Ups", label: "Follow-Ups", icon: <MdEventAvailable /> };
  // Sprint 13 (docs/SPRINT_PLAN.md) - absent from Client's nav: general
  // guide S2's messaging row is "Not available" for Client, so there is
  // nothing for this nav item to reach for that role.
  const messages   = { key: "Messages", label: "Messages", icon: <MdChat /> };

  const assignedItems = assignedDashboards.map((item) => ({
    key: `dashboard:${item.dashboard_id}`,
    label: item.name,
    icon: <MdDashboard />,
    kind: "assigned_dashboard",
    dashboard: item,
  }));

  // QA_FIX_PLAN.md step 13 - PERMISSION_MATRIX["settings"] (iam/permissions.py)
  // grants access to admin only; hr_manager, team_lead, and client were
  // incorrectly also getting a Settings nav item that led to a resource
  // they had zero backend access to. Only agent's list was already
  // correct.
  const NAV_MAP = {
    admin: [usersRoles, campaigns, sales, attendance, reports, dashboards, payroll, messages, settings],
    hr_manager: [
      attendance,
      timesheets,
      payroll,
      messages,
      ...(includeReportsForAssignees ? [reports] : []),
      ...assignedItems,
    ],
    team_lead: [
      dashboard,
      campaigns,
      sales,
      reports,
      myTeam,
      dashboards,
      payroll,
      followUps,
      messages,
    ],
    agent: [attendance, campaigns, sales, payroll, followUps, messages, ...(includeReportsForAssignees ? [reports] : []), ...assignedItems],
    client: [campaigns, ...(includeReportsForAssignees ? [reports] : []), ...assignedItems],
  };

  return NAV_MAP[role] ?? [dashboard];
}

function flattenNavItems(items) {
  return items.flatMap((item) => [item, ...(item.children || [])]);
}

function TenantCrmLayout({ tenantName, tenantLogoUrl, roleLabel, role, session, onLogout, children, colorMode, onToggleColorMode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Post-Sprint-20: the sidebar/AppBar used to be a fixed dark-brown/amber
  // scheme regardless of tenant branding - now derived from the tenant's
  // primary color, so "the whole color experience" (not just buttons in
  // the content area) shifts per tenant, while keeping the same dark
  // sidebar / light accent-text structure.
  const chrome = useMemo(() => {
    const primary = theme.palette.primary.main;
    return {
      gradientStart: darken(primary, 0.88),
      gradientEnd: darken(primary, 0.72),
      border: alpha(primary, 0.4),
      titleText: lighten(primary, 0.72),
      mutedText: lighten(primary, 0.55),
      itemText: lighten(primary, 0.62),
      childText: lighten(primary, 0.5),
      hoverBg: alpha(primary, 0.28),
      childSelectedBg: alpha(primary, 0.22),
      childSelectedHoverBg: alpha(primary, 0.3),
    };
  }, [theme.palette.primary.main]);
  const normalizedRole = normalizeRole(role || roleLabel);
  // QA_FIX_PLAN.md steps 19 & 20 - shown once per user, gated on the flag
  // the backend returns at login; dismissing (skip or finish) marks it
  // seen via FirstLoginTour's own call, this local state just controls
  // visibility within this session.
  const [showFirstLoginTour, setShowFirstLoginTour] = useState(() => session?.user?.hasSeenOnboarding === false);
  const [assignedDashboards, setAssignedDashboards] = useState([]);
  const [hasAssignedReports, setHasAssignedReports] = useState(false);
  // Sprint 2 fix: for roles whose nav depends on these async fetches
  // (hr_manager/agent/client - assignedDashboards/hasAssignedReports feed
  // getNavItems below), a persisted activeNavKey from a prior session can
  // legitimately not match navItems yet on first render, purely because the
  // fetch hasn't resolved. Tracking "has this fetch settled" lets
  // activeNavItem below tell "still loading" apart from "genuinely not
  // found" - without it, a reload landed on the wrong page immediately, and
  // permanently if the fetch ever failed (not just a brief flash).
  const [assignedDashboardsLoaded, setAssignedDashboardsLoaded] = useState(false);
  const [assignedReportsLoaded, setAssignedReportsLoaded] = useState(false);
  const needsAsyncNavData = normalizedRole !== "admin" && normalizedRole !== "team_lead";
  const navDataReady = !needsAsyncNavData || (assignedDashboardsLoaded && assignedReportsLoaded);
  const navStorageKey = useMemo(() => {
    const tenantSlug = session?.tenant?.tenantSlug || "default";
    return `operoza.crm.active-nav.${tenantSlug}.${normalizedRole}`;
  }, [normalizedRole, session?.tenant?.tenantSlug]);
  const [activeNavKey, setActiveNavKey] = useState(() => {
    try {
      const raw = sessionStorage.getItem(`operoza.crm.active-nav.${session?.tenant?.tenantSlug || "default"}.${normalizedRole}`);
      if (!raw) {
        return null;
      }

      const stored = JSON.parse(raw);
      return String(stored?.key || "").trim() || null;
    } catch (_) {
      return null;
    }
  });
  const navItems = useMemo(
    () => getNavItems(normalizedRole, assignedDashboards, hasAssignedReports),
    [normalizedRole, assignedDashboards, hasAssignedReports]
  );
  const activeNavItem = useMemo(() => {
    const items = flattenNavItems(navItems);
    if (!items.length) {
      return null;
    }

    const matched = items.find((item) => item.key === activeNavKey);
    if (matched) {
      return matched;
    }

    if (activeNavKey && !navDataReady) {
      // We have a persisted preference but haven't finished loading the
      // async-assigned nav data yet - resolve once loading completes rather
      // than falling back to item[0] and showing (or, on fetch failure,
      // permanently redirecting to) the wrong page.
      return null;
    }

    return items[0];
  }, [navItems, activeNavKey, navDataReady]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const items = flattenNavItems(navItems);
    if (!items.length) {
      setActiveNavKey(null);
      return;
    }

    if (!activeNavKey) {
      setActiveNavKey(items[0].key);
    }
  }, [navItems, activeNavKey]);

  useEffect(() => {
    if (!activeNavKey) {
      return;
    }

    try {
      sessionStorage.setItem(navStorageKey, JSON.stringify({ key: activeNavKey }));
    } catch (_) {
      // Ignore storage errors in constrained environments.
    }
  }, [activeNavKey, navStorageKey]);

  useEffect(() => {
    if (!session?.accessToken || normalizedRole === "admin" || normalizedRole === "team_lead") {
      setAssignedDashboards([]);
      return undefined;
    }

    let alive = true;
    const loadAssignedDashboards = async () => {
      try {
        const items = await fetchDashboards(session.accessToken);
        if (alive) {
          setAssignedDashboards(items);
        }
      } catch (_) {
        if (alive) {
          setAssignedDashboards([]);
        }
      } finally {
        if (alive) {
          setAssignedDashboardsLoaded(true);
        }
      }
    };

    setAssignedDashboardsLoaded(false);
    loadAssignedDashboards();
    const handleAssignmentsChanged = () => loadAssignedDashboards();
    window.addEventListener("dashboards:assignments-changed", handleAssignmentsChanged);
    return () => {
      alive = false;
      window.removeEventListener("dashboards:assignments-changed", handleAssignmentsChanged);
    };
  }, [normalizedRole, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) {
      setHasAssignedReports(false);
      return;
    }
    if (normalizedRole === "admin" || normalizedRole === "team_lead") {
      setHasAssignedReports(true);
      return;
    }

    let alive = true;
    const loadReports = async () => {
      try {
        const items = await listReports(session.accessToken);
        if (alive) {
          setHasAssignedReports(Array.isArray(items) && items.length > 0);
        }
      } catch (_) {
        if (alive) {
          setHasAssignedReports(false);
        }
      } finally {
        if (alive) {
          setAssignedReportsLoaded(true);
        }
      }
    };

    setAssignedReportsLoaded(false);
    loadReports();
    return () => {
      alive = false;
    };
  }, [normalizedRole, session?.accessToken]);

  const isResolvingNav = Boolean(activeNavKey) && !navDataReady && !activeNavItem;

  const content = isResolvingNav ? (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
      <CircularProgress size={28} color="primary" />
    </Box>
  ) : isValidElement(children) ? (
    cloneElement(children, { activeNavLabel: activeNavItem?.label, activeNavItem })
  ) : (
    children
  );

  const handleNavClick = (item) => {
    setActiveNavKey(item.children?.length ? item.children[0].key : item.key);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <>
      {/* Brand header - Sprint 19 (docs/SPRINT_PLAN.md): shows the
          tenant's own logo when they've set one via Settings -> Branding,
          alongside their name. */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          {tenantLogoUrl ? (
            <Box
              component="img"
              src={tenantLogoUrl}
              alt={`${tenantName} logo`}
              sx={{ width: 28, height: 28, borderRadius: 1, objectFit: "cover", flexShrink: 0 }}
            />
          ) : null}
          <Typography variant="subtitle1" fontWeight={700} color={chrome.titleText} noWrap>
            {tenantName}
          </Typography>
        </Stack>
        {/* Also shown in the mobile AppBar's Toolbar - not duplicated here
            on mobile, since the drawer (where this header lives) is
            hidden by default there. */}
        {!isMobile ? (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ColorModeToggle mode={colorMode} onToggle={onToggleColorMode} sx={{ color: chrome.itemText }} />
            <NotificationBell />
          </Stack>
        ) : null}
      </Stack>
      <Divider sx={{ borderColor: chrome.border }} />

      {/* Nav items */}
      <List dense sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => (
          <Box key={item.key}>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeNavItem?.key === item.key || (item.children || []).some((child) => child.key === activeNavItem?.key)}
                onClick={() => handleNavClick(item)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  color: chrome.itemText,
                  "&.Mui-selected": { background: alpha(theme.palette.primary.main, 0.35), color: "#fff" },
                  "&.Mui-selected:hover": { background: alpha(theme.palette.primary.main, 0.45), color: "#fff" },
                  "&:hover": { background: chrome.hoverBg, color: "#fff" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: "inherit", fontSize: 18 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13 }} />
                {item.key === "Messages" ? <MessagingNavBadge /> : null}
              </ListItemButton>
            </ListItem>
            {(item.children || []).map((child) => (
              <ListItem key={child.key} disablePadding sx={{ pl: 2.5 }}>
                <ListItemButton
                  selected={activeNavItem?.key === child.key}
                  onClick={() => handleNavClick(child)}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    color: chrome.childText,
                    minHeight: 36,
                    "&.Mui-selected": { background: chrome.childSelectedBg, color: "#fff" },
                    "&.Mui-selected:hover": { background: chrome.childSelectedHoverBg, color: "#fff" },
                    "&:hover": { background: chrome.hoverBg, color: "#fff" },
                  }}
                >
                  <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 12 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        ))}
      </List>

      {/* Role badge + logout at bottom */}
      <Divider sx={{ borderColor: chrome.border }} />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="caption" color={chrome.mutedText} display="block" gutterBottom>
          {roleLabel}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onLogout}
          sx={{ borderColor: chrome.border, color: chrome.itemText, "&:hover": { borderColor: theme.palette.primary.main, background: chrome.hoverBg } }}
        >
          Logout
        </Button>
      </Box>
    </>
  );

  const drawerSx = {
    width: DRAWER_WIDTH,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: DRAWER_WIDTH,
      boxSizing: "border-box",
      background: `linear-gradient(180deg, ${chrome.gradientStart} 0%, ${chrome.gradientEnd} 100%)`,
      color: "#fff",
      borderRight: `1px solid ${chrome.border}`,
    },
  };

  return (
    <NotificationProvider accessToken={session?.accessToken}>
    <MessagingProvider accessToken={session?.accessToken}>
      {/* Post-Sprint-20 - explicit bgcolor so the main content canvas
          actually tracks the nested per-tenant theme's dark/light mode;
          CssBaseline (main.jsx) only styles <body> from the ROOT theme,
          not this nested one, so without this the canvas would stay
          the root theme's background regardless of the mode toggle. */}
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Mobile AppBar with hamburger */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              background: `linear-gradient(90deg, ${chrome.gradientStart} 0%, ${chrome.gradientEnd} 100%)`,
              borderBottom: `1px solid ${chrome.border}`,
              boxShadow: "none",
              zIndex: (t) => t.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen((prev) => !prev)}
                sx={{ mr: 1.5, color: chrome.titleText }}
                aria-label="Open navigation"
              >
                <MdMenu size={24} />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={700} color={chrome.titleText} noWrap sx={{ flex: 1 }}>
                {tenantName}
              </Typography>
              <Typography variant="caption" color={chrome.mutedText} noWrap sx={{ mr: 1 }}>
                {activeNavItem?.label}
              </Typography>
              <ColorModeToggle mode={colorMode} onToggle={onToggleColorMode} sx={{ color: chrome.titleText }} />
              <NotificationBell />
            </Toolbar>
          </AppBar>
        )}

        {/* Sidebar — temporary on mobile, permanent on desktop */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={drawerSx}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer variant="permanent" sx={drawerSx}>
            {drawerContent}
          </Drawer>
        )}

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            mt: isMobile ? "56px" : 0,
          }}
        >
          <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
            {content}
          </Box>
        </Box>
      </Box>
      {/* Post-Sprint-20 - mounted once here (not per-route/per-dashboard),
          so it's present no matter which screen is currently active,
          exactly like NotificationBell already is via NotificationProvider. */}
      <ChatDock accessToken={session?.accessToken} currentUserId={session?.user?.userId} />
      <HelpGuidanceButton role={normalizedRole} activeScreenLabel={activeNavItem?.label} />
      <FirstLoginTour
        open={showFirstLoginTour}
        role={normalizedRole}
        accessToken={session?.accessToken}
        onDismiss={() => setShowFirstLoginTour(false)}
      />
    </MessagingProvider>
    </NotificationProvider>
  );
}

export default TenantCrmLayout;