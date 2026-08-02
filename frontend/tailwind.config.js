/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts}"
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--bg-elevated)',
        sunken: 'var(--bg-sunken)',
        ink: {
          DEFAULT: 'var(--ink)',
          secondary: 'var(--ink-secondary)',
          muted: 'var(--ink-muted)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          ink: 'var(--accent-ink)',
          tint: 'var(--accent-tint)',
        },
        good: {
          DEFAULT: 'var(--good)',
          ink: 'var(--good-ink)',
          tint: 'var(--good-tint)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          ink: 'var(--warn-ink)',
          tint: 'var(--warn-tint)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          ink: 'var(--danger-ink)',
          tint: 'var(--danger-tint)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '22px',
        ctl: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow-rgb) / 6%)',
        'card-hover': '0 14px 28px -16px rgb(var(--shadow-rgb) / 35%)',
      },
    },
  },
  plugins: [],
}
