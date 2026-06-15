import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF7F0',
        paper: '#FFFFFF',
        ink: '#1A2238',
        'ink-soft': '#4A5266',
        'ink-faint': '#8B8FA0',
        eucalyptus: '#5B7C6E',
        'eucalyptus-soft': '#E5EBE8',
        honey: '#B8841F',
        'honey-soft': '#F5EBD3',
        vermillion: '#B83A2F',
        'vermillion-soft': '#F4E0DC',
        mist: '#EDE8DC',
        edge: '#DDD6C4',
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
