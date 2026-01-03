/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#171717',
        panel: '#1e1e1e',
        border: '#333333',
        primary: '#3b82f6',
        text: {
          primary: '#e5e5e5',
          secondary: '#a3a3a3'
        }
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        code: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
