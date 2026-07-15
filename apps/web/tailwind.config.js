/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["\"Cinzel\"", "\"Playfair Display\"", "serif"],
        body: ["\"Inter\"", "system-ui", "sans-serif"],
      },
      colors: {
        stone: {
          950: "#080a0c",
          900: "#101216",
          800: "#181a20",
          700: "#222630",
          600: "#303540",
        },
        panel: "#121418",
        sand: {
          50: "#fdfaeb",
          100: "#f4ead2",
          200: "#e6d5b0",
          300: "#d8c08c",
          400: "#c7a863",
          500: "#a98a46",
        },
        bronze: {
          400: "#d49658",
          500: "#b5793e",
          600: "#965f29",
          700: "#6e4215",
          800: "#4a2a0a",
        },
        gold: {
          200: "#fae7af",
          300: "#f2d385",
          400: "#e8bd54",
          500: "#db9d2b",
          600: "#b87c1f",
          700: "#935f13",
        },
        teal: {
          400: "#5ebcad",
          500: "#439688",
          600: "#327a6e",
          700: "#225950",
          800: "#143a33",
        },
        success: {
          500: "#638936",
          600: "#4b6c26",
          700: "#354f18",
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0,0,0,0.8), inset 0 2px 2px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.5)",
        "button-base": "0 4px 6px rgba(0,0,0,0.6), inset 0 2px 1px rgba(255,255,255,0.15)",
        "button-pressed": "inset 0 4px 8px rgba(0,0,0,0.6)",
        glow: "0 0 30px rgba(219, 157, 43, 0.4)",
        inner: "inset 0 4px 8px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "wood-grain": "linear-gradient(180deg, #3a2211 0%, #201105 100%)",
        "panel-texture": "url('/panel_texture.png')",
        "gold-gradient": "linear-gradient(180deg, #e8bd54 0%, #b87c1f 100%)",
        "success-gradient": "linear-gradient(180deg, #638936 0%, #354f18 100%)",
        "stone-gradient": "linear-gradient(180deg, #303540 0%, #181a20 100%)",
      },
    },
  },
  plugins: [],
};
