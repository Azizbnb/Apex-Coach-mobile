import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        apex: {
          black: {
            900: '#0F172A',
            800: '#1E293B',
            700: '#334155',
            600: '#475569',
            500: '#64748B',
            400: '#94A3B8',
            300: '#CBD5E1',
            200: '#E2E8F0',
            100: '#F1F5F9',
          },
          lime: {
            900: '#365314',
            700: '#4D7C0F',
            600: '#65A30D',
            500: '#84CC16',
            400: '#A3E635',
            300: '#BEF264',
            200: '#D9F99D',
            100: '#ECFCCB',
          },
          white: '#FAFAF9',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px',
        '3xl': '96px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
