/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0B0D14",
          900: "#0F1117",
          850: "#141824",
          800: "#191E2C",
          700: "#232838",
        },
        mist: {
          50: "#F8F9FC",
          100: "#F1F2F9",
          200: "#E4E6F1",
        },
        brand: {
          400: "#8B87F7",
          500: "#6366F1",
          600: "#5A4FE0",
          700: "#8B5CF6",
        },
        accent: {
          teal: "#2DD4BF",
          amber: "#F5A524",
          rose: "#FB7185",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        "aurora": "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99,102,241,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139,92,246,0.2), transparent)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 17, 23, 0.28)",
        "glass-lg": "0 20px 60px rgba(15, 17, 23, 0.35)",
        "glow-brand": "0 0 0 1px rgba(99,102,241,0.4), 0 8px 24px rgba(99,102,241,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
