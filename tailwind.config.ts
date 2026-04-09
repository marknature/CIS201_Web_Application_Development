import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red:    "#CC0000",
          dark:   "#1A1A1A",
          redLight: "#E1C7C7",
        },
        semantic: {
          success: "#22C55E",
          warning: "#FACC15",
          error:   "#EF4444",
          info:    "#3B82F6",
        },
        neutral: {
          50:  "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          400: "#9CA3AF",
          500: "#6B7280",
          700: "#374151",
          900: "#111827",
        },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      borderRadius: { btn: "7px", card: "8px", input: "6px" },
      spacing: { page: "24px", card: "16px" },
    },
  },
  plugins: [],
};
export default config;
