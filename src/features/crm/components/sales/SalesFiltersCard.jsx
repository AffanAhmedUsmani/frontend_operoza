import { Box, Button, Card, CardContent, MenuItem, TextField } from "@mui/material";

export default function SalesFiltersCard({ filters, setFilters, campaigns, users, saleStatuses, dynamicFields, onApply, canFilterByAgent }) {
  return (
    <Card sx={{ border: "1px solid #ead8c4" }}>
      <CardContent>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" },
          }}
        >
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Lead name or email"
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
            <TextField
              fullWidth
              select
              label="Campaign"
              value={filters.campaignId}
              onChange={(e) => setFilters((p) => ({ ...p, campaignId: e.target.value, fieldKey: "", fieldValue: "" }))}
            >
              <MenuItem value="">All campaigns</MenuItem>
              {campaigns.map((c) => (
                <MenuItem key={c.campaign_id} value={c.campaign_id}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Box>
          {canFilterByAgent ? (
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField
                fullWidth
                select
                label="Agent"
                value={filters.agentUserId}
                onChange={(e) => setFilters((p) => ({ ...p, agentUserId: e.target.value }))}
              >
                <MenuItem value="">All agents</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.user_id} value={u.user_id}>{u.display_name || u.email || u.email_address}</MenuItem>
                ))}
              </TextField>
            </Box>
          ) : null}
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.statusCode}
              onChange={(e) => setFilters((p) => ({ ...p, statusCode: e.target.value }))}
            >
              <MenuItem value="">All statuses</MenuItem>
              {saleStatuses.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
            <Button variant="outlined" onClick={onApply} fullWidth sx={{ height: "100%" }}>Apply Filters</Button>
          </Box>

          {dynamicFields.length > 0 && (
            <>
              <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
                <TextField
                  fullWidth
                  select
                  label="Campaign field"
                  value={filters.fieldKey}
                  onChange={(e) => setFilters((p) => ({ ...p, fieldKey: e.target.value }))}
                >
                  <MenuItem value="">None</MenuItem>
                  {dynamicFields.map((f) => (
                    <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
                <TextField
                  fullWidth
                  label="Field value"
                  value={filters.fieldValue}
                  onChange={(e) => setFilters((p) => ({ ...p, fieldValue: e.target.value }))}
                  disabled={!filters.fieldKey}
                />
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
