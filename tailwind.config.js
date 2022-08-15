/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
      },
      colors: {
        custom: {
          background: 'var(--background)',
          'btn-submit': '#3b5dd6',
        },
      },
    },
  },
  plugins: [],
};
