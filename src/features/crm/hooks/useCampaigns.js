import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCampaigns } from "../services/campaignService";

export function useCampaigns(accessToken) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await fetchCampaigns(accessToken);
      setCampaigns(items);
    } catch (err) {
      setError(err.message || "Unable to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      reload();
    }
  }, [reload]);

  // Sprint 8 (docs/SPRINT_PLAN.md): patches one campaign's fields into
  // the existing list in place, instead of the caller re-fetching the
  // whole list (a visible full-list flash/reload) for what is really a
  // single-row update - used after an edit-settings save, which already
  // gets the updated campaign back in the API response.
  const patchCampaign = useCallback((updatedCampaign) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.campaign_id === updatedCampaign.campaign_id ? updatedCampaign : c))
    );
  }, []);

  return { campaigns, loading, error, reload, patchCampaign };
}
