/** @type {import('tailwindcss').Config} */
const brandBlue = {
  50: '#eefbfe',
  100: '#d7f4fb',
  200: '#afe9f7',
  300: '#82ddf2',
  400: '#59d0ec',
  500: '#30C2EC',
  600: '#25a8cd',
  700: '#1d86a5',
  800: '#196b84',
  900: '#17586d',
  950: '#103748',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: brandBlue,
      },
    },
  },
  plugins: [],
}

