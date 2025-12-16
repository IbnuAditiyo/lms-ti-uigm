/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // 🎨 UIGM BRANDING COLORS
        primary: {
          50: '#eef6ff',
          100: '#daebff',
          200: '#bddbff',
          300: '#8fc3ff',
          400: '#599eff',
          500: '#2d7aff',
          600: '#0052cc', 
          700: '#0043a8',
          800: '#003685',
          900: '#002e69',
          950: '#001d45',
          DEFAULT: '#0052cc', // <--- PENYELAMAT: Biar 'ring-primary' valid!
        },
        secondary: {
          50: '#fffbeb',
          100: '#fff2c6',
          200: '#ffe588',
          300: '#ffd34a',
          400: '#ffbf1a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          DEFAULT: '#f59e0b', // <--- PENYELAMAT: Biar 'ring-secondary' valid!
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        
        // 🛠️ MAPPING KOMPATIBILITAS (Shadcn UI & Template)
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#0052cc', // Default ring color
        background: '#ffffff',
        foreground: '#0f172a',
        
        // Warna Status Tambahan
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
      },
      backgroundImage: {
        'uigm-gradient': 'linear-gradient(to right, #002e69, #0052cc)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}