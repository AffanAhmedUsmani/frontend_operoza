import { Navigate, useParams } from "react-router-dom";

import CampaignPageTemplate from "../components/CampaignPageTemplate";
import { getCampaignBySlug } from "../data/campaignsData";

// Public-website Phase 3, Step 4. One route (/campaigns/:slug in
// App.jsx) for all 10 campaign-template pages - see campaignsData.js
// for the shared-template rationale. An unknown slug redirects to the
// hub rather than rendering a broken page.
function CampaignDetailPage() {
  const { slug } = useParams();
  const campaign = getCampaignBySlug(slug);

  if (!campaign) {
    return <Navigate to="/campaigns" replace />;
  }

  return <CampaignPageTemplate campaign={campaign} />;
}

export default CampaignDetailPage;
