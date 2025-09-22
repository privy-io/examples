/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        "abc-favorit": ["var(--font-abc-favorit)", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};