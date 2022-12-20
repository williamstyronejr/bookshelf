/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
      },
      keyframes: {
        'book-back': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': {
            transform: 'rotateY(-20deg) scale(1.1)',
          },
        },
        'book-page-6': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': {
            transform: 'rotateY(-50deg) scale(1.1)',
            'box-shadow': '0 1em 3em 0 rgba(0,0,0,0.2)',
          },
        },
        'book-page-5': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': {
            transform: 'rotateY(-130deg) scale(1.1)',
            'box-shadow': '0 1em 3em 0 rgba(0,0,0,0.2)',
          },
        },
        'book-page-4': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': {
            transform: 'rotateY(-40deg) scale(1.1)',
            'box-shadow': '0 1em 3em 0 rgba(0,0,0,0.2)',
          },
        },
        'book-page-3': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': {
            transform: 'rotateY(-140deg) scale(1.1)',
            'box-shadow': '0 1em 3em 0 rgba(0,0,0,0.2)',
          },
        },
        'book-page-2': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': {
            transform: 'rotateY(-30deg) scale(1.1)',
            'box-shadow': '0 1em 3em 0 rgba(0,0,0,0.2)',
          },
        },
        'book-page-1': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': {
            transform: 'rotateY(-150deg) scale(1.1)',
            'box-shadow': '0 1em 3em 0 rgba(0,0,0,0.2)',
          },
        },
        'book-front': {
          '0%, 100%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': {
            transform: 'rotateY(-160deg) scale(1.1)',
            'box-shadow': '0 1em 3em 0 rgba(0,0,0,0.2)',
          },
        },
      },
      animation: {
        'book-front': 'book-front   1.3s ease-in-out infinite alternate',
        'book-page-1': 'book-page-1 1.3s ease-in-out infinite alternate',
        'book-page-2': 'book-page-2 1.3s ease-in-out infinite alternate',
        'book-page-3': 'book-page-3 1.3s ease-in-out infinite alternate',
        'book-page-4': 'book-page-4 1.3s ease-in-out infinite alternate',
        'book-page-5': 'book-page-5 1.3s ease-in-out infinite alternate',
        'book-page-6': 'book-page-6 1.3s ease-in-out infinite alternate',
        'book-back': 'book-back     1.3s ease-in-out infinite alternate',
      },
      colors: {
        custom: {
          background: 'var(--background)',
          'btn-submit': '#3b5dd6',
          'bg-light': '#ffffff',
          'bg-dark': '#212224',
          'bg-off-light': '#f6f8fb',
          'bg-off-dark': '#111213',
          'text-light': '#000',
          'text-dark': '#fff',
          'text-highlight-light': '#2a2a2a',
          'text-highlight-dark': '#2a2a2a',
          'text-link-light': '#4f6dda',
          'text-link-dark': '#4f6dda',
          'text-link-hover-light': '#556ec8',
          'text-link-hover-dark': '#556ec8',
          'text-light-subtle': '#babac4',
          'text-dark-subtle': '#9f9f9f',
        },
      },
      maxWidth: {
        1920: '1920px',
      },
    },
  },
  plugins: [],
};
