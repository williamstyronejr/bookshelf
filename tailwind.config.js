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
          'bg-off-light': '#f6f8fb',
          'bg-off-dark': '#f6f8fb',
        },
      },
    },
  },
  plugins: [],
};
