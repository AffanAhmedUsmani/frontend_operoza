import { Component } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

/**
 * Sprint 8 (docs/SPRINT_PLAN.md), ENGINEERING_STANDARDS.md §5 - a
 * top-level React error boundary. Confirmed none existed anywhere in the
 * app before this: an uncaught render exception in any panel produced a
 * blank white screen with no recovery path. React error boundaries must
 * be class components - there is no hook equivalent.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Unhandled render error caught by ErrorBoundary:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", p: 3 }}>
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, textAlign: "center" }}>
            <Typography variant="h5">Something went wrong</Typography>
            <Typography color="text.secondary">
              This screen hit an unexpected error. Reloading usually fixes it - if it keeps
              happening, contact your administrator.
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>Reload</Button>
          </Stack>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
