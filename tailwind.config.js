/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        disk: {
          bg: '#1c1c1e',
          surface: '#2c2c2e',
          border: '#3a3a3c',
          'border-light': '#48484a',
          unalloc: '#3a3a3c',
          overlap: '#ff453a',
          accent: '#0a84ff',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Space Grotesk"', '-apple-system', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
