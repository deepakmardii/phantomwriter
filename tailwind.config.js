/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background-start-rgb))',
        foreground: 'rgb(var(--foreground-rgb))',
        orange: {
          500: 'rgb(249, 115, 22)',
          600: 'rgb(234, 88, 12)',
          700: 'rgb(194, 65, 12)',
        },
      },
      backgroundColor: {
        white: 'rgb(255, 255, 255)',
        'orange-500': 'rgb(249, 115, 22)',
        'orange-600': 'rgb(234, 88, 12)',
        'orange-700': 'rgb(194, 65, 12)',
      },
      borderColor: {
        'orange-500': 'rgb(249, 115, 22)',
        'orange-600': 'rgb(234, 88, 12)',
        gray: 'rgb(229, 231, 235)',
      },
      textColor: {
        'gray-600': 'rgb(75, 85, 99)',
        'gray-700': 'rgb(55, 65, 81)',
        'gray-800': 'rgb(31, 41, 55)',
        'orange-500': 'rgb(249, 115, 22)',
        'orange-600': 'rgb(234, 88, 12)',
      },
    },
  },
  plugins: [],
};
