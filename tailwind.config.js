module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        base: "rgb(var(--color-bg-base) / <alpha-value>)",
        muted: "rgb(var(--color-bg-muted) / <alpha-value>)",
        "text-base": "rgb(var(--color-text-base) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai Looped"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),

    require("tailwind-scrollbar")({ nocompatible: true }),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: "#ef4444",
          secondary: "#6b7280",
          "--rounded-box": "0.2rem",
          "--rounded-btn": "0.2rem",
        },
      },
    ],
  },
};
