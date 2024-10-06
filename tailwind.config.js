/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.{html,js,jsx,ts,tsx}",                   // Include files in the root directory
    "./src/**/*.{html,js,jsx,ts,tsx}",            // Include files in the src folder and its subdirectories
    "./src/components/**/*.{html,js,jsx,ts,tsx}", // nclude files specifically in the components folder and its subdirectories
    "./pages/**/*.{html,js,jsx,ts,tsx}",            // Include files in the pages folder and its subdirectories
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

