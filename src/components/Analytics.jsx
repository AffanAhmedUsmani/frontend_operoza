import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Unset in local dev/.env on purpose - GA4 only loads when Vercel provides
// a real VITE_GA_MEASUREMENT_ID at build time, so local development never
// sends pageviews to the real property.
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let gtagLoaded = false;

function loadGtag() {
  if (gtagLoaded || !GA_MEASUREMENT_ID) return;
  gtagLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // send_page_view disabled here - this is a client-side-routed SPA, so
  // gtag's own automatic pageview would only ever fire once (on the very
  // first load) and never again on navigation. Every pageview instead
  // comes from the location-based effect below, including the first one.
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    loadGtag();
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
    // This tag measures the public marketing site's traffic - not the
    // authenticated tenant CRM app's internal usage, which stays untracked
    // here deliberately.
    if (location.pathname.startsWith("/operoza/")) return;

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}
