import { Box, Button, Card, CardContent, Chip, Container, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { BsCalendar3 } from "react-icons/bs";
import { Link } from "react-router-dom";

import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";

const demoCovers = [
  "Setting up a campaign from a template for your specific vertical",
  "How agents work leads day to day",
  "Call analysis, if audio recording is part of your workflow",
  "Payroll and commission, including multi-currency if it applies to you",
  "Dashboards and reports your team and clients would actually see",
];

function DemoPage() {
  return (
    <PublicLayout>
      <SeoHead
        path="/demo"
        title="Book a Demo"
        description="Book a walkthrough of Operoza built around your own campaign type - what a real setup looks like for your team, not a generic tour."
      />
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Stack spacing={1.5} sx={{ mb: 4, textAlign: "center", alignItems: "center" }} className="fade-up">
          <Chip label="Demo" color="secondary" />
          <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.6rem" } }}>
            Book a Walkthrough
          </Typography>
          <Typography variant="h6" component="p" color="text.secondary" fontWeight={400}>
            20 minutes, built around your own campaign type - not a generic tour.
          </Typography>
        </Stack>

        <Card className="fade-up" sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>What we'll cover</Typography>
            <List dense>
              {demoCovers.map((item) => (
                <ListItem key={item} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleRoundedIcon color="secondary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<BsCalendar3 />}
            href="https://calendar.app.google/zJDy2SHqMMjKko427"
            target="_blank"
            rel="noreferrer"
          >
            Book Meeting
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Would rather explore on your own first?{" "}
            <Box component={Link} to="/start" sx={{ color: "primary.main", fontWeight: 700 }}>
              Start a free workspace
            </Box>
            .
          </Typography>
        </Box>
      </Container>
    </PublicLayout>
  );
}

export default DemoPage;
