import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, CssBaseline } from "@mui/material";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import theme from "./theme";
import "./styles.css";

// Public-website foundation (PUBLIC_WEBSITE_SITEMAP.md Phase 3, Step 1) -
// HelmetProvider lets each public page set its own <title>/meta
// description/canonical/OpenGraph tags (SeoHead.jsx) instead of the one
// static <title> index.html previously shipped for every route. Purely
// additive - CRM routes/pages are untouched and simply don't render a
// SeoHead of their own.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
