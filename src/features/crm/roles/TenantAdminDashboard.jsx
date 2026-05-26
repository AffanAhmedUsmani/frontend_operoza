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
  createTenantUser,
  fetchTenantRoles,
  fetchTenantUsers,
} from "../services/adminService";
import {
  deleteTenantUser,
  toggleTenantRole,
  updateTenantUser,
} from "../services/adminService";
import CampaignsPanel from "../components/CampaignsPanel";
import AttendancePanel from "../components/AttendancePanel";
import SalesPanel from "../components/SalesPanel";
import DashboardsPanel from "../components/dashboard/DashboardsPanel";
import ReportsPanel from "../components/reports/ReportsPanel";
import { useCampaigns } from "../hooks/useCampaigns";

function TenantAdminDashboard({ session, activeNavLabel }) {
  const accessToken = session?.accessToken;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState(0);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [newUserForm, setNewUserForm] = useState({
    displayName: "",
    email: "",
    password: "Test@1234",
    roleCode: "agent",
    phoneNumber: "",
    photo: null,
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
      "Settings": 7,
    };
    if (activeNavLabel && adminTabIndexByLabel[activeNavLabel] !== undefined) {
      setActiveTab(adminTabIndexByLabel[activeNavLabel]);
    }
  }, [activeNavLabel]);

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
      setNewUserForm((prev) => ({ ...prev, displayName: "", email: "", phoneNumber: "", photo: null }));
      setPhotoPreview(null);
      await loadData();
    } catch (error) {
      setErrorMessage(error.message || "Unable to create user.");
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
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Overview</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Tenant-wide KPIs, live activity, and campaign summaries will appear here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Users & Roles tab */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

          {/* Role catalogue with toggles */}
          <Card sx={{ border: "1px solid #ead8c4" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Available Roles</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Toggle the roles you want available for your team. Only enabled roles appear when creating users.
              </Typography>
                <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" } }}>
                {roles.map((role) => (
                    <Box key={role.role_code}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid", borderColor: role.enabled ? "#c87941" : "#e0d6cc", borderRadius: 1, px: 1.5, py: 0.5, background: role.enabled ? "#fff8f2" : "transparent" }}>
                      <Stack>
                        <Typography variant="body2" fontWeight={role.enabled ? 600 : 400}>{role.display_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{role.role_code}</Typography>
                      </Stack>
                      <Switch size="small" checked={!!role.enabled} onChange={() => handleToggleRole(role.role_code, role.enabled)} color="warning" />
                    </Box>
                    </Box>
                ))}
                </Box>
            </CardContent>
          </Card>

          {/* Create user */}
          <Card sx={{ border: "1px solid #ead8c4" }}>
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
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pt: 0.5 }}>
                      <Avatar src={photoPreview || undefined} sx={{ width: 44, height: 44, cursor: "pointer", border: "2px dashed #c87941" }} onClick={() => photoInputRef.current?.click()} />
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
          <Card sx={{ border: "1px solid #ead8c4" }}>
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
          <Card sx={{ border: "1px solid #ead8c4" }}>
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
                    <Card key={user.user_id} variant="outlined" sx={{ borderColor: "#e8d8c8" }}>
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
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Tenant configuration, billing, branding, and integrations will appear here.
            </Typography>
          </CardContent>
        </Card>
      )}

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
                {[ ["Email", viewUser.email], ["Phone", viewUser.phone_number || "—"], ["User ID", viewUser.user_id], ["Roles", viewUser.roles.map((r) => r.display_name).join(", ") || "None"]].map(([label, value]) => (
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
              <Avatar src={editPhotoPreview || undefined} sx={{ width: 48, height: 48, cursor: "pointer", border: "2px dashed #c87941" }} onClick={() => editPhotoRef.current?.click()} />
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
    </Stack>
  );
}

export default TenantAdminDashboard;