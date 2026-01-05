/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'nexus-bg': '#0D1117',
        'nexus-sidebar': '#161B22',
        'nexus-card': '#161B22',
        'nexus-primary': '#F0B90B',
        'nexus-secondary': '#059669',
        'nexus-text': '#E6EDF3',
        'nexus-text-secondary': '#8B949E',
      },
    },
  },
  plugins: [],
};
