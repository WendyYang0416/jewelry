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
          50: '#fdf6f0',
          100: '#fae8d8',
          200: '#f4cfb1',
          300: '#eca880',
          400: '#e2854f',
          500: '#d06630',
          600: '#b74e26',
          700: '#963d21',
          800: '#7a341f',
          900: '#642e1d',
        },
        gold: {
          light: '#e8c878',
          DEFAULT: '#c9a227',
          dark: '#8a6d1a',
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
