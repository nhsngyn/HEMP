/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SUIT', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        main: '#93E729',
        sub1: '#BBB143',
        sub2: '#3CA7C4',
        white: '#FFFFFF',
        gray100: '#E8EAED',
        gray200: '#D1D5DB',
        gray300: '#9CA3AE',
        gray400: '#6D7380',
        gray500: '#4C5564',
        gray700: '#29303A',
        gray800: '#191C23',
        gray900: '#101217',
        skyblue: '#3CA7C4',
        yellow: '#BBB143',
        green: '#93E729',
      },
    },
  },
  plugins: [],
}
