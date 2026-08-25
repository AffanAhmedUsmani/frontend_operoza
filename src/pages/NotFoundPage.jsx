import { Button, Container, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link } from "react-router-dom";

import Illustration from "../components/Illustration";
import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";
import { ILLUSTRATIONS } from "../data/illustrations";

/**
 * The public catch-all - App.jsx's wildcard route used to silently
 * redirect any unknown path to "/", which is quiet but wrong for SEO
 * (a broken/mistyped link should 404, not look like a real, indexable
 * page at a URL that resolves to the homepage) and for a visitor who
 * just wants to know they mistyped something. `noindex` on SeoHead
 * keeps it out of search results without needing its own sitemap entry.
 */
function NotFoundPage() {
  return (
    <PublicLayout>
      <SeoHead
        path="/404"
        title="Page Not Found"
        description="This page doesn't exist on Operoza."
        noindex
      />
      <Container maxWidth="sm" sx={{ py: { xs: 7, md: 11 }, position: "relative", zIndex: 2, textAlign: "center" }}>
        <Stack spacing={3} alignItems="center" className="fade-up">
          <Illustration src={ILLUSTRATIONS.notFound} alt="A person searching with a magnifying glass next to an empty frame" maxWidth={320} />
          <Typography variant="h1" sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
            We Couldn't Find That Page
          </Typography>
          <Typography color="text.secondary">
            The link you followed may be broken, or the page may have moved. Let's get you back on track.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button component={Link} to="/" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
              Back to Home
            </Button>
            <Button component={Link} to="/find-workspace" variant="outlined" size="large">
              Find My Workspace
            </Button>
          </Stack>
        </Stack>
      </Container>
    </PublicLayout>
  );
}

export default NotFoundPage;
