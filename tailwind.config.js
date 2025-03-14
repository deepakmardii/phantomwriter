/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background-start-rgb))",
        foreground: "rgb(var(--foreground-rgb))",
      },
      backgroundColor: {
        "gray-700": "rgb(55, 65, 81)",
        "gray-800": "rgb(31, 41, 55)",
        "gray-900": "rgb(17, 24, 39)",
        "blue-500": "rgb(59, 130, 246)",
        "blue-600": "rgb(37, 99, 235)",
        "blue-700": "rgb(29, 78, 216)",
      },
      borderColor: {
        "gray-600": "rgb(75, 85, 99)",
        "gray-700": "rgb(55, 65, 81)",
        "blue-500": "rgb(59, 130, 246)",
      },
      textColor: {
        "gray-300": "rgb(209, 213, 219)",
        "gray-400": "rgb(156, 163, 175)",
        white: "rgb(255, 255, 255)",
      },
    },
  },
  plugins: [],
};
