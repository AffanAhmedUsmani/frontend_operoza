import { useEffect, useState } from "react";
import { Alert, Autocomplete, Box, Button, CircularProgress, LinearProgress, Snackbar, Stack, TextField, Typography } from "@mui/material";

import { fetchCurrencySettings, fetchSupportedCurrencies, updateCurrencySettings } from "../services/adminService";

/**
 * Post-Sprint-20 - Settings -> Currency. Two independent pickers, not
 * one: "Costing currency" (Tenant.default_currency_code - what a new
 * Campaign defaults to, and what cross-campaign totals display in) and
 * "Payroll currency" (Tenant.payroll_currency_code - what salaries are
 * paid in). A campaign can still be given its own different currency in
 * Campaign Builder; commission/deductions convert automatically between
 * whatever currency a campaign's sales are in and whatever currency an
 * employee's salary is in (billing/currency.py's CurrencyService, backed
 * by the free Frankfurter FX API) - this panel is only the two
 * tenant-wide defaults, not a currency-per-campaign editor.
 */
export default function TenantCurrencyPanel({ accessToken }) {
  const [currencies, setCurrencies] = useState([]);
  const [defaultCurrency, setDefaultCurrency] = useState(null);
  const [payrollCurrency, setPayrollCurrency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchSupportedCurrencies(accessToken), fetchCurrencySettings(accessToken)])
      .then(([currencyList, settings]) => {
        if (cancelled) return;
        setCurrencies(currencyList);
        const findByCode = (code) => currencyList.find((c) => c.code === code) || { code, name: code };
        setDefaultCurrency(findByCode(settings.default_currency_code));
        setPayrollCurrency(findByCode(settings.payroll_currency_code));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load currency settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateCurrencySettings(accessToken, {
        defaultCurrencyCode: defaultCurrency?.code,
        payrollCurrencyCode: payrollCurrency?.code,
      });
      setSavedMessage("Currency settings saved");
    } catch (err) {
      setError(err.message || "Failed to save currency settings.");
    } finally {
      setSaving(false);
    }
  };

  const currencyOptionLabel = (option) => (option ? `${option.code} — ${option.name}` : "");

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Set this workspace's costing currency (what a new campaign defaults to, and what
        cross-campaign totals display in) and payroll currency (what salaries are paid in). A
        campaign can still be given its own different currency in Campaign Builder — sales and
        commission convert automatically between currencies using live exchange rates.
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <LinearProgress sx={{ borderRadius: 4 }} /> : null}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <Autocomplete
          options={currencies}
          value={defaultCurrency}
          onChange={(_e, value) => setDefaultCurrency(value)}
          getOptionLabel={currencyOptionLabel}
          isOptionEqualToValue={(option, value) => option.code === value.code}
          renderInput={(params) => <TextField {...params} label="Costing currency" helperText="New campaigns default to this" />}
        />
        <Autocomplete
          options={currencies}
          value={payrollCurrency}
          onChange={(_e, value) => setPayrollCurrency(value)}
          getOptionLabel={currencyOptionLabel}
          isOptionEqualToValue={(option, value) => option.code === value.code}
          renderInput={(params) => <TextField {...params} label="Payroll currency" helperText="What salaries are paid in" />}
        />
      </Box>

      <Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !defaultCurrency || !payrollCurrency}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {saving ? "Saving..." : "Save Currency Settings"}
        </Button>
      </Box>

      <Snackbar open={Boolean(savedMessage)} autoHideDuration={3000} onClose={() => setSavedMessage("")} message={savedMessage} />
    </Stack>
  );
}
