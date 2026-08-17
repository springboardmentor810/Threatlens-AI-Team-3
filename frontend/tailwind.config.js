/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: 'rgb(var(--cyber-bg) / <alpha-value>)',
          card: 'rgb(var(--cyber-card) / <alpha-value>)',
          border: 'rgb(var(--cyber-border) / <alpha-value>)',
          accent: 'rgb(var(--cyber-accent) / <alpha-value>)',
          red: 'rgb(var(--cyber-red) / <alpha-value>)',
          amber: 'rgb(var(--cyber-amber) / <alpha-value>)',
          green: 'rgb(var(--cyber-green) / <alpha-value>)',
          purple: 'rgb(var(--cyber-purple) / <alpha-value>)',
        },
        surface: {
          subtle: 'rgb(var(--surface-subtle) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
        },
        content: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        }
      },
      boxShadow: {
        'card-glow': '0 4px 20px -2px rgba(2, 132, 199, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'accent-glow': '0 0 20px -3px rgb(var(--cyber-accent) / 0.35)',
      }
    },
  },
  plugins: [],
}
