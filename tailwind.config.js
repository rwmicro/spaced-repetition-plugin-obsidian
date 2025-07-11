/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './main.ts',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './**/*.{ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class'
}