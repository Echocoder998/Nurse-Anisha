import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FDF6F8',
        paper: '#FFFFFF',
        ink: '#1C1028',
        'ink-soft': '#5C3F6A',
        'ink-faint': '#A48BAD',
        eucalyptus: '#1F7B6D',
        'eucalyptus-soft': '#D8EDEA',
        honey: '#B8760D',
        'honey-soft': '#F5E9D4',
        vermillion: '#B83A2F',
        'vermillion-soft': '#F4E0DC',
        mist: '#F2E5EE',
        edge: '#E4D0E0',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
