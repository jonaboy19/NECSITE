/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        kaf: {
          bg: '#050505',
          panel: '#0a0a0c',
          card: '#0f1014',
          border: 'rgba(255, 255, 255, 0.05)',
        },
        brand: {
          cyan: '#008a38', // Darker, authentic tournament green
          teal: '#1f8c4d',
          gold: '#b39500',
        },
        status: {
          win: '#059669',
          loss: '#dc2626',
          live: '#b9002d',
          draft: '#7e22ce',
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
