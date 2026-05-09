/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        kaf: {
          bg:           '#0c0c10',   // Deepest background (purple-tinted black)
          panel:        '#131318',   // Sidebar / nav panel
          card:         '#1b1b22',   // Card surfaces
          elevated:     '#23232d',   // Elevated cards, dropdowns
          'border':     'rgba(255, 255, 255, 0.06)',
          'border-strong': 'rgba(255, 255, 255, 0.13)',
        },
        brand: {
          // Primary — KAF Logo Green (keep 'cyan' key for backwards compat with all existing code)
          cyan:         '#19853B',   // KAF brand forest green — MAIN ACCENT
          teal:         '#126A2D',   // Darker KAF green (hover, pressed)
          // Brighter greens for highlights/glow
          neon:         '#4ade80',   // Neon green for glows / highlights
          lime:         '#22c55e',   // Mid-bright green for hover/secondary
          // "Normal" secondary accents (non-green)
          blue:         '#3b82f6',   // Sky blue — info, secondary CTAs
          'blue-light':  '#60a5fa',  // Lighter blue for hover
          violet:       '#7c3aed',   // Purple — special roles / premium
          'violet-light':'#a78bfa',  // Light violet
          // Achievement & status
          gold:         '#f59e0b',   // Amber gold — trophies, rankings
          'gold-light': '#fcd34d',   // Light gold for glow
        },
        status: {
          win:    '#16a34a',
          loss:   '#ef4444',
          live:   '#ef4444',
          draft:  '#7c3aed',
          pending:'#f59e0b',
        }
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h1v1H0z' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E\")",
        'dot-pattern':   "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        'glow-green':    'radial-gradient(ellipse at center, rgba(25,133,59,0.2) 0%, transparent 70%)',
        'glow-blue':     'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
        'hero-gradient': 'linear-gradient(135deg, #0c0c10 0%, #0f1318 50%, #0c0c10 100%)',
      },
      boxShadow: {
        'glow-green':  '0 0 20px rgba(25,133,59,0.35), 0 0 60px rgba(25,133,59,0.1)',
        'glow-green-sm':'0 0 10px rgba(25,133,59,0.4)',
        'glow-blue':   '0 0 20px rgba(59,130,246,0.3)',
        'glow-gold':   '0 0 20px rgba(245,158,11,0.3)',
        'card':        '0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(25,133,59,0.25)',
        'panel':       '4px 0 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'marquee':      'marquee 25s linear infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'shimmer':      'shimmer 1.6s infinite',
        'fade-in':      'fade-in 0.35s ease-out',
        'slide-up':     'slideUp 0.35s cubic-bezier(.22,1,.36,1)',
      },
      keyframes: {
        marquee:    { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        glowPulse:  { '0%,100%': { boxShadow: '0 0 0 0 rgba(25,133,59,0)' }, '50%': { boxShadow: '0 0 30px 8px rgba(25,133,59,0.2)' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'fade-in':  { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
