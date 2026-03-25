/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-bg': 'var(--accent-bg)',
        'accent-border': 'var(--accent-border)',
        surface: 'var(--bg)',
        'text-primary': 'var(--text)',
        'text-heading': 'var(--text-h)',
        border: 'var(--border)',
        'code-bg': 'var(--code-bg)',
        'social-bg': 'var(--social-bg)',
      },
      fontFamily: {
        sans: ['var(--sans)'],
        heading: ['var(--heading)'],
        mono: ['var(--mono)'],
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
    },
  },
  plugins: [],
}
