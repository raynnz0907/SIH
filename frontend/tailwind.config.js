/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07080C',
        surface:    '#0D0E15',
        card:       '#11131B',
        subtle:     'rgba(255,255,255,0.05)',
        border:     'rgba(255,255,255,0.08)',
        platinum: {
          50:  '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#CBD5E1',
          500: '#94A3B8',
          600: '#64748B',
        },
        titanium: {
          100: '#F8FAFC',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Data telemetry semantics
        emerald: {
          400: '#10B981',
          500: '#059669',
        },
        amber: {
          400: '#F59E0B',
          500: '#D97706',
        },
        rose: {
          400: '#EF4444',
          500: '#DC2626',
        },
      },
      fontFamily: {
        heading: ['"Open Sans"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        brand: ['"Open Sans"', 'sans-serif'],
        display: ['"Open Sans"', 'sans-serif'],
        syne: ['"Open Sans"', 'sans-serif'],
        tech: ['"IBM Plex Sans"', 'sans-serif'],
        space: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
      },
      boxShadow: {
        'card': '0 10px 30px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.1)',
        'titanium': '0 4px 20px -2px rgba(255, 255, 255, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.5)',
        'platinum-glow': '0 0 35px rgba(255, 255, 255, 0.18)',
        'emerald-glow': '0 0 30px rgba(16, 185, 129, 0.25)',
      },
    },
  },
  plugins: [],
}
