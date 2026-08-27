import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";

// Public marketing pages (PUBLIC_WEBSITE_SITEMAP.md) - own layout
// (PublicLayout), own SEO metadata (SeoHead) per page. Loaded eagerly:
// these are exactly the pages real visitor traffic and search crawlers
// land on, so they belong in the main bundle, not behind a loading
// spinner.
import HomePage from "./pages/HomePage";
import StartJourneyPage from "./pages/StartJourneyPage";
import FindWorkspacePage from "./pages/FindWorkspacePage";
import FeaturesIndexPage from "./pages/FeaturesIndexPage";
import FeatureDetailPage from "./pages/FeatureDetailPage";
import CampaignsIndexPage from "./pages/CampaignsIndexPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import PricingPage from "./pages/PricingPage";
import SecurityPage from "./pages/SecurityPage";
import AboutPage from "./pages/AboutPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";
import DemoPage from "./pages/DemoPage";
import NotFoundPage from "./pages/NotFoundPage";

// CRM application pages - unaffected by the public-website work above,
// not touched beyond how (not what) they're loaded. Lazy-loaded so their
// entire dependency tree (RoleDashboardSwitch, TenantCrmLayout, and
// everything under features/crm/*) lands in its own chunk, fetched only
// when someone actually navigates to /operoza/* - not downloaded and
// parsed by every public-site visitor who never logs in.
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const TenantLoginPage = lazy(() => import("./pages/TenantLoginPage"));
const TenantPortalPage = lazy(() => import("./pages/TenantPortalPage"));

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/start" element={<StartJourneyPage />} />
        <Route path="/find-workspace" element={<FindWorkspacePage />} />
        <Route path="/features" element={<FeaturesIndexPage />} />
        <Route path="/features/:slug" element={<FeatureDetailPage />} />
        <Route path="/campaigns" element={<CampaignsIndexPage />} />
        <Route path="/campaigns/:slug" element={<CampaignDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route
          path="/operoza/:companySlug/login"
          element={
            <Suspense fallback={null}>
              <TenantLoginPage />
            </Suspense>
          }
        />
        <Route
          path="/operoza/:companySlug/forgot-password"
          element={
            <Suspense fallback={null}>
              <ForgotPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/operoza/:companySlug/portal"
          element={
            <Suspense fallback={null}>
              <TenantPortalPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
