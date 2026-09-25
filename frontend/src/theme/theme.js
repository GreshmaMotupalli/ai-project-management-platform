import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      dark: "#1565c0",
      light: "#e8f1ff",
      contrastText: "#ffffff",
    },

    secondary: {
      main: "#5e35b1",
      dark: "#4527a0",
      light: "#eeeafd",
      contrastText: "#ffffff",
    },

    background: {
      default: "#f4f6fa",
      paper: "#ffffff",
    },

    text: {
      primary: "#172033",
      secondary: "#667085",
      disabled: "#98a2b3",
    },

    success: {
      main: "#2e7d32",
      light: "#e9f7ef",
    },

    error: {
      main: "#d32f2f",
      light: "#fff0f0",
    },

    warning: {
      main: "#ed6c02",
      light: "#fff4e5",
    },

    info: {
      main: "#0288d1",
      light: "#e8f4fd",
    },

    divider: "#e5e9f2",
  },

  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),

    h1: {
      fontWeight: 700,
      letterSpacing: "-0.8px",
    },

    h2: {
      fontWeight: 700,
      letterSpacing: "-0.7px",
    },

    h3: {
      fontWeight: 700,
      letterSpacing: "-0.6px",
    },

    h4: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },

    body2: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },

    button: {
      fontWeight: 600,
      textTransform: "none",
    },

    caption: {
      fontSize: "0.8rem",
    },
  },

  shape: {
    borderRadius: 10,
  },

  shadows: [
    "none",
    "0 1px 3px rgba(16, 24, 40, 0.06)",
    "0 2px 8px rgba(16, 24, 40, 0.06)",
    "0 4px 12px rgba(16, 24, 40, 0.07)",
    "0 4px 18px rgba(30, 50, 90, 0.06)",
    "0 6px 20px rgba(30, 50, 90, 0.08)",
    "0 8px 24px rgba(30, 50, 90, 0.09)",
    "0 10px 28px rgba(30, 50, 90, 0.10)",
    "0 12px 30px rgba(30, 50, 90, 0.12)",
    "0 16px 36px rgba(30, 50, 90, 0.14)",
    "0 20px 44px rgba(30, 50, 90, 0.15)",
    "0 24px 50px rgba(30, 50, 90, 0.16)",
    "0 28px 56px rgba(30, 50, 90, 0.17)",
    "0 32px 64px rgba(30, 50, 90, 0.18)",
    "0 36px 72px rgba(30, 50, 90, 0.19)",
    "0 40px 80px rgba(30, 50, 90, 0.20)",
    "0 44px 88px rgba(30, 50, 90, 0.21)",
    "0 48px 96px rgba(30, 50, 90, 0.22)",
    "0 52px 104px rgba(30, 50, 90, 0.23)",
    "0 56px 112px rgba(30, 50, 90, 0.24)",
    "0 60px 120px rgba(30, 50, 90, 0.25)",
    "0 64px 128px rgba(30, 50, 90, 0.26)",
    "0 68px 136px rgba(30, 50, 90, 0.27)",
    "0 72px 144px rgba(30, 50, 90, 0.28)",
    "0 76px 152px rgba(30, 50, 90, 0.29)",
  ],

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #e5e9f2",
          boxShadow:
            "0 4px 18px rgba(30, 50, 90, 0.05)",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "medium",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;