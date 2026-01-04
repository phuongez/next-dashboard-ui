import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        lamaSky: "#C3E3F9",
        lamaSkyLight: "#EEF7FD",
        lamaPurple: "#F05A7E",
        lamaPurpleLight: "#FDE6EC",
        lamaYellow: "#4A628A",
        lamaYellowLight: "#DCE4F0",
      },
    },
  },
  plugins: [],
};
export default config;
