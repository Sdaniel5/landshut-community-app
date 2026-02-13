/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        },
        primary: {
          DEFAULT: '#2196F3',
          dark: '#1976D2',
          light: '#64B5F6',
        },
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          border: '#272727',
        },
        light: {
          bg: '#FFFFFF',
          card: '#F5F5F5',
          border: '#E0E0E0',
        }
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
