module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    // TypeScript gère la résolution des modules — redondant avec eslint-plugin-import
    'import/no-unresolved': 'off',
    'import/namespace': 'off',
  },
};
