import { cloneElement, isValidElement, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
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
  const navItems = useMemo(() => getNavItems(role || roleLabel), [role, roleLabel]);
  const [activeNavLabel, setActiveNavLabel] = useState(navItems[0]?.label || "Dashboard");

  useEffect(() => {
    setActiveNavLabel(navItems[0]?.label || "Dashboard");
  }, [navItems]);

  const content = isValidElement(children)
    ? cloneElement(children, { activeNavLabel })
    : children;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Persistent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #1a0a00 0%, #2d1200 100%)",
            color: "#fff",
            borderRight: "1px solid #5a2d00",
          },
        }}
      >
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
                onClick={() => setActiveNavLabel(item.label)}
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
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box sx={{ p: 4, flexGrow: 1 }}>
          {content}
        </Box>
      </Box>
    </Box>
  );
}

export default TenantCrmLayout;