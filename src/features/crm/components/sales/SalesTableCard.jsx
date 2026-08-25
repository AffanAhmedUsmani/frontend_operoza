import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MdDelete, MdEdit, MdEventNote, MdInsights, MdVisibility } from "react-icons/md";
import { normalizeRole, SALES_MANAGER_ROLES } from "./salesFormUtils";

export default function SalesTableCard({
  loading,
  sales,
  users,
  actorRole,
  getAnalysisCount,
  onOpenAnalysis,
  onOpenView,
  onOpenEdit,
  onDelete,
  onCreateFollowUp,
}) {
  const normalizedRole = normalizeRole(actorRole || "");
  const canManage = SALES_MANAGER_ROLES.has(normalizedRole);
  const canEditSales = canManage;
  const canDeleteSales = canManage;
  const showAgentColumn = canManage;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [sales.length]);

  const visibleSales = sales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 3 }}><Typography color="text.secondary">Loading sales...</Typography></Box>
        ) : sales.length === 0 ? (
          <Box sx={{ p: 3 }}><Typography color="text.secondary">No sales found.</Typography></Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    {showAgentColumn ? <TableCell>Agent</TableCell> : null}
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">View</TableCell>
                    <TableCell align="center">Analysis</TableCell>
                    {canEditSales ? <TableCell align="center">Edit</TableCell> : null}
                    {canDeleteSales ? <TableCell align="center">Delete</TableCell> : null}
                    <TableCell align="center">Follow-Up</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleSales.map((sale) => (
                    <TableRow key={sale.sale_id} hover>
                      <TableCell>{sale.campaign_name || "-"}</TableCell>
                      {showAgentColumn ? (
                        <TableCell>
                          {users.find((u) => String(u.user_id) === String(sale.agent_user_id))?.display_name
                            || sale.agent_display_name
                            || "Unknown Agent"}
                        </TableCell>
                      ) : null}
                      <TableCell><Chip size="small" label={sale.status_code} /></TableCell>
                      <TableCell>{sale.sold_at ? new Date(sale.sold_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View sale">
                          <IconButton size="small" color="primary" onClick={() => onOpenView(sale)}>
                            <MdVisibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Audio Analysis">
                          <span>
                            <IconButton size="small" color="secondary" onClick={() => onOpenAnalysis(sale)} disabled={getAnalysisCount(sale) === 0}>
                              <MdInsights />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                      {canEditSales ? (
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => onOpenEdit(sale)}>
                              <MdEdit />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      ) : null}
                      {canDeleteSales ? (
                        <TableCell align="center">
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => onDelete(sale)}>
                              <MdDelete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      ) : null}
                      <TableCell align="center">
                        {sale.campaign_follow_up_enabled ? (
                          <Tooltip title="Create Follow-Up">
                            <IconButton size="small" color="primary" onClick={() => onCreateFollowUp(sale)}>
                              <MdEventNote />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={sales.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
