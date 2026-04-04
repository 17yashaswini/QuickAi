/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: { 900: '#0d0d0d', 800: '#141414', 700: '#1a1a1a', 600: '#222222', 500: '#2a2a2a' }
      }
    }
  },
  plugins: []
};
