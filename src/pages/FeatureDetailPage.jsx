import { Navigate, useParams } from "react-router-dom";

import FeaturePageTemplate from "../components/FeaturePageTemplate";
import { getFeatureBySlug } from "../data/featuresData";

// Public-website Phase 3, Step 3. One route (/features/:slug in App.jsx)
// for all 10 feature pages - see featuresData.js for why a shared
// template beats 10 near-duplicate files. An unknown slug redirects to
// the hub rather than rendering a broken page.
function FeatureDetailPage() {
  const { slug } = useParams();
  const feature = getFeatureBySlug(slug);

  if (!feature) {
    return <Navigate to="/features" replace />;
  }

  return <FeaturePageTemplate feature={feature} />;
}

export default FeatureDetailPage;
