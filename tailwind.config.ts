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
            900: '#0A0E1A',
            800: '#111827',
            700: '#1F2937',
            600: '#374151',
            500: '#6B7280',
            400: '#9CA3AF',
            300: '#D1D5DB',
            200: '#E5E7EB',
            100: '#F3F4F6',
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
