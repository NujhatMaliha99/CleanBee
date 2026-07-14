import { createTheme } from "@mui/material/styles";

export const colors = {
  evergreen: "#05472A",
  binGreen: "#2E8B57",
  beeYellow: "#FFC94A",
  screenDark: "#123a26",
};

const theme = createTheme({
  palette: {
    primary: { main: colors.evergreen },
    secondary: { main: colors.beeYellow },
  },
});

export default theme;