import { useMemo } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MdEmojiEvents } from "react-icons/md";
import { useTheme } from "@mui/material/styles";

const RANK_COLORS = {
  1: "#FFD700",  // Gold
  2: "#C0C0C0",  // Silver
  3: "#CD7F32",  // Bronze
};

/**
 * LeaderboardWidget — Ranks agents by performance metric.
 * Primacy: top performers first (Jakob's Law).
 * Single responsibility: render leaderboard ranking.
 * Progressive disclosure: limit to 10, bounded 1-50 server-side.
 */
export function LeaderboardWidget({ widget, actorUserId }) {
  const theme = useTheme();
  if (widget.error) {
    return <Alert severity="warning" sx={{ mt: 1 }}>{widget.error}</Alert>;
  }

  if (!widget.leaderboard || widget.leaderboard.length === 0) {
    return <Typography variant="body2" color="text.secondary">No leaderboard data available</Typography>;
  }

  const rows = useMemo(() => {
    return widget.leaderboard.map((row) => ({
      ...row,
      initials: (row.agent_name || "A").split(" ").map((n) => n[0]).join("").slice(0, 2),
    }));
  }, [widget.leaderboard]);

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "text.secondary" }}>
          Performance Ranking
        </Typography>
        <Chip
          label={`${widget.shown || 0} of ${widget.total_agents || 0}`}
          size="small"
          sx={{ bgcolor: "brand.subtle", color: "primary.dark", fontWeight: 700, fontSize: "0.65rem", height: 18 }}
        />
      </Box>

      {/* Primacy: top performers first; miller's law: bounded to shown count */}
      <TableContainer sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider", maxHeight: 300, overflowY: "auto" }}>
        <Table size="small" stickyHeader aria-label="Agent performance leaderboard">
          <TableHead>
            <TableRow sx={{ bgcolor: "brand.subtle" }}>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.72rem", width: 32 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Agent</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isCurrent = row.is_current_user;
              const rankColor = RANK_COLORS[row.rank] || theme.palette.text.disabled;
              return (
                <TableRow
                  key={row.agent_id}
                  sx={{
                    bgcolor: isCurrent ? "action.selected" : "transparent",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  aria-label={`Rank ${row.rank}: ${row.agent_name} with score ${row.value}`}
                >
                  <TableCell align="center" sx={{ fontSize: "0.78rem", fontWeight: 700 }}>
                    {row.rank <= 3 ? (
                      <Box sx={{ display: "flex", justifyContent: "center", color: rankColor, fontSize: 18 }}>
                        <MdEmojiEvents />
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{row.rank}</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: "primary.light",
                          color: "primary.dark",
                        }}
                      >
                        {row.initials}
                      </Avatar>
                      <Stack spacing={0}>
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>{row.agent_name}</Typography>
                        {isCurrent && (
                          <Chip label="You" size="small" sx={{ width: 40, height: 16, fontSize: "0.6rem" }} />
                        )}
                      </Stack>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 700, color: "primary.main" }}>
                    {row.value}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Recency cue: if there are more agents, hint at it */}
      {widget.shown < widget.total_agents && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", fontStyle: "italic" }}>
          Showing top {widget.shown} of {widget.total_agents} agents
        </Typography>
      )}
    </Stack>
  );
}

export default LeaderboardWidget;
