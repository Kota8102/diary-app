/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
    colors: {
      primaryBackground: '#d4cdc7',
      secondaryBackground: '#c8c1b9',
      primaryButton: '#f5f5f5',
    },
  },
  plugins: [],
}
}