/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEEDFE',
          100: '#D4D1FD',
          200: '#A9A3FB',
          300: '#7E75F9',
          400: '#5347F7',
          600: '#534AB7',
          700: '#3D3789',
          800: '#28245B',
          900: '#14122E',
        },
      },
    },
  },
  plugins: [],
}