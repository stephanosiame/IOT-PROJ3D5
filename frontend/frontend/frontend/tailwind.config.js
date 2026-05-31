/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',    // dark blue
        secondary: '#10b981',  // green
        danger: '#ef4444',
        warning: '#f59e0b',
      }
    },
  },
  plugins: [],
}
