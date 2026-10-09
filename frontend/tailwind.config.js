/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D1E',
          900: '#0B132B',
          850: '#0E1A38',
          800: '#12234B',
          750: '#172C5E',
          700: '#1D3572',
          600: '#25448F',
          500: '#3257AC',
        },
        gov: {
          blue: '#1D4ED8',
          hover: '#1E40AF',
          light: '#3B82F6',
          bg: '#F8FAFC',
          border: '#CBD5E1',
          surface: '#FFFFFF',
        },
        risk: {
          critical: '#DC2626',
          criticalBg: '#FEF2F2',
          criticalBorder: '#F87171',
          high: '#EA580C',
          highBg: '#FFF7ED',
          highBorder: '#FB923C',
          moderate: '#D97706',
          moderateBg: '#FFFBEB',
          moderateBorder: '#FBBF24',
          low: '#16A34A',
          lowBg: '#F0FDF4',
          lowBorder: '#4ADE80',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
