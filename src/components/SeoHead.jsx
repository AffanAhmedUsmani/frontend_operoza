import { Helmet } from "react-helmet-async";

const SITE_NAME = "Operoza";
// www.operoza.com is the real canonical domain in production - Vercel
// redirects the bare operoza.com to it (confirmed live: 307/308 to
// https://www.operoza.com/, which alone returns 200). Every canonical/
// OG/Twitter URL this component builds must point at the domain that
// actually serves content, not the one that just redirects to it -
// Google Search Console flagged exactly this mismatch ("Page with
// redirect") when the sitemap still listed the bare-domain URLs.
const SITE_URL = "https://www.operoza.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Public-website foundation (PUBLIC_WEBSITE_SITEMAP.md Phase 3, Step 1).
 *
 * Every public marketing page renders exactly one of these, once, with
 * its own real title/description/canonical - replacing the single
 * static <title> index.html previously shipped for every route
 * (PUBLIC_WEBSITE_AUDIT.md §2). CRM pages never render this component;
 * they're excluded from robots.txt/sitemap.xml entirely and don't need
 * per-route SEO metadata.
 *
 * `path` is the route's own path (e.g. "/", "/pricing") - used to build
 * the canonical URL and, implicitly, must match an entry in
 * public/sitemap.xml once the page is real (enforced by convention, not
 * code - see that file's own header comment).
 */
export default function SeoHead({ title, description, path, noindex = false, image }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — The CRM Built Around BPO Campaigns`;
  const canonicalUrl = `${SITE_URL}${path || "/"}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description ? <meta name="description" content={description} /> : null}
      <link rel="canonical" href={canonicalUrl} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}

      <meta property="og:title" content={fullTitle} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
