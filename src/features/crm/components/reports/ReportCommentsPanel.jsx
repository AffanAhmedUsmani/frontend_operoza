import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createReportComment, listReportComments } from "../../services/reportingService";

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function ReportCommentsPanel({ accessToken, reportId, canComment = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    if (!accessToken || !reportId) return;
    setLoading(true);
    setError("");
    try {
      const data = await listReportComments(accessToken, reportId);
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, reportId]);

  const handleCreateComment = async () => {
    const body = String(commentText || "").trim();
    if (!body || !reportId) return;
    setSubmitting(true);
    setError("");
    try {
      await createReportComment(accessToken, reportId, { body });
      setCommentText("");
      await loadComments();
    } catch (err) {
      setError(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Comments</Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {canComment ? (
            <Stack spacing={1}>
              <TextField
                multiline
                minRows={3}
                label="Add a comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Box>
                <Button
                  variant="contained"
                  onClick={handleCreateComment}
                  disabled={submitting || !String(commentText || "").trim()}
                >
                  Post Comment
                </Button>
              </Box>
            </Stack>
          ) : (
            <Alert severity="info">You can view comments but cannot add new comments for this report.</Alert>
          )}

          <Divider />

          {loading ? <Typography color="text.secondary">Loading comments...</Typography> : null}

          {!loading && items.length === 0 ? (
            <Typography color="text.secondary">No comments yet.</Typography>
          ) : null}

          <Stack spacing={1.5}>
            {items.map((item) => (
              <Box key={item.report_comment_id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.author_display_name || item.author_email || "Unknown user"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.author_role_code ? `${item.author_role_code} • ` : ""}
                  {formatDateTime(item.created_at)}
                </Typography>
                <Typography sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>{item.body}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
