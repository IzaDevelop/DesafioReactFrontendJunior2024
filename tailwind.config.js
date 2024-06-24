/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: '#f5f5f5',
        red: '#b83f45'
      }
    },
  },
  plugins: [],
}

