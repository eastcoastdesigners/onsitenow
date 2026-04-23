/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1fa',
          100: '#d5ddf2',
          200: '#abbae5',
          300: '#8097d8',
          400: '#5674cb',
          500: '#2c51be',
          600: '#1a3a7c',
          700: '#132d62',
          800: '#0d2049',
          900: '#081330',
          950: '#040a1a',
        },
        brand: '#f97316',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
