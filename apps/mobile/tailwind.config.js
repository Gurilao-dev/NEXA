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
        mobile: {
          bgDark: '#0B0F19',
          bgLight: '#F8FAFC',
          indigo: '#6366F1',
          electric: '#818CF8',
        },
      },
    },
  },
  plugins: [],
};
