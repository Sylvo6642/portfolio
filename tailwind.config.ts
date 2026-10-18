import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        edge: 'rgb(var(--edge) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'edge-strong': 'rgb(var(--edge-strong) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        'on-accent': 'rgb(var(--on-accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
        'accent-soft-text': 'rgb(var(--accent-soft-text) / <alpha-value>)',
        highlight: 'rgb(var(--highlight) / <alpha-value>)',
        code: {
          bg: 'rgb(var(--code-bg) / <alpha-value>)',
          bar: 'rgb(var(--code-bar) / <alpha-value>)',
          text: 'rgb(var(--code-text) / <alpha-value>)',
          comment: 'rgb(var(--code-comment) / <alpha-value>)',
          keyword: 'rgb(var(--code-keyword) / <alpha-value>)',
          string: 'rgb(var(--code-string) / <alpha-value>)',
          function: 'rgb(var(--code-function) / <alpha-value>)',
          number: 'rgb(var(--code-number) / <alpha-value>)',
        },
        hero: 'rgb(var(--hero) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        page: 'rgb(var(--page) / <alpha-value>)',
        'ink-black': {
          50: '#ebf2f9', 100: '#d8e5f3', 200: '#b1cbe7', 300: '#8ab1db',
          400: '#6397cf', 500: '#3c7dc3', 600: '#30649c', 700: '#244b75',
          800: '#18324e', 900: '#0c1927', 950: '#08121b',
        },
        'prussian-blue': {
          50: '#eef1f7', 100: '#dce3ef', 200: '#b9c6df', 300: '#96aacf',
          400: '#738ebf', 500: '#5071af', 600: '#405b8c', 700: '#304469',
          800: '#202d46', 900: '#101723', 950: '#0b1018',
        },
        'dusk-blue': {
          50: '#eff2f6', 100: '#dee5ed', 200: '#bdcbdb', 300: '#9cb1c9',
          400: '#7b97b7', 500: '#5b7da4', 600: '#486484', 700: '#364b63',
          800: '#243242', 900: '#121921', 950: '#0d1217',
        },
        'dusty-denim': {
          50: '#eff2f5', 100: '#e0e5eb', 200: '#c0cad8', 300: '#a1b0c4',
          400: '#8296b0', 500: '#627c9d', 600: '#4f637d', 700: '#3b4a5e',
          800: '#27313f', 900: '#14191f', 950: '#0e1116',
        },
        'alabaster-grey': {
          50: '#f3f3f1', 100: '#e6e7e4', 200: '#cecfc9', 300: '#b5b7ae',
          400: '#9c9f93', 500: '#838778', 600: '#696c60', 700: '#4f5148',
          800: '#353630', 900: '#1a1b18', 950: '#121311',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
