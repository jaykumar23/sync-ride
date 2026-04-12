/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'brand': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Status colors
        'success': '#22c55e',
        'warning': '#eab308',
        'danger': '#ef4444',
        'info': '#3b82f6',
        // Theme colors (will be overridden by CSS variables)
        'surface': {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          elevated: 'var(--surface-elevated)',
        },
        'content': {
          DEFAULT: 'var(--content)',
          secondary: 'var(--content-secondary)',
          muted: 'var(--content-muted)',
        },
        // Legacy colors for compatibility
        'glance-bg': '#000000',
        'glance-text': '#FFFFFF',
        'glance-primary': '#22c55e',
        'glance-warning': '#eab308',
        'glance-danger': '#ef4444',
        'map-bg': '#1A1A1A',
        'map-overlay': '#2A2A2A',
        'primary': '#3B82F6',
        'secondary': '#6B7280',
      },
      spacing: {
        'touch-min': '80px',
        'touch-lg': '120px',
        'touch-xl': '160px',
      },
      fontSize: {
        'glance-sm': ['2rem', { lineHeight: '2.5rem' }],
        'glance-base': ['3rem', { lineHeight: '3.5rem' }],
        'glance-lg': ['4rem', { lineHeight: '4.5rem' }],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, -10px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
