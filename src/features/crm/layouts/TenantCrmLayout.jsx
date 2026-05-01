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
  MdEventNote,
  MdGavel,
  MdGroup,
  MdHeadset,
  MdManageAccounts,
  MdMenu,
  MdOutlineAttachMoney,
  MdPeople,
  MdPhoneInTalk,
  MdSettings,
  MdStar,
  MdTimeline,
} from "react-icons/md";

const DRAWER_WIDTH = 220;

function getNavItems(role) {
  const dashboard = { label: "Dashboard", icon: <MdDashboard /> };
  const settings = { label: "Settings", icon: <MdSettings /> };

  const NAV_MAP = {
    super_admin: [dashboard, { label: "Users & Roles", icon: <MdManageAccounts /> }, { label: "Campaigns", icon: <MdCampaign /> }, { label: "Reports", icon: <MdBarChart /> }, settings],
    admin: [dashboard, { label: "Users & Roles", icon: <MdManageAccounts /> }, { label: "Campaigns", icon: <MdCampaign /> }, { label: "Reports", icon: <MdBarChart /> }, settings],
    hr_manager: [dashboard, { label: "Attendance", icon: <MdEventNote /> }, { label: "Timesheets", icon: <MdTimeline /> }, settings],
    qa_manager: [dashboard, { label: "Call Review", icon: <MdHeadset /> }, { label: "Scorecards", icon: <MdStar /> }, settings],
    finance_manager: [dashboard, { label: "Commission", icon: <MdOutlineAttachMoney /> }, { label: "Payouts", icon: <MdOutlineAttachMoney /> }, settings],
    team_lead: [dashboard, { label: "My Team", icon: <MdGroup /> }, { label: "Pipeline", icon: <MdTimeline /> }, settings],
    manager: [dashboard, { label: "My Team", icon: <MdGroup /> }, { label: "Pipeline", icon: <MdTimeline /> }, settings],
    closer: [dashboard, { label: "My Leads", icon: <MdPeople /> }, settings],
    licensed_agent: [dashboard, { label: "My Leads", icon: <MdPeople /> }, { label: "Compliance", icon: <MdGavel /> }, settings],
    retention_agent: [dashboard, { label: "My Leads", icon: <MdPeople /> }, settings],
    inbound_agent: [dashboard, { label: "My Leads", icon: <MdPeople /> }, { label: "Call Log", icon: <MdPhoneInTalk /> }, settings],
    outbound_agent: [dashboard, { label: "My Leads", icon: <MdPeople /> }, { label: "Call Log", icon: <MdPhoneInTalk /> }, settings],
    agent: [dashboard, { label: "My Leads", icon: <MdPeople /> }, settings],
    report_viewer: [dashboard, { label: "Reports", icon: <MdBarChart /> }, settings],
    client_viewer: [dashboard, { label: "Campaigns", icon: <MdCampaign /> }, settings],
  };

  return NAV_MAP[role] || [dashboard, settings];
}

function TenantCrmLayout({ tenantName, roleLabel, role, onLogout, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navItems = useMemo(() => getNavItems(role || roleLabel), [role, roleLabel]);
  const [activeNavLabel, setActiveNavLabel] = useState(navItems[0]?.label || "Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setActiveNavLabel(navItems[0]?.label || "Dashboard");
  }, [navItems]);

  const content = isValidElement(children)
    ? cloneElement(children, { activeNavLabel })
    : children;

  const handleNavClick = (label) => {
    setActiveNavLabel(label);
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
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              selected={activeNavLabel === item.label}
              onClick={() => handleNavClick(item.label)}
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
              {activeNavLabel}
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