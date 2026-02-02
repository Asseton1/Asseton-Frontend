/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'slow-zoom': 'slowZoom 30s ease-in-out infinite',
      },
      keyframes: {
        slowZoom: {
          '0%, 100%': { transform: 'scale(1.0)' },
          '50%': { transform: 'scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
}
