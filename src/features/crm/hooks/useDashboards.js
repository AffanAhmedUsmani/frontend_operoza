import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDashboard,
  deleteDashboard,
  fetchDashboardData,
  fetchDashboards,
  updateDashboard,
} from "../services/dashboardService";

/**
 * useDashboards
 *
 * Manages dashboard list + per-dashboard data loading.
 * Keeps loading, error, and stale-data state separate so the UI can render
 * skeleton states correctly.
 */
export function useDashboards(accessToken, { campaignId } = {}) {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const items = await fetchDashboards(accessToken, { campaignId });
      setDashboards(items);
    } catch (err) {
      setError(err.message || "Failed to load dashboards");
    } finally {
      setLoading(false);
    }
  }, [accessToken, campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (payload) => {
      const created = await createDashboard(accessToken, payload);
      setDashboards((prev) => [created, ...prev]);
      return created;
    },
    [accessToken]
  );

  const update = useCallback(
    async (dashboardId, payload) => {
      const updated = await updateDashboard(accessToken, dashboardId, payload);
      setDashboards((prev) => prev.map((d) => (d.dashboard_id === dashboardId ? updated : d)));
      return updated;
    },
    [accessToken]
  );

  const remove = useCallback(
    async (dashboardId) => {
      await deleteDashboard(accessToken, dashboardId);
      setDashboards((prev) => prev.filter((d) => d.dashboard_id !== dashboardId));
    },
    [accessToken]
  );

  return { dashboards, loading, error, reload: load, create, update, remove };
}

/**
 * useDashboardData
 *
 * Loads computed widget results for one dashboard.
 * Re-fetches when dashboardId, dateFrom, or dateTo changes.
 */
export function useDashboardData(accessToken, dashboardId, { dateFrom, dateTo } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!accessToken || !dashboardId) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData(accessToken, dashboardId, { dateFrom, dateTo });
      setData(result);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, dashboardId, dateFrom, dateTo]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { data, loading, error, reload: load };
}
