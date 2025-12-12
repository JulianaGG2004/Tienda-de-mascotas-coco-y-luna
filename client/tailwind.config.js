/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        "primary-100" : "#F5F5F5",
        "primary-200" : "#A8E1EA",
        "primary-300" : "#00AFC4",
        "primary-400" : "#0098AA",
        "primary-500" : "#007c92",
        "secondary-200" : "#FDBACB",
        "secondary-500" : "#AD173C",
        "secondary-300" : "#F7255B"

        
      }
    },
  },
  plugins: [],
}

