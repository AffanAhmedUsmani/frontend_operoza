import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import StartJourneyPage from "./pages/StartJourneyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import TenantLoginPage from "./pages/TenantLoginPage";
import TenantPortalPage from "./pages/TenantPortalPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start" element={<StartJourneyPage />} />
      <Route path="/operoza/:companySlug/login" element={<TenantLoginPage />} />
      <Route path="/operoza/:companySlug/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/operoza/:companySlug/portal" element={<TenantPortalPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
