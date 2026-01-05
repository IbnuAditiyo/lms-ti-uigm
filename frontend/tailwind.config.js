/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214.3 31.8% 91.4%)",
        background: "#F8FAFC", // Background sedikit lebih abu (Slate-50) agar kartu putih menonjol
        foreground: "hsl(222.2 84% 4.9%)",
        ring: "hsl(161 94% 30%)",
        // --- WARNA EMERALD & GOLD ANDA TETAP DISINI ---
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b', 
          DEFAULT: '#059669',
          foreground: '#ffffff',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#d97706',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        // GANTI KE FONT BARU
        sans: ['"Plus Jakarta Sans"', 'sans-serif'], 
      },
      borderRadius: {
        lg: "1.2rem", // Lebih bulat drastis
        md: "0.8rem",
        sm: "0.5rem",
      },
      boxShadow: {
        // Shadow halus modern (elevation)
        'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
        'nav': '0 2px 10px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}