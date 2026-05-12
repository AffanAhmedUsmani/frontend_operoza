import { cloneElement, isValidElement, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  MdBarChart,
  MdCampaign,
  MdDashboard,
  MdMonetizationOn,
  MdEventNote,
  MdGroup,
  MdManageAccounts,
  MdMenu,
  MdPeople,
  MdSettings,
  MdTimeline,
} from "react-icons/md";
import { normalizeRole } from "../components/sales/salesFormUtils";
import { fetchDashboards } from "../services/dashboardService";

const DRAWER_WIDTH = 220;

function getNavItems(role, assignedDashboards = []) {
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

  const assignedItems = assignedDashboards.map((item) => ({
    key: `dashboard:${item.dashboard_id}`,
    label: item.name,
    icon: <MdDashboard />,
    kind: "assigned_dashboard",
    dashboard: item,
  }));

  const NAV_MAP = {
    admin: [usersRoles, campaigns, sales, attendance, reports, dashboards, settings],
    hr_manager: [
      attendance,
      timesheets,
      ...assignedItems,
      settings,
    ],
    team_lead: [
      dashboard,
      campaigns,
      sales,
      myTeam,
      dashboards,
      settings,
    ],
    agent: [attendance, campaigns, sales, ...assignedItems],
    client: [campaigns, reports, ...assignedItems, settings],
  };

  return NAV_MAP[role] ?? [dashboard, settings];
}

function TenantCrmLayout({ tenantName, roleLabel, role, session, onLogout, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const normalizedRole = normalizeRole(role || roleLabel);
  const [assignedDashboards, setAssignedDashboards] = useState([]);
  const navItems = useMemo(() => getNavItems(normalizedRole, assignedDashboards), [normalizedRole, assignedDashboards]);
  const [activeNavItem, setActiveNavItem] = useState(navItems[0] || { key: "Settings", label: "Settings" });
  const [mobileOpen, setMobileOpen] = useState(false);

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
      }
    };

    loadAssignedDashboards();
    const handleAssignmentsChanged = () => loadAssignedDashboards();
    window.addEventListener("dashboards:assignments-changed", handleAssignmentsChanged);
    return () => {
      alive = false;
      window.removeEventListener("dashboards:assignments-changed", handleAssignmentsChanged);
    };
  }, [normalizedRole, session?.accessToken]);

  useEffect(() => {
    setActiveNavItem((previous) => {
      const items = navItems.flatMap((item) => [item, ...(item.children || [])]);
      return items.find((item) => item.key === previous?.key) || navItems[0] || { key: "Settings", label: "Settings" };
    });
  }, [navItems]);

  const content = isValidElement(children)
    ? cloneElement(children, { activeNavLabel: activeNavItem?.label, activeNavItem })
    : children;

  const handleNavClick = (item) => {
    setActiveNavItem(item.children?.length ? item.children[0] : item);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <>
      {/* Brand header */}
      <Box sx={{ px: 2, py: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} color="#f5c58a" noWrap>
          {tenantName}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "#5a2d0055" }} />

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
                  color: "#e8c99a",
                  "&.Mui-selected": { background: "#c8794126", color: "#fff" },
                  "&.Mui-selected:hover": { background: "#c8794133", color: "#fff" },
                  "&:hover": { background: "#5a2d0040", color: "#fff" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: "inherit", fontSize: 18 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13 }} />
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
                    color: "#d9bb90",
                    minHeight: 36,
                    "&.Mui-selected": { background: "#c8794126", color: "#fff" },
                    "&.Mui-selected:hover": { background: "#c8794133", color: "#fff" },
                    "&:hover": { background: "#5a2d0040", color: "#fff" },
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
      <Divider sx={{ borderColor: "#5a2d0055" }} />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="caption" color="#c89060" display="block" gutterBottom>
          {roleLabel}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onLogout}
          sx={{ borderColor: "#5a2d00", color: "#e8c99a", "&:hover": { borderColor: "#c87941", background: "#5a2d0040" } }}
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
      background: "linear-gradient(180deg, #1a0a00 0%, #2d1200 100%)",
      color: "#fff",
      borderRight: "1px solid #5a2d00",
    },
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile AppBar with hamburger */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            background: "linear-gradient(90deg, #1a0a00 0%, #2d1200 100%)",
            borderBottom: "1px solid #5a2d00",
            boxShadow: "none",
            zIndex: (t) => t.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen((prev) => !prev)}
              sx={{ mr: 1.5, color: "#f5c58a" }}
              aria-label="Open navigation"
            >
              <MdMenu size={24} />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={700} color="#f5c58a" noWrap sx={{ flex: 1 }}>
              {tenantName}
            </Typography>
            <Typography variant="caption" color="#c89060" noWrap>
              {activeNavItem?.label}
            </Typography>
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
  );
}

export default TenantCrmLayout;