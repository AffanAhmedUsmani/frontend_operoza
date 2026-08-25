import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { MdAdd } from "react-icons/md";
import { fetchTenantUsers } from "../services/adminService";
import { fetchCampaigns, uploadCampaignAudio } from "../services/campaignService";
import { createSale, deleteSale, fetchSales, updateSale } from "../services/salesService";
import CreateFollowUpDialog from "./sales/CreateFollowUpDialog";
import SaleAnalysisDialog from "./sales/SaleAnalysisDialog";
import SaleEditorDialog from "./sales/SaleEditorDialog";
import SalesFiltersCard from "./sales/SalesFiltersCard";
import SalesTableCard from "./sales/SalesTableCard";
import {
  buildPayloadDefaults,
  deriveAmount,
  deriveEmail,
  deriveLeadName,
  derivePhone,
  filterSchemaForRole,
  normalizeField,
  resolveActorContext,
  SALES_MANAGER_ROLES,
  toLocalInputDateTime,
} from "./sales/salesFormUtils";

const SALE_STATUSES = ["new", "qualified", "won", "lost", "refunded", "cancelled"];

const EMPTY_FORM = {
  campaign_id: "",
  agent_user_id: "",
  payload_json: {},
};

export default function SalesPanel({ accessToken }) {
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    campaignId: "",
    agentUserId: "",
    statusCode: "",
    fieldKey: "",
    fieldValue: "",
  });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [viewingSale, setViewingSale] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisSale, setAnalysisSale] = useState(null);
  const [followUpTargetSale, setFollowUpTargetSale] = useState(null);
  const [pendingAudioFiles, setPendingAudioFiles] = useState({});

  const actorContext = useMemo(() => resolveActorContext(accessToken), [accessToken]);
  const actorRole = actorContext.role;
  const actorUserId = actorContext.userId;
  const isAdmin = SALES_MANAGER_ROLES.has(actorRole);
  const isReadOnlyClient = actorRole === "client";

  const selectedFormCampaign = useMemo(
    () => campaigns.find((c) => String(c.campaign_id) === String(form.campaign_id)),
    [campaigns, form.campaign_id]
  );

  const formSchema = useMemo(() => {
    const schema = Array.isArray(selectedFormCampaign?.schema_json) ? selectedFormCampaign.schema_json : [];
    const normalized = schema.map(normalizeField).filter((field) => field.key && field.label);
    return filterSchemaForRole(normalized, actorRole);
  }, [selectedFormCampaign, actorRole]);

  const dialogSchema = useMemo(() => {
    if (formSchema.length > 0) {
      return formSchema;
    }

    if (!viewingSale || !viewingSale.payload_json || typeof viewingSale.payload_json !== "object") {
      return formSchema;
    }

    return Object.keys(viewingSale.payload_json).map((key) => ({
      key,
      label: key
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      type: typeof viewingSale.payload_json[key] === "number" ? "number" : "text",
      required: false,
      options: [],
      visibility: [],
    }));
  }, [formSchema, viewingSale]);

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => String(c.campaign_id) === String(filters.campaignId)),
    [campaigns, filters.campaignId]
  );

  const selectedCampaignAgentUsers = useMemo(() => {
    if (!isAdmin) {
      return [];
    }
    if (!selectedCampaign) {
      return users;
    }
    const assignedIds = new Set(
      Array.isArray(selectedCampaign.assigned_users)
        ? selectedCampaign.assigned_users.map((item) => String(item.user_id))
        : []
    );
    if (assignedIds.size === 0) {
      return [];
    }
    return users.filter((user) => assignedIds.has(String(user.user_id)));
  }, [isAdmin, selectedCampaign, users]);

  const selectedFormAgentUsers = useMemo(() => {
    if (!isAdmin) {
      return [];
    }
    if (!selectedFormCampaign) {
      return users;
    }
    const assignedIds = new Set(
      Array.isArray(selectedFormCampaign.assigned_users)
        ? selectedFormCampaign.assigned_users.map((item) => String(item.user_id))
        : []
    );
    if (assignedIds.size === 0) {
      return [];
    }
    return users.filter((user) => assignedIds.has(String(user.user_id)));
  }, [isAdmin, selectedFormCampaign, users]);

  const dynamicFields = useMemo(() => {
    const schema = Array.isArray(selectedCampaign?.schema_json) ? selectedCampaign.schema_json : [];
    const normalized = schema.map(normalizeField).filter((f) => f?.key && f?.label);
    return filterSchemaForRole(normalized, actorRole).slice(0, 20);
  }, [selectedCampaign, actorRole]);

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const [salesItems, campaignItems] = await Promise.all([
        fetchSales(accessToken, filters),
        fetchCampaigns(accessToken),
      ]);

      let userItems = [];
      if (isAdmin) {
        try {
          userItems = await fetchTenantUsers(accessToken);
        } catch {
          userItems = [];
        }
      }

      setSales(salesItems);
      setUsers(userItems);
      setCampaigns(campaignItems);
    } catch (err) {
      setError(err.message || "Failed to load sales.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilters = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const salesItems = await fetchSales(accessToken, filters);
      setSales(salesItems);
    } catch (err) {
      setError(err.message || "Failed to filter sales.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    if (isReadOnlyClient) {
      setError("Client role is read-only. Sale creation is not allowed.");
      return;
    }
    const defaultCampaignId =
      filters.campaignId ||
      (campaigns.length > 0 ? String(campaigns[0].campaign_id) : "");

    const selectedCampaign = campaigns.find((c) => String(c.campaign_id) === String(defaultCampaignId));
    const selectedSchema = (Array.isArray(selectedCampaign?.schema_json) ? selectedCampaign.schema_json : [])
      .map(normalizeField)
      .filter((field) => field.key && field.label);
    const visibleSchema = filterSchemaForRole(selectedSchema, actorRole);

    setViewingSale(null);
    setEditingSale(null);
    setForm({
      ...EMPTY_FORM,
      campaign_id: defaultCampaignId,
      agent_user_id: isAdmin ? (filters.agentUserId || "") : actorUserId,
      payload_json: buildPayloadDefaults(visibleSchema),
    });
    setPendingAudioFiles({});
    setEditorOpen(true);
  };

  const openEdit = (sale) => {
    if (isReadOnlyClient) {
      setError("Client role is read-only. Sale updates are not allowed.");
      return;
    }
    setViewingSale(null);
    setEditingSale(sale);
    setForm({
      campaign_id: sale.campaign_id,
      agent_user_id: sale.agent_user_id,
      status_code: sale.status_code || "new",
      sold_at: toLocalInputDateTime(sale.sold_at),
      payload_json: sale.payload_json && typeof sale.payload_json === "object" ? sale.payload_json : {},
    });
    setPendingAudioFiles({});
    setEditorOpen(true);
  };

  const openView = (sale) => {
    setViewingSale(sale);
    setEditingSale(sale);
    setForm({
      campaign_id: sale.campaign_id,
      agent_user_id: sale.agent_user_id,
      status_code: sale.status_code || "new",
      sold_at: toLocalInputDateTime(sale.sold_at),
      payload_json: sale.payload_json && typeof sale.payload_json === "object" ? sale.payload_json : {},
    });
    setPendingAudioFiles({});
    setEditorOpen(true);
  };

  const validateDynamicForm = () => {
    if (!form.campaign_id) {
      setError("Please select a campaign.");
      return false;
    }
    if (isAdmin && !form.agent_user_id) {
      setError("Please select an agent.");
      return false;
    }
    if (!isAdmin && !actorUserId) {
      setError("Unable to resolve current agent identity from access token.");
      return false;
    }

    const missingRequired = formSchema.find((field) => {
      if (!field.required || field.type === "audio") return false;
      const value = form.payload_json?.[field.key];
      return value === null || value === undefined || String(value).trim() === "";
    });

    if (missingRequired) {
      setError(`${missingRequired.label} is required.`);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateDynamicForm()) {
      return;
    }

    const payloadJson = form.payload_json || {};
    const leadName = deriveLeadName(payloadJson, formSchema);
    const customerEmail = deriveEmail(payloadJson);
    const customerPhone = derivePhone(payloadJson);
    const amount = deriveAmount(payloadJson);

    const payload = {
      campaign_id: form.campaign_id,
      agent_user_id: isAdmin ? form.agent_user_id : actorUserId,
      lead_name: leadName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      amount,
      payload_json: payloadJson,
    };

    setSaving(true);
    setError("");

    const queueAudioProcessing = ({ saleId, campaignId, audioEntries }) => {
      if (!saleId || !campaignId || !audioEntries.length) return;

      // Run in background after sale persistence so save/update flow is not blocked.
      Promise.resolve().then(async () => {
        const failures = [];
        for (const [fieldKey, file] of audioEntries) {
          try {
            await uploadCampaignAudio(accessToken, {
              file,
              campaignId,
              fieldKey,
              saleId,
            });
          } catch (uploadErr) {
            failures.push(`${fieldKey}: ${uploadErr?.message || "Upload failed"}`);
          }
        }

        if (failures.length > 0) {
          setError(`Sale saved, but some audio jobs failed: ${failures.join(" | ")}`);
        } else {
          await applyFilters();
        }
      });
    };

    try {
      const audioEntries = Object.entries(pendingAudioFiles).filter(([, f]) => f);

      if (editingSale) {
        const updated = await updateSale(accessToken, editingSale.sale_id, payload);
        const saleId = updated?.sale_id || updated?.sale?.sale_id || editingSale.sale_id;
        queueAudioProcessing({ saleId, campaignId: form.campaign_id, audioEntries });
      } else {
        const created = await createSale(accessToken, payload);
        const saleId = created?.sale_id || created?.sale?.sale_id;
        queueAudioProcessing({ saleId, campaignId: form.campaign_id, audioEntries });
      }

      setPendingAudioFiles({});
      setEditorOpen(false);
      await applyFilters();
    } catch (err) {
      setError(err.message || "Failed to save sale.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sale) => {
    if (isReadOnlyClient) {
      setError("Client role is read-only. Sale deletion is not allowed.");
      return;
    }
    if (!window.confirm(`Delete sale for ${sale.lead_name}?`)) return;
    setError("");
    try {
      await deleteSale(accessToken, sale.sale_id);
      await applyFilters();
    } catch (err) {
      setError(err.message || "Failed to delete sale.");
    }
  };

  const openAnalysis = (sale) => {
    setAnalysisSale(sale);
    setAnalysisOpen(true);
  };

  const getAnalysisCount = (sale) => {
    const analysis = sale?.audio_analysis_json;
    if (!analysis || typeof analysis !== "object") return 0;
    return Object.values(analysis).filter((value) => value && typeof value === "object" && value.locked).length;
  };

  const updatePayloadValue = (key, value) => {
    setForm((prev) => ({
      ...prev,
      payload_json: {
        ...(prev.payload_json || {}),
        [key]: value,
      },
    }));
  };

  const handleCampaignChange = (campaignId) => {
    const campaign = campaigns.find((item) => String(item.campaign_id) === String(campaignId));
    const schema = (Array.isArray(campaign?.schema_json) ? campaign.schema_json : [])
      .map(normalizeField)
      .filter((field) => field.key && field.label);
    const visibleSchema = filterSchemaForRole(schema, actorRole);
    setForm((prev) => ({
      ...prev,
      campaign_id: campaignId,
      payload_json: buildPayloadDefaults(visibleSchema),
    }));
  };

  const actorName = users.find((u) => String(u.user_id) === actorUserId)?.display_name || "Current agent";

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" spacing={1}>
        <Typography variant="h6">Sales</Typography>
        {!isReadOnlyClient ? (
          <Button variant="contained" startIcon={<MdAdd />} onClick={openCreate}>Add Sale</Button>
        ) : null}
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <SalesFiltersCard
        filters={filters}
        setFilters={setFilters}
        campaigns={campaigns}
        users={selectedCampaignAgentUsers}
        saleStatuses={SALE_STATUSES}
        dynamicFields={dynamicFields}
        onApply={applyFilters}
        canFilterByAgent={isAdmin}
      />

      <SalesTableCard
        loading={loading}
        sales={sales}
        users={users}
        actorRole={actorRole}
        getAnalysisCount={getAnalysisCount}
        onOpenAnalysis={openAnalysis}
        onOpenView={openView}
        onOpenEdit={openEdit}
        onDelete={handleDelete}
        onCreateFollowUp={setFollowUpTargetSale}
      />

      <CreateFollowUpDialog
        open={Boolean(followUpTargetSale)}
        sale={followUpTargetSale}
        accessToken={accessToken}
        onCreated={() => {}}
        onClose={() => setFollowUpTargetSale(null)}
      />

      <SaleEditorDialog
        open={editorOpen}
        saving={saving}
        editingSale={editingSale}
        readOnly={Boolean(viewingSale)}
        isAdmin={isAdmin}
        campaigns={campaigns}
        users={selectedFormAgentUsers}
        form={form}
        formSchema={dialogSchema}
        selectedFormCampaign={selectedFormCampaign}
        actorName={actorName}
        audioFiles={pendingAudioFiles}
        onAudioFileChange={(key, file) =>
          setPendingAudioFiles((prev) => ({ ...prev, [key]: file }))
        }
        onClose={() => {
          setEditorOpen(false);
          setViewingSale(null);
          setEditingSale(null);
        }}
        onSave={handleSave}
        onCampaignChange={handleCampaignChange}
        onSetAgent={(agentId) => setForm((prev) => ({ ...prev, agent_user_id: agentId }))}
        onUpdatePayload={updatePayloadValue}
      />

      <SaleAnalysisDialog
        open={analysisOpen}
        sale={analysisSale}
        accessToken={accessToken}
        onClose={() => setAnalysisOpen(false)}
      />
    </Stack>
  );
}
