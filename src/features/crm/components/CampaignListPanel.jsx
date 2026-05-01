import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MdAdd } from "react-icons/md";

import { fetchCampaigns } from "../services/campaignService";

function CampaignListPanel({ accessToken, onCreateClick }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMessage("");
    fetchCampaigns(accessToken)
      .then((items) => { if (active) setCampaigns(items); })
      .catch((err) => { if (active) setErrorMessage(err.message || "Unable to load campaigns."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Campaigns</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<MdAdd />}
          onClick={onCreateClick}
        >
          New Campaign
        </Button>
      </Stack>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Card sx={{ border: "1px solid #ead8c4" }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={32} />
            </Box>
          ) : campaigns.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography color="text.secondary">
                No campaigns yet. Click <strong>New Campaign</strong> to create one.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Fields</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const schemaFields = Array.isArray(campaign.schema_json)
                      ? campaign.schema_json
                      : [];
                    const createdAt = campaign.created_at
                      ? new Date(campaign.created_at).toLocaleDateString()
                      : "—";
                    return (
                      <TableRow key={campaign.id ?? campaign.campaign_id ?? campaign.name} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {campaign.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {schemaFields.length === 0 ? (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            ) : (
                              schemaFields.slice(0, 5).map((f) => (
                                <Chip
                                  key={f.key}
                                  label={f.label || f.key}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: 11 }}
                                />
                              ))
                            )}
                            {schemaFields.length > 5 && (
                              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                                +{schemaFields.length - 5} more
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {createdAt}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default CampaignListPanel;
