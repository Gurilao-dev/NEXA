/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pay: {
          bg: '#030712',
          navy: '#0A192F',
          accent: '#38BDF8',
          blue: '#0284C7',
        },
      },
    },
  },
  plugins: [],
};
