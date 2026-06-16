import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF6F0',
        paper: '#FFFFFF',
        ink: '#5C3A56',
        'ink-soft': '#8A6D85',
        'ink-faint': '#B09AAD',
        eucalyptus: '#2A9D8F',
        'eucalyptus-soft': '#D5EDEB',
        honey: '#2A9D8F',
        'honey-soft': '#D5EDEB',
        vermillion: '#B83A2F',
        'vermillion-soft': '#F4E0DC',
        mist: '#EEE8E0',
        edge: '#DDD6CE',
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
