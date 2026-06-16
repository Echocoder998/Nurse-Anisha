import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F3EA',
        paper: '#FFFFFF',
        ink: '#59374F',
        'ink-soft': '#8A6878',
        'ink-faint': '#B19AAE',
        eucalyptus: '#2E9387',
        'eucalyptus-soft': '#D4EDE9',
        honey: '#2E9387',
        'honey-soft': '#D4EDE9',
        vermillion: '#B83A2F',
        'vermillion-soft': '#F4E0DC',
        mist: '#EDE7DF',
        edge: '#DCD6CE',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
