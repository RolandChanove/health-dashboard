/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Corpus brand — deep red
        brand: {
          50:  '#1A0A0E',
          100: '#2D1017',
          200: '#4A1B26',
          300: '#6B2535',
          400: '#87304B',
          500: '#9C3848',
          600: '#9C3848',
          700: '#D46878',  // light enough to read on brand-50 dark bg
          800: '#E48898',
          900: '#F4AAB8',
        },
        // Override slate → dark theme equivalents
        // slate-50  = inside-card item bg   slate-800 = primary text
        slate: {
          50:  '#1C1C1E',
          100: '#242426',
          200: '#2E2E30',
          300: '#3E3E42',
          400: '#6E6E72',
          500: '#8E8E92',
          600: '#AEAEB2',
          700: '#C8C8CA',
          800: '#E0E0E2',
          900: '#F2F2F4',
        },
        // Accent colors
        gold: '#E8C547',
        'blue-gray': '#5D707F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
