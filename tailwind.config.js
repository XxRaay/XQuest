/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#06070a',
        foreground: '#f8fafc',
        card: {
          DEFAULT: 'rgba(11, 16, 28, 0.72)',
          foreground: '#f8fafc',
          border: 'rgba(56, 189, 248, 0.16)',
        },
        primary: {
          DEFAULT: '#38bdf8',
          hover: '#0ea5e9',
          foreground: '#040d1a',
        },
        discord: {
          blurple: '#5865F2',
          dark: '#1e1f22',
          light: '#ebedef',
        },
        muted: {
          DEFAULT: 'rgba(15, 23, 42, 0.65)',
          foreground: '#94a3b8',
        },
        border: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -4px rgba(56, 189, 248, 0.25)',
        'glow-blurple': '0 0 25px -4px rgba(88, 101, 242, 0.25)',
      },
    },
  },
  plugins: [],
};
