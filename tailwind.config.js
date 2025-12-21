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
<<<<<<< HEAD

      /* =========================
       * TYPOGRAPHY SYSTEM
       * ========================= */
      fontSize: {
        // [fontSize, { lineHeight, letterSpacing, fontWeight }] 형식
        
        // Title 2
        'title2-b': ['22px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title2-sb': ['22px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title2-m': ['22px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '500' }],
        
        // Title 3
        'title3-b': ['20px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title3-sb': ['20px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title3-m': ['20px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '500' }],

        // Body 1
        'body1-b': ['18px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body1-sb': ['18px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body1-m': ['18px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body1-r': ['18px', { lineHeight: '145%', letterSpacing: '-0.01em', fontWeight: '400' }],

        // Body 2
        'body2-b': ['16px', { lineHeight: '140%', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body2-sb': ['16px', { lineHeight: '140%', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body2-m': ['16px', { lineHeight: '140%', letterSpacing: '-0.02em', fontWeight: '500' }],
        'body2-r': ['16px', { lineHeight: '140%', letterSpacing: '-0.01em', fontWeight: '400' }],

        // Body 3
        'body3-b': ['14px', { lineHeight: '140%', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body3-sb': ['14px', { lineHeight: '140%', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body3-m': ['14px', { lineHeight: '140%', letterSpacing: '-0.02em', fontWeight: '500' }],
        'body3-r': ['14px', { lineHeight: '140%', letterSpacing: '-0.02em', fontWeight: '400' }],

        // Caption 1
        'caption1-eb': ['12px', { lineHeight: '130%', letterSpacing: '-0.02em', fontWeight: '800' }],
        'caption1-b': ['12px', { lineHeight: '130%', letterSpacing: '-0.02em', fontWeight: '700' }],
        'caption1-sb': ['12px', { lineHeight: '130%', letterSpacing: '-0.02em', fontWeight: '600' }],
        'caption1-m': ['12px', { lineHeight: '130%', letterSpacing: '-0.02em', fontWeight: '500' }],
        'caption1-r': ['12px', { lineHeight: '130%', letterSpacing: '-0.02em', fontWeight: '400' }],
=======
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
>>>>>>> 014107cd20b55e91d8e3784aba39c00c4fdf5a22
      },
    },
  },
  plugins: [],
}
