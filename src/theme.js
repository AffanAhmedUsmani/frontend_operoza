import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#c05314",
      dark: "#8f3a11",
      light: "#f58a3c",
    },
    secondary: {
      main: "#0f8a7a",
      dark: "#0b6458",
      light: "#45b8ab",
    },
    background: {
      default: "#f7f4ee",
      paper: "#fffdf8",
    },
    text: {
      primary: "#1d1813",
      secondary: "#54493f",
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    h3: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 18,
  },
});

export default theme;
