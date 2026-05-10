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

  return { campaigns, loading, error, reload };
}
