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
        chat: {
          bgDark: '#090D16',
          bgSurface: '#111827',
          emerald: '#10B981',
          teal: '#0D9488',
          iris: '#A855F7',
          sky: '#38BDF8',
          bubbleOut: '#064E3B',
          bubbleIn: 'rgba(255, 255, 255, 0.07)',
        },
      },
    },
  },
  plugins: [],
};
