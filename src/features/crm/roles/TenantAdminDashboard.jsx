import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Switch,
  Tooltip,
} from "@mui/material";
import { MdDelete, MdEdit, MdVisibility } from "react-icons/md";

import {
  assignRoleToTenantUser,
  createAllowedNetwork,
  createTenantUser,
  fetchAllowedNetworks,
  fetchCurrentClientIp,
  fetchTenantRoles,
  fetchTenantUsers,
} from "../services/adminService";
import {
  deleteAllowedNetwork,
  deleteTenantUser,
  toggleTenantRole,
  updateTenantUser,
} from "../services/adminService";
import CampaignsPanel from "../components/CampaignsPanel";
import ComingSoonNotice from "../components/ComingSoonNotice";
import PayrollSettingsPanel from "../components/PayrollSettingsPanel";
import TenantUsagePanel from "../components/TenantUsagePanel";
import UpgradeRequiredModal from "../components/UpgradeRequiredModal";
import TenantDataExportPanel from "../components/TenantDataExportPanel";
import TenantBrandingPanel from "../components/TenantBrandingPanel";
import TenantCurrencyPanel from "../components/TenantCurrencyPanel";
import ActivityLogPanel from "../components/ActivityLogPanel";
import GettingStartedChecklist from "../components/GettingStartedChecklist";
import PayrollPanel from "../components/PayrollPanel";
import MessagingPanel from "../../messaging/components/MessagingPanel";
import AttendancePanel from "../components/AttendancePanel";
import SalesPanel from "../components/SalesPanel";
import DashboardsPanel from "../components/dashboard/DashboardsPanel";
import ReportsPanel from "../components/reports/ReportsPanel";
import { useCampaigns } from "../hooks/useCampaigns";

// Sprint 9 (docs/SPRINT_PLAN.md), general guide S10 - mirrors
// payroll/models.py's PAYROLL_ELIGIBLE_ROLE_CODES. Only used to decide
// whether to SHOW the base-salary field; the backend independently
// enforces this same rule server-side (admin_users POST), so this list
// drifting out of sync would only ever hide/show a field, never bypass
// the real gate.
const PAYROLL_ELIGIBLE_ROLE_CODES = new Set(["team_lead", "agent", "hr_manager"]);

function TenantAdminDashboard({ session, activeNavLabel }) {
  const accessToken = session?.accessToken;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState(0);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [upgradeModalReason, setUpgradeModalReason] = useState(null);
  const { campaigns: overviewCampaigns } = useCampaigns(accessToken);

  const [newUserForm, setNewUserForm] = useState({
    displayName: "",
    email: "",
    password: "Test@1234",
    roleCode: "agent",
    phoneNumber: "",
    photo: null,
    baseSalaryAmount: "",
  });
  const photoInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [assignForm, setAssignForm] = useState({
    targetUserId: "",
    roleCode: "agent",
  });
  const [tableFilters, setTableFilters] = useState({
    query: "",
    status: "all",
    roleCode: "all",
  });

  // view / edit / delete dialog state
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ displayName: "", phoneNumber: "", accountStatusCode: "active", password: "", photo: null });
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const editPhotoRef = useRef(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Network access (Sprint 3 - IP allocation)
  const [networks, setNetworks] = useState([]);
  const [networksLoaded, setNetworksLoaded] = useState(false);
  const [currentIp, setCurrentIp] = useState("");
  const [networkForm, setNetworkForm] = useState({ label: "", cidr: "" });
  const [networkError, setNetworkError] = useState("");
  const [networkSuccess, setNetworkSuccess] = useState("");
  const [pendingNetworkSubmit, setPendingNetworkSubmit] = useState(false);
  const [deleteNetwork, setDeleteNetwork] = useState(null);

  const enabledRoles = roles.filter((r) => r.enabled);
  const queryValue = tableFilters.query.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesStatus = tableFilters.status === "all" || user.status === tableFilters.status;
    const matchesRole =
      tableFilters.roleCode === "all" ||
      (Array.isArray(user.roles) && user.roles.some((r) => r.role_code === tableFilters.roleCode));

    if (!queryValue) {
      return matchesStatus && matchesRole;
    }

    const joinedRoleText = Array.isArray(user.roles)
      ? user.roles.map((r) => `${r.display_name} ${r.role_code}`).join(" ").toLowerCase()
      : "";
    const searchable = [
      user.display_name || "",
      user.email || "",
      user.phone_number || "",
      joinedRoleText,
    ]
      .join(" ")
      .toLowerCase();

    return matchesStatus && matchesRole && searchable.includes(queryValue);
  });

  const loadData = async () => {
    if (!accessToken) {
      return;
    }

    setErrorMessage("");
    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        fetchTenantRoles(accessToken),
        fetchTenantUsers(accessToken),
      ]);
      setRoles(rolesResponse);
      setUsers(usersResponse);

      const firstEnabled = rolesResponse.find((r) => r.enabled)?.role_code || "";
      setNewUserForm((prev) => ({ ...prev, roleCode: prev.roleCode || firstEnabled }));
      setAssignForm((prev) => ({ ...prev, roleCode: prev.roleCode || firstEnabled }));
    } catch (error) {
      setErrorMessage(error.message || "Unable to load tenant administration data.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const adminTabIndexByLabel = {
      "Dashboard": 0,
      "Users & Roles": 1,
      "Campaigns": 2,
      "Sales": 3,
      "Attendance": 4,
      "Reports": 5,
      "Dashboards": 6,
      "Payroll": 8,
      "Messages": 9,
      "Settings": 7,
    };
    if (activeNavLabel && adminTabIndexByLabel[activeNavLabel] !== undefined) {
      setActiveTab(adminTabIndexByLabel[activeNavLabel]);
    }
  }, [activeNavLabel]);

  // Network access data is only needed once the Settings tab is opened.
  useEffect(() => {
    if (activeTab !== 7 || networksLoaded || !accessToken) {
      return;
    }
    (async () => {
      try {
        const [networksResponse, ipResponse] = await Promise.all([
          fetchAllowedNetworks(accessToken),
          fetchCurrentClientIp(accessToken),
        ]);
        setNetworks(networksResponse);
        setCurrentIp(ipResponse);
        setNetworksLoaded(true);
      } catch (error) {
        setNetworkError(error.message || "Unable to load network access settings.");
      }
    })();
  }, [activeTab, networksLoaded, accessToken]);

  const tenantWideNetworkCount = networks.filter((n) => !n.campaign_id).length;

  const submitNetworkForm = async () => {
    setNetworkError("");
    setNetworkSuccess("");
    try {
      const created = await createAllowedNetwork(accessToken, networkForm);
      setNetworks((prev) => [created, ...prev]);
      setNetworkForm({ label: "", cidr: "" });
      setNetworkSuccess("Network entry added.");
    } catch (error) {
      setNetworkError(error.message || "Unable to add network entry.");
    }
  };

  const handleAddNetwork = async (event) => {
    event.preventDefault();
    if (!networkForm.label.trim() || !networkForm.cidr.trim()) {
      return;
    }
    // Going from zero to one tenant-wide entries is the moment IP
    // restriction switches on for Agents in this tenant - warn before that
    // specific transition rather than on every add, since only that first
    // entry can silently lock someone out who isn't expecting it yet.
    if (tenantWideNetworkCount === 0) {
      setPendingNetworkSubmit(true);
      return;
    }
    await submitNetworkForm();
  };

  const handleConfirmFirstNetwork = async () => {
    setPendingNetworkSubmit(false);
    await submitNetworkForm();
  };

  const handleUseCurrentIp = () => {
    setNetworkForm((prev) => ({
      ...prev,
      cidr: currentIp ? `${currentIp}/32` : prev.cidr,
    }));
  };

  const handleDeleteNetwork = async () => {
    if (!deleteNetwork) return;
    setNetworkError("");
    setNetworkSuccess("");
    try {
      await deleteAllowedNetwork(accessToken, deleteNetwork.allowed_network_id);
      setNetworks((prev) => prev.filter((n) => n.allowed_network_id !== deleteNetwork.allowed_network_id));
      setNetworkSuccess(`Removed "${deleteNetwork.label}".`);
      setDeleteNetwork(null);
    } catch (error) {
      setNetworkError(error.message || "Unable to remove network entry.");
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!accessToken) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createTenantUser(accessToken, newUserForm);
      setSuccessMessage("New user created successfully.");
      setNewUserForm((prev) => ({ ...prev, displayName: "", email: "", phoneNumber: "", photo: null, baseSalaryAmount: "" }));
      setPhotoPreview(null);
      await loadData();
    } catch (error) {
      // PLATFORM_OPS_AND_BILLING.md S3 - a real seat-quota block
      // (iam/views.py's admin_users POST branch), not a generic
      // failure - show the "contact support to upgrade" path instead
      // of a bare error string the admin has no way to act on.
      if (error.data?.code === "seat_quota_exceeded") {
        setUpgradeModalReason("seat_quota_exceeded");
      } else {
        setErrorMessage(error.message || "Unable to create user.");
      }
    }
  };

  const handleToggleRole = async (roleCode, currentlyEnabled) => {
    try {
      await toggleTenantRole(accessToken, roleCode, !currentlyEnabled);
      setRoles((prev) => prev.map((r) => (r.role_code === roleCode ? { ...r, enabled: !currentlyEnabled } : r)));
    } catch (err) {
      setErrorMessage(err.message || "Failed to toggle role.");
    }
  };

  const handleAssignRole = async (event) => {
    event.preventDefault();
    if (!accessToken) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await assignRoleToTenantUser(accessToken, assignForm);
      setSuccessMessage("Role assigned successfully.");
      await loadData();
    } catch (error) {
      setErrorMessage(error.message || "Unable to assign role.");
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ displayName: user.display_name, phoneNumber: user.phone_number || "", accountStatusCode: user.status, password: "", photo: null });
    setEditPhotoPreview(user.photo_url || null);
  };

  const handleSaveEdit = async () => {
    setErrorMessage(""); setSuccessMessage("");
    try {
      await updateTenantUser(accessToken, editUser.user_id, editForm);
      setSuccessMessage("User updated.");
      setEditUser(null);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || "Unable to update user.");
    }
  };

  const handleConfirmDelete = async () => {
    setErrorMessage(""); setSuccessMessage("");
    try {
      await deleteTenantUser(accessToken, deleteUser.user_id);
      setSuccessMessage(`${deleteUser.display_name} deleted.`);
      setDeleteUser(null);
      setDeleteConfirm("");
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || "Unable to delete user.");
    }
  };

  // Thin wrapper so DashboardsPanel can load its own campaigns
  function DashboardsPanelWrapper({ accessToken: token, role }) {
    const { campaigns } = useCampaigns(token);
    return <DashboardsPanel accessToken={token} role={role} campaigns={campaigns} />;
  }

  return (
    <Stack spacing={3}>
      {/* Dashboard tab */}
      {activeTab === 0 && (
        <Stack spacing={2}>
          <GettingStartedChecklist
            accessToken={accessToken}
            campaignCount={overviewCampaigns.length}
            onNavigate={setActiveTab}
          />
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6">Overview</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Tenant-wide KPIs, live activity, and campaign summaries will appear here.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Users & Roles tab */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

          {/* Role catalogue with toggles */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Available Roles</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Toggle the roles you want available for your team. Only enabled roles appear when creating users.
              </Typography>
                <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" } }}>
                {roles.map((role) => (
                    <Box key={role.role_code}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid", borderColor: role.enabled ? "primary.light" : "divider", borderRadius: 1, px: 1.5, py: 0.5, bgcolor: role.enabled ? "brand.subtle" : "transparent" }}>
                      <Stack>
                        <Typography variant="body2" fontWeight={role.enabled ? 600 : 400}>{role.display_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{role.role_code}</Typography>
                      </Stack>
                      <Switch size="small" checked={!!role.enabled} onChange={() => handleToggleRole(role.role_code, role.enabled)} />
                    </Box>
                    </Box>
                ))}
                </Box>
            </CardContent>
          </Card>

          {/* Create user */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Create Sub User</Typography>
              <Stack component="form" spacing={1.5} onSubmit={handleCreateUser}>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                  <TextField label="Full name" fullWidth required value={newUserForm.displayName} onChange={(e) => setNewUserForm((p) => ({ ...p, displayName: e.target.value }))} />
                  <TextField label="Phone number" fullWidth value={newUserForm.phoneNumber} onChange={(e) => setNewUserForm((p) => ({ ...p, phoneNumber: e.target.value }))} />
                  <TextField label="Email" type="email" fullWidth required value={newUserForm.email} onChange={(e) => setNewUserForm((p) => ({ ...p, email: e.target.value }))} />
                  <TextField label="Temporary password" fullWidth required value={newUserForm.password} onChange={(e) => setNewUserForm((p) => ({ ...p, password: e.target.value }))} />
                  <Box>
                    <TextField
                      label="Initial role"
                      select
                      fullWidth
                      required
                      value={enabledRoles.some((role) => role.role_code === newUserForm.roleCode) ? newUserForm.roleCode : ""}
                      onChange={(e) => setNewUserForm((p) => ({ ...p, roleCode: e.target.value }))}
                    >
                      {enabledRoles.length === 0 && <MenuItem disabled value="">No roles enabled — toggle above first</MenuItem>}
                      {enabledRoles.map((r) => <MenuItem key={r.role_code} value={r.role_code}>{r.display_name}</MenuItem>)}
                    </TextField>
                  </Box>
                  {PAYROLL_ELIGIBLE_ROLE_CODES.has(newUserForm.roleCode) ? (
                    <TextField
                      label="Base salary (optional)"
                      type="number"
                      fullWidth
                      inputProps={{ min: 0, step: "0.01" }}
                      helperText="Leave blank to set up payroll for this person later"
                      value={newUserForm.baseSalaryAmount}
                      onChange={(e) => setNewUserForm((p) => ({ ...p, baseSalaryAmount: e.target.value }))}
                    />
                  ) : null}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pt: 0.5 }}>
                      <Avatar src={photoPreview || undefined} sx={{ width: 44, height: 44, cursor: "pointer", border: "2px dashed", borderColor: "primary.light" }} onClick={() => photoInputRef.current?.click()} />
                      <Stack>
                        <Typography variant="caption" color="text.secondary">Profile photo (optional)</Typography>
                        <Button size="small" variant="text" sx={{ p: 0 }} onClick={() => photoInputRef.current?.click()}>{photoPreview ? "Change" : "Upload"}</Button>
                      </Stack>
                      <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setNewUserForm((p) => ({ ...p, photo: f })); setPhotoPreview(URL.createObjectURL(f)); } }} />
                    </Stack>
                  </Box>
                </Box>
                <Box>
                  <Button type="submit" variant="contained" disabled={!newUserForm.displayName || !newUserForm.email || !newUserForm.roleCode}>Create User</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Assign role */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Assign Role to Existing User</Typography>
              <Stack component="form" spacing={1.5} onSubmit={handleAssignRole} direction={{ xs: "column", md: "row" }}>
                <TextField label="Select user" select fullWidth value={assignForm.targetUserId} onChange={(e) => setAssignForm((p) => ({ ...p, targetUserId: e.target.value }))}>
                  {users.map((u) => <MenuItem key={u.user_id} value={u.user_id}>{u.display_name} ({u.email})</MenuItem>)}
                </TextField>
                <TextField
                  label="Role"
                  select
                  fullWidth
                  value={enabledRoles.some((role) => role.role_code === assignForm.roleCode) ? assignForm.roleCode : ""}
                  onChange={(e) => setAssignForm((p) => ({ ...p, roleCode: e.target.value }))}
                >
                  {enabledRoles.map((r) => <MenuItem key={r.role_code} value={r.role_code}>{r.display_name}</MenuItem>)}
                </TextField>
                <Button type="submit" variant="outlined" sx={{ minWidth: 120 }} disabled={!assignForm.targetUserId || !assignForm.roleCode}>Assign</Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Users table with CRUD */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Tenant Users ({filteredUsers.length} / {users.length})</Typography>
              <Box sx={{ display: "grid", gap: 1.5, mb: 2, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 5fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 1fr)" } }}>
                <Box>
                  <TextField
                    label="Search users"
                    fullWidth
                    placeholder="Name, email, phone, or role"
                    value={tableFilters.query}
                    onChange={(e) => setTableFilters((prev) => ({ ...prev, query: e.target.value }))}
                  />
                </Box>
                <Box>
                  <TextField
                    label="Status"
                    select
                    fullWidth
                    value={tableFilters.status}
                    onChange={(e) => setTableFilters((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="all">All statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="pending_verification">Pending verification</MenuItem>
                  </TextField>
                </Box>
                <Box>
                  <TextField
                    label="Role"
                    select
                    fullWidth
                    value={tableFilters.roleCode}
                    onChange={(e) => setTableFilters((prev) => ({ ...prev, roleCode: e.target.value }))}
                  >
                    <MenuItem value="all">All roles</MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.role_code} value={role.role_code}>
                        {role.display_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box>
                  <Button
                    variant="text"
                    fullWidth
                    sx={{ height: "100%" }}
                    onClick={() => setTableFilters({ query: "", status: "all", roleCode: "all" })}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
              {isMobile ? (
                /* Mobile: card list */
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {filteredUsers.map((user) => (
                    <Card key={user.user_id} variant="outlined" sx={{ borderColor: "divider" }}>
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar src={user.photo_url || undefined} sx={{ width: 40, height: 40 }}>
                            {!user.photo_url ? (user.display_name?.[0] || "?") : null}
                          </Avatar>
                          <Stack flex={1} minWidth={0}>
                            <Typography fontWeight={600} noWrap>{user.display_name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                              <Chip label={user.status} color={user.status === "active" ? "success" : user.status === "suspended" ? "error" : "default"} size="small" />
                              {user.roles.slice(0, 2).map((r) => (
                                <Chip key={r.role_code} label={r.display_name} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </Stack>
                          <Stack direction="row" spacing={0.5} flexShrink={0}>
                            <Tooltip title="View"><IconButton size="small" onClick={() => setViewUser(user)}><MdVisibility /></IconButton></Tooltip>
                            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(user)}><MdEdit /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setDeleteUser(user); setDeleteConfirm(""); }}><MdDelete /></IconButton></Tooltip>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                /* Desktop: table */
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Photo</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Roles</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.user_id} hover>
                          <TableCell><Avatar src={user.photo_url || undefined} sx={{ width: 32, height: 32 }}>{!user.photo_url ? (user.display_name?.[0] || "?") : null}</Avatar></TableCell>
                          <TableCell>{user.display_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone_number || "—"}</TableCell>
                          <TableCell><Chip label={user.status} color={user.status === "active" ? "success" : user.status === "suspended" ? "error" : "default"} size="small" /></TableCell>
                          <TableCell>{user.roles.length > 0 ? user.roles.map((r) => r.display_name).join(", ") : <Typography variant="caption" color="text.secondary">No role</Typography>}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" justifyContent="center" spacing={0.5}>
                              <Tooltip title="View"><IconButton size="small" onClick={() => setViewUser(user)}><MdVisibility /></IconButton></Tooltip>
                              <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(user)}><MdEdit /></IconButton></Tooltip>
                              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setDeleteUser(user); setDeleteConfirm(""); }}><MdDelete /></IconButton></Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Campaigns tab */}
      {activeTab === 2 && (
        <CampaignsPanel accessToken={accessToken} />
      )}

      {/* Reports tab */}
      {activeTab === 3 && (
        <SalesPanel accessToken={accessToken} />
      )}

      {/* Attendance tab */}
      {activeTab === 4 && (
        <AttendancePanel accessToken={accessToken} users={users} />
      )}

      {/* Reports tab */}
      {activeTab === 5 && (
        <ReportsPanel session={session} accessToken={accessToken} />
      )}

      {/* Dashboards tab */}
      {activeTab === 6 && (
        <DashboardsPanelWrapper accessToken={accessToken} role="admin" />
      )}

      {/* Settings tab */}
      {activeTab === 7 && (
        <Stack spacing={3}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6">Settings</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {/* Sprint 8 (docs/SPRINT_PLAN.md): these previously
                    described specific working capabilities with zero
                    state or API calls behind them (general guide §15.7) -
                    now honestly labeled instead of implying they work.
                    "Billing" (Sprint 16) and "Branding" (Sprint 19) are
                    gone: both now render real panels below instead of a
                    coming-soon notice. */}
                <ComingSoonNotice
                  title="Integrations"
                  description="Connect external tools for exports, notifications, and reporting sync."
                  sprint="Sprint 11"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Tenant branding (Sprint 19 - docs/SPRINT_PLAN.md) */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Branding</Typography>
              <TenantBrandingPanel accessToken={accessToken} />
            </CardContent>
          </Card>

          {/* Currency (Post-Sprint-20) */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Currency</Typography>
              <TenantCurrencyPanel accessToken={accessToken} />
            </CardContent>
          </Card>

          {/* Usage & capacity (Sprint 17 - docs/SPRINT_PLAN.md) */}
          <TenantUsagePanel accessToken={accessToken} />

          {/* Data export/portability (Sprint 18 - docs/SPRINT_PLAN.md) */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Data Export</Typography>
              <TenantDataExportPanel accessToken={accessToken} />
            </CardContent>
          </Card>

          {/* Payroll policy (Sprint 9 - docs/SPRINT_PLAN.md) */}
          <PayrollSettingsPanel accessToken={accessToken} />

          {/* Network Access (IP allocation) */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Network Access</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Restrict Agents in this workspace to sign in and work only from the IP addresses or ranges listed
                below. Other roles are never restricted by this list.
              </Typography>

              {networkError ? <Alert severity="error" sx={{ mb: 2 }}>{networkError}</Alert> : null}
              {networkSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{networkSuccess}</Alert> : null}

              <Alert severity="info" sx={{ mb: 2 }}>
                Your current session IP, as seen by the server, is <strong>{currentIp || "…"}</strong>.
                {" "}This is whichever device/network you're using right now to view this page - if
                you're testing locally it will show a loopback address (127.0.0.1), not a real
                network IP; that's expected outside of production. To allowlist a specific team
                member's IP instead of your own, use their address from the Users tab below.
              </Alert>

              <Stack component="form" spacing={1.5} onSubmit={handleAddNetwork} sx={{ mb: 3 }}>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
                  <TextField
                    label="Label"
                    placeholder="Main office"
                    fullWidth
                    value={networkForm.label}
                    onChange={(e) => setNetworkForm((p) => ({ ...p, label: e.target.value }))}
                  />
                  <TextField
                    label="IP address or CIDR range"
                    placeholder="203.0.113.44/32"
                    fullWidth
                    value={networkForm.cidr}
                    onChange={(e) => setNetworkForm((p) => ({ ...p, cidr: e.target.value }))}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button variant="text" onClick={handleUseCurrentIp} disabled={!currentIp}>Use my IP</Button>
                    <Button type="submit" variant="contained" disabled={!networkForm.label.trim() || !networkForm.cidr.trim()}>
                      Add
                    </Button>
                  </Stack>
                </Box>
              </Stack>

              {networks.length === 0 ? (
                <Typography color="text.secondary">
                  No networks configured yet — Agents can currently sign in from any location.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Label</TableCell>
                        <TableCell>CIDR</TableCell>
                        <TableCell>Added</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {networks.map((network) => (
                        <TableRow key={network.allowed_network_id} hover>
                          <TableCell>{network.label}</TableCell>
                          <TableCell>{network.cidr}</TableCell>
                          <TableCell>{new Date(network.created_at).toLocaleString()}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Remove">
                              <IconButton size="small" color="error" onClick={() => setDeleteNetwork(network)}>
                                <MdDelete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Activity Log (Post-Sprint-20) */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Activity Log</Typography>
              <ActivityLogPanel accessToken={accessToken} />
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Payroll tab (Sprint 10 - docs/SPRINT_PLAN.md) */}
      {activeTab === 8 && <PayrollPanel accessToken={accessToken} role="admin" />}

      {/* Messages tab (Sprint 13 - docs/SPRINT_PLAN.md) */}
      {activeTab === 9 && <MessagingPanel accessToken={accessToken} />}

      {/* VIEW DIALOG */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {viewUser && (
            <Stack spacing={2} alignItems="center">
              <Avatar src={viewUser.photo_url || undefined} sx={{ width: 80, height: 80, fontSize: 32 }}>{!viewUser.photo_url ? (viewUser.display_name?.[0] || "?") : null}</Avatar>
              <Typography variant="h6">{viewUser.display_name}</Typography>
              <Chip label={viewUser.status} color={viewUser.status === "active" ? "success" : "error"} />
              <Divider flexItem />
              <Box sx={{ width: "100%", display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                {[
                  ["Email", viewUser.email],
                  ["Phone", viewUser.phone_number || "—"],
                  ["User ID", viewUser.user_id],
                  ["Roles", viewUser.roles.map((r) => r.display_name).join(", ") || "None"],
                  // Post-Sprint-20 - the address this user actually connected
                  // from at last login, so an Admin can add it to Network
                  // Access on their behalf instead of asking them to
                  // self-report it (most useful for HR Manager/Team
                  // Lead/Agent, who are the roles that get restricted there).
                  ["Last known IP", viewUser.last_login_ip || "Not seen yet"],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewUser(null)}>Close</Button></DialogActions>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit — {editUser?.display_name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Full name" fullWidth value={editForm.displayName} onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))} />
            <TextField label="Phone number" fullWidth value={editForm.phoneNumber} onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))} />
            <TextField label="Status" select fullWidth value={editForm.accountStatusCode} onChange={(e) => setEditForm((p) => ({ ...p, accountStatusCode: e.target.value }))}>
              {["active", "suspended", "pending_verification"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField label="New password (blank = no change)" fullWidth value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} />
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar src={editPhotoPreview || undefined} sx={{ width: 48, height: 48, cursor: "pointer", border: "2px dashed", borderColor: "primary.light" }} onClick={() => editPhotoRef.current?.click()} />
              <Stack>
                <Typography variant="caption" color="text.secondary">Profile photo</Typography>
                <Button size="small" variant="text" sx={{ p: 0 }} onClick={() => editPhotoRef.current?.click()}>Change photo</Button>
              </Stack>
              <input ref={editPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setEditForm((p) => ({ ...p, photo: f })); setEditPhotoPreview(URL.createObjectURL(f)); } }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography>This will deactivate <strong>{deleteUser?.display_name}</strong>. They will no longer be able to log in.</Typography>
            <TextField label={`Type "${deleteUser?.display_name}" to confirm`} fullWidth value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUser(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteConfirm !== deleteUser?.display_name} onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* FIRST NETWORK ENTRY WARNING */}
      <Dialog open={pendingNetworkSubmit} onClose={() => setPendingNetworkSubmit(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Turn on IP restriction for Agents?</DialogTitle>
        <DialogContent dividers>
          <Typography>
            This tenant has no network restrictions yet, so Agents can currently sign in from anywhere. Adding this
            entry turns restriction <strong>on immediately</strong>: any Agent not connecting from an allowed
            network — including one already signed in elsewhere right now — will be blocked on their very next
            request.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingNetworkSubmit(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleConfirmFirstNetwork}>Add anyway</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE NETWORK DIALOG */}
      <Dialog open={!!deleteNetwork} onClose={() => setDeleteNetwork(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Network Entry</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Remove <strong>{deleteNetwork?.label}</strong> ({deleteNetwork?.cidr})? Agents connecting from this
            range will no longer be allowed once removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteNetwork(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteNetwork}>Remove</Button>
        </DialogActions>
      </Dialog>

      <UpgradeRequiredModal
        open={!!upgradeModalReason}
        onClose={() => setUpgradeModalReason(null)}
        reasonCode={upgradeModalReason}
      />
    </Stack>
  );
}

export default TenantAdminDashboard;