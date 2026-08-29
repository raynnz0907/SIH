/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000005',
        surface:    'rgba(255,255,255,0.04)',
        subtle:     'rgba(255,255,255,0.08)',
        border:     'rgba(255,255,255,0.10)',
        primary:    '#3B82F6',
        accent:     '#22C55E',
        warning:    '#F59E0B',
        danger:     '#EF4444',
        muted:      '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
      },
      boxShadow: {
        'glass':      '0 8px 32px 0 rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg':   '0 24px 64px 0 rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-blue':  '0 0 40px rgba(59,130,246,0.25)',
        'glow-green': '0 0 40px rgba(34,197,94,0.20)',
        'glow-sm':    '0 0 16px rgba(59,130,246,0.15)',
      },
      backgroundImage: {
        'radial-blue':  'radial-gradient(ellipse at top, rgba(59,130,246,0.12) 0%, transparent 60%)',
        'radial-green': 'radial-gradient(ellipse at bottom right, rgba(34,197,94,0.08) 0%, transparent 50%)',
        'glass-shine':  'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
      },
      animation: {
        'fade-up':     'fadeUp 0.6s ease forwards',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'pulse-glow':  'pulseGlow 3s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseGlow: { '0%,100%': { opacity: 0.6 }, '50%': { opacity: 1 } },
        float:     { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
