/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        kaf: {
          bg: '#111418',
          panel: '#181c20',
          card: '#1f2429',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          cyan: '#00ff66', // Keep the variable name 'cyan' so we don't break all the classes, but make it neon green
          teal: '#2ecc71',
          gold: '#ffd700',
        },
        status: {
          win: '#10b981',
          loss: '#ef4444',
          live: '#ff003c',
          draft: '#9333ea',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
