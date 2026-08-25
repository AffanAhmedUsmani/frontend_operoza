// Public-website illustration set, hosted on Cloudinary (folder
// operoza/storefront_illustrations, cloud djgcwyzih). Cloudinary
// resolves a delivery URL without an explicit version segment to the
// latest upload for that public_id, so these stay stable without
// tracking version numbers here.
//
// All 24 are background-removed, transparent PNGs - 20 from the user's
// own bg_rm_pictures batch, plus 4 (homepageHero, pricingPage,
// messagingNotifications, retentionCampaign) that batch didn't cover,
// background-removed here via a flood-fill from every border pixel
// (all 4 sat on a solid near-white canvas, same as the other 20 before
// removal). Cloudinary's URL extension is a delivery-format request,
// not a literal stored filename - requesting ".jpg" for a PNG asset
// would silently flatten its transparency onto a solid background, so
// every entry below must stay ".png" to match what was actually
// uploaded.
const CLOUDINARY_BASE = "https://res.cloudinary.com/djgcwyzih/image/upload/operoza/storefront_illustrations";

function url(filename) {
  return `${CLOUDINARY_BASE}/${filename}`;
}

// Standalone hero/section images - one each, not keyed by a page's own
// data array.
export const ILLUSTRATIONS = {
  homepageHero: url("homepage_hero.png"),
  homepageDataTrust: url("homepage_data_trust.png"),
  featuresHub: url("features_hub.png"),
  campaignsHub: url("campaigns_hub.png"),
  pricingPage: url("pricing_page.png"),
  contactPage: url("contact_page.png"),
  notFound: url("404_empty_state.png"),
};

// Keyed by featuresData.js's own `slug` - one real illustration per
// /features/:slug page.
export const FEATURE_ILLUSTRATIONS = {
  "campaign-management": url("campaign_management.png"),
  "sales-leads": url("leads_and_sale.png"),
  "call-analysis": url("call_analysis.png"),
  "attendance-workforce": url("attendance_and_workorce.png"),
  "payroll-commission": url("Payroll_Commission.png"),
  "dashboards-reports": url("dashboards_and_reports.png"),
  "client-portal": url("client_portals.png"),
  "messaging-notifications": url("messaging_and_notifications.png"),
  branding: url("branding.png"),
  "data-export": url("feature_data_export.png"),
};

// Keyed by campaignsData.js's own `slug` - medical/auto/burial insurance
// deliberately share one illustration (insurance_campaigns.png), as do
// customer-support/tech-support (customer_tech_support.png), matching
// how the original prompt set paired them (same visual language,
// distinct enough field/workflow copy per page already).
export const CAMPAIGN_ILLUSTRATIONS = {
  "medical-insurance": url("insurance_campaigns.png"),
  "auto-insurance": url("insurance_campaigns.png"),
  "burial-insurance": url("insurance_campaigns.png"),
  "solar-sales": url("solar_sales_campaign.png"),
  "real-estate-leads": url("real.png"),
  "customer-support": url("customer_tech_support.png"),
  "tech-support": url("customer_tech_support.png"),
  "debt-collection": url("debt_collection.png"),
  "appointment-setting": url("appointment_setting.png"),
  "retention-campaign": url("retention_campaign.png"),
};
