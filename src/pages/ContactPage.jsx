import { Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";
import { BsCalendar3 } from "react-icons/bs";
import { Link } from "react-router-dom";

import Illustration from "../components/Illustration";
import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";
import { ILLUSTRATIONS } from "../data/illustrations";

function ContactPage() {
  return (
    <PublicLayout>
      <SeoHead
        path="/contact"
        title="Contact"
        description="Message Operoza directly on WhatsApp or book a call - or just start a free workspace and configure it yourself."
      />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Grid container spacing={5} alignItems="center" sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <Stack spacing={1.5} className="fade-up">
              <Chip label="Contact" color="secondary" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
                Talk to Us Directly
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" fontWeight={400}>
                No ticket queue. Message us, book a call, or just start a free workspace yourself.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }} sx={{ display: "flex", justifyContent: "center" }} className="fade-up">
            <Illustration src={ILLUSTRATIONS.contactPage} alt="Two people mid-handshake with a calendar checkmark above them" maxWidth={240} />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card className="feature-card fade-up" sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <FaWhatsapp size={40} color="#25D366" />
                <Typography variant="h2" sx={{ mt: 1.5, mb: 1, fontSize: "1.25rem" }}>Message on WhatsApp</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Fastest way to reach us directly with a quick question.
                </Typography>
                <Button
                  variant="contained"
                  href="https://wa.link/ov814n"
                  target="_blank"
                  rel="noreferrer"
                  fullWidth
                >
                  Open WhatsApp
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card className="feature-card fade-up" sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <BsCalendar3 size={36} />
                <Typography variant="h2" sx={{ mt: 1.5, mb: 1, fontSize: "1.25rem" }}>Book a Call</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Pick a time that works for you - see our Demo page for what we'll cover.
                </Typography>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/demo"
                  fullWidth
                >
                  Go to Demo Booking
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider", mt: 3 }} className="fade-up">
          <Typography variant="h2" sx={{ mb: 1, fontSize: "1.25rem" }}>Prefer to just try it?</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Most teams start with a free workspace and configure it themselves - no call required.
          </Typography>
          <Button component={Link} to="/start" variant="contained" size="large">
            Start Free
          </Button>
        </Card>
      </Container>
    </PublicLayout>
  );
}

export default ContactPage;
