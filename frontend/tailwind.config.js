/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        gradient: "gradientMove 3s ease infinite",
        float1: "float1 6s ease-in-out infinite",
        float2: "float2 7s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
        "glow-move1": "glowMove1 8s ease-in-out infinite",
        "glow-move2": "glowMove2 10s ease-in-out infinite",
        "grid-move1": "gridMove1 20s linear infinite",
        "grid-move2": "gridMove2 15s linear infinite",
        twinkle1: "twinkle1 3s ease-in-out infinite",
        twinkle2: "twinkle2 5s ease-in-out infinite",
        "star-move": "starMove 20s linear infinite",
        "gradient-move": "gradientMove 6s ease infinite",
      },
      keyframes: {
        gradientMove: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float1: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(10deg)" },
        },
        float2: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-25px) rotate(-10deg)" },
        },
        glowMove1: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(80px, -60px) scale(1.1)" },
          "66%": { transform: "translate(-40px, 40px) scale(0.9)" },
        },
        glowMove2: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(-80px, 60px) scale(0.9)" },
          "66%": { transform: "translate(40px, -40px) scale(1.1)" },
        },
        gridMove1: {
          "0%": { backgroundPosition: "0px 0px" },
          "100%": { backgroundPosition: "60px 60px" }, // geser sesuai ukuran tile
        },
        gridMove2: {
          "0%": { backgroundPosition: "0px 0px" },
          "100%": { backgroundPosition: "-20px -20px" }, // berlawanan arah
        },
        twinkle1: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        twinkle2: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "0.1" },
        },
        starMove: {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-100vh)" },
        },
        gradientMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      colors: {
        biru: {
          15: "#F4F4FF",
          25: "#B1BFF6",
          50: "#5B75D6",
          100: "#3D539F",
        },
        indigo: {
          15: "#F4F4FF",
          25: "#B0B7FB",
          50: "#798AF4",
          100: "#251A7A",
        },
        orange: {
          15: "#FF854C",
          25: "#FF8B00",
        },
        ungu: {
          15: "#5A57E5",
          25: "#7C54FF",
          50: "#251A7A",
          100: "#111239",
          150: "#211F9E",
        },
        kuning: {
          15: "#FCC046",
        },
        merah: {
          15: "#F06B6E",
        },
        hijau: {
          15: "#3CCC78",
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
};
