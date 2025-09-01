import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiPaper:  { styleOverrides: { root: { borderRadius: 14 } } }
  },
  palette: {
    mode: "light",
    primary: { main: "#6C47FF" },
    secondary: { main: "#00C2A8" },
    background: { default: "#fafafa" }
  }
});

export default theme;
