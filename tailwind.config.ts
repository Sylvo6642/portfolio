import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Archivo"', 'system-ui', 'sans-serif'],
        display: ['"Archivo"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        edge: 'rgb(var(--edge) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        porcelain: {
          50: '#ffffe5', 100: '#ffffcc', 200: '#ffff99', 300: '#ffff66',
          400: '#ffff33', 500: '#ffff00', 600: '#cccc00', 700: '#999900',
          800: '#666600', 900: '#333300', 950: '#242400',
        },
        'stormy-teal': {
          50: '#e8fafc', 100: '#d2f6f9', 200: '#a5edf3', 300: '#78e4ed',
          400: '#4adae8', 500: '#1dd1e2', 600: '#17a7b5', 700: '#127e87',
          800: '#0c545a', 900: '#062a2d', 950: '#041d20',
        },
        'tropical-teal': {
          50: '#edf7f7', 100: '#dbf0f0', 200: '#b7e1e0', 300: '#93d2d1',
          400: '#6fc3c1', 500: '#4bb4b2', 600: '#3c908e', 700: '#2d6c6b',
          800: '#1e4847', 900: '#0f2424', 950: '#0b1919',
        },
        'pearl-aqua': {
          50: '#ebf8f9', 100: '#d8f1f3', 200: '#b0e2e8', 300: '#89d4dc',
          400: '#62c5d0', 500: '#3bb7c4', 600: '#2f929d', 700: '#236e76',
          800: '#17494f', 900: '#0c2527', 950: '#081a1b',
        },
        teal: {
          50: '#ebf9f9', 100: '#d7f4f4', 200: '#b0e8e8', 300: '#88dddd',
          400: '#61d1d1', 500: '#39c6c6', 600: '#2e9e9e', 700: '#227777',
          800: '#174f4f', 900: '#0b2828', 950: '#081c1c',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
