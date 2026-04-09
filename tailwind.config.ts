import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1D9E75",
          secondary: "#0F6E56",
          accent: "#5DCAA5",
          light: "#E1F5EE",
        },
        status: {
          duty: { bg:"#E1F5EE", text:"#085041", border:"#5DCAA5" },
          standby: { bg:"#E6F1FB", text:"#0C447C", border:"#85B7EB" },
          leave: { bg:"#FAECE7", text:"#712B13", border:"#F0997B" },
          rest: { bg:"#F1EFE8", text:"#444441", border:"#B4B2A9" },
          ot: { bg:"#FAEEDA", text:"#633806", border:"#EF9F27" },
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
