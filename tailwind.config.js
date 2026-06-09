/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f4f4f7',
          100: '#e8e7ef',
          200: '#d0cedf',
          300: '#b0adca',
          400: '#8e8ab4',
          500: '#6c6897',
          600: '#524f78',
          700: '#3f3e59',   // brand primary
          800: '#2c2b3e',
          900: '#191824',
          DEFAULT: '#3f3e59',
        },
        secondary: {
          50:  '#fdf5ea',
          100: '#faebd5',
          200: '#f5d7ab',
          300: '#efbf77',
          400: '#e9a753',
          500: '#de9f4f',   // brand secondary / accent
          600: '#c4811e',
          700: '#9a6418',
          800: '#704812',
          900: '#472c0b',
          DEFAULT: '#de9f4f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
