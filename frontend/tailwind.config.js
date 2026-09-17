/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          900: '#0c4a6e',
        },
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
