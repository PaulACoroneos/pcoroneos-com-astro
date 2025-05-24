// ESM format for Astro
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    colors: {
      primary: "var(--color-primary)",
      secondary: "var(--color-secondary)",
      tertiary: "var(--color-tertiary)",
      quaternary: "var(--color-quaternary)",
      quinary: "var(--color-quinary)",
      white: "var(--color-white)",
      terminal: "var(--color-terminal)",
      black: "#000",
      gray: {
        100: "#f7fafc",
        200: "#edf2f7",
        300: "#e2e8f0",
        400: "#cbd5e0",
        500: "#a0aec0",
        600: "#718096",
        700: "#4a5568",
        800: "#2d3748",
        900: "#1a202c",
      },
      code: {
        green: "#b5f4a5",
        yellow: "#ffe484",
        purple: "#d9a9ff",
        red: "#ff8383",
        blue: "#93ddfd",
        white: "#fff",
      },
    },
    extend: {
      lineHeight: {
        11: "2.75rem",
        12: "3rem",
        13: "3.25rem",
        14: "3.5rem",
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "var(--color-tertiary)",
            a: {
              color: "var(--color-secondary)",
              '&:hover': {
                color: "var(--color-primary)",
              },
            },
            h1: {
              color: "var(--color-tertiary)",
              fontWeight: "700",
            },
            h2: {
              color: "var(--color-tertiary)",
              fontWeight: "600",
            },
            h3: {
              color: "var(--color-tertiary)",
              fontWeight: "600",
            },
            h4: {
              color: "var(--color-tertiary)",
              fontWeight: "600",
            },
            pre: {
              backgroundColor: "var(--color-terminal)",
              color: "var(--color-white)",
              padding: "1rem",
            },
            code: {
              color: "var(--color-tertiary)",
              backgroundColor: "#f1f5f9",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontWeight: "400",
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
            img: {
              marginTop: "2rem",
              marginBottom: "2rem",
            },
            strong: {
              fontWeight: "600",
            },
          },
        },
      },
    },
  },
  plugins: [
    // @ts-expect-error - Default import from a CJS module
    require('@tailwindcss/typography'),
  ],
};
