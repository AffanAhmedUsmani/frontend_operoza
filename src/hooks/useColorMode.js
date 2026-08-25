import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "operoza.color-mode";

/**
 * Post-Sprint-20 - "light and dark mode that shift colors for the mode
 * that is selected." A per-browser viewer preference (not a tenant
 * setting - the tenant's four brand colors are the same in both modes,
 * see theme.js), remembered across the login screen and the portal
 * since both read/write the same localStorage key.
 */
function readStoredMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch (_) {
    return "light";
  }
}

export function useColorMode() {
  const [mode, setMode] = useState(readStoredMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {
      // best-effort - a private/blocked storage context just won't persist
    }
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { mode, toggleMode };
}
