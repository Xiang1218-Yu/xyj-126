/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
      },
    },
    extend: {
      colors: {
        memorial: {
          50: "#f6f7f4",
          100: "#e8ebe4",
          200: "#d4d9cd",
          300: "#b5beab",
          400: "#8f9c82",
          500: "#6f7e61",
          600: "#55644a",
          700: "#434f3b",
          800: "#384131",
          900: "#2f372a",
          950: "#1a3a2f",
        },
        candle: {
          50: "#fef7ed",
          100: "#fdecd5",
          200: "#fad5a9",
          300: "#f6b872",
          400: "#f1923a",
          500: "#e8a87c",
          600: "#d88730",
          700: "#b36826",
          800: "#8f5324",
          900: "#744520",
        },
        gold: {
          50: "#faf8f1",
          100: "#f3eed9",
          200: "#e7dbb3",
          300: "#d9c485",
          400: "#c9a962",
          500: "#bc9648",
          600: "#a87d3c",
          700: "#8c6233",
          800: "#735030",
          900: "#5f432a",
        },
        cream: {
          50: "#fdfcf9",
          100: "#faf7f0",
          200: "#f5efe1",
          300: "#ede3cc",
          400: "#e2d2ae",
          500: "#d4be8b",
        },
      },
      fontFamily: {
        serif: ['"Songti SC"', '"STSong"', '"Source Han Serif SC"', '"Noto Serif SC"', "SimSun", "serif"],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Source Han Sans SC"', '"Noto Sans SC"', "sans-serif"],
      },
      animation: {
        "flicker": "flicker 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
        "sakura-fall": "sakuraFall linear infinite",
        "leaf-fall": "leafFall linear infinite",
        "snow-fall": "snowFall linear infinite",
        twinkle: "twinkle ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)", opacity: "1" },
          "25%": { transform: "scale(1.1) rotate(2deg)", opacity: "0.9" },
          "50%": { transform: "scale(0.95) rotate(-1deg)", opacity: "1" },
          "75%": { transform: "scale(1.05) rotate(1deg)", opacity: "0.95" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" },
        },
        sakuraFall: {
          "0%": { transform: "translateY(-10vh) translateX(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(110vh) translateX(100px) rotate(360deg)", opacity: "0" },
        },
        leafFall: {
          "0%": { transform: "translateY(-10vh) translateX(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(110vh) translateX(-80px) rotate(-360deg)", opacity: "0" },
        },
        snowFall: {
          "0%": { transform: "translateY(-10vh) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(110vh) translateX(40px)", opacity: "0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
      boxShadow: {
        "candle": "0 0 40px rgba(232, 168, 124, 0.4)",
        "memorial": "0 10px 40px rgba(26, 58, 47, 0.1)",
      },
    },
  },
  plugins: [],
};
