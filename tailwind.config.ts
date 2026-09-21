import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8f1',
          100: '#ffeede',
          200: '#ffd9b8',
          300: '#ffb986',
          400: '#ff9254',
          500: '#e07a3a',
          600: '#c45f26',
          700: '#a24a1f',
          800: '#823c1c',
          900: '#6a3319',
        },
        gold: {
          light: '#f3d98a',
          DEFAULT: '#d4a843',
          dark: '#9a7a28',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1280px',
        },
      },
    },
  },
  plugins: [],
};

export default config;
