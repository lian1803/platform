import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          foreground: '#FFFFFF',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
        },
        accent: '#10B981',
        warning: '#F59E0B',
        destructive: '#EF4444',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        body: ['16px', { lineHeight: '1.6' }],
        subheading: ['20px', { lineHeight: '1.6' }],
        heading: ['28px', { lineHeight: '1.4' }],
        hero: ['40px', { lineHeight: '1.2' }],
      },
      screens: {
        md: '768px',
      },
    },
  },
  plugins: [],
}

export default config
