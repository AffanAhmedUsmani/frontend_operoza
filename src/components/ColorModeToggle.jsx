import { IconButton, Tooltip } from "@mui/material";
import { MdDarkMode, MdLightMode } from "react-icons/md";

/** Post-Sprint-20 - the light/dark mode selector itself; see useColorMode.js. */
export default function ColorModeToggle({ mode, onToggle, sx, color = "inherit" }) {
  return (
    <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton onClick={onToggle} sx={sx} color={color} aria-label="Toggle light/dark mode">
        {mode === "dark" ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </IconButton>
    </Tooltip>
  );
}
