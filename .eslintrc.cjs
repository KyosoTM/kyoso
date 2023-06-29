module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['svelte-eslint-parser', '@typescript-eslint'],
  ignorePatterns: ['*.cjs'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte-eslint-parser' }],
  rules: {
    'quotes': [
      'warn',
      'single',
      {
        avoidEscape: true
      }
    ],
    'semi': ['warn', 'always'],
    'no-var': 'warn',
    'brace-style': ['warn', '1tbs'],
    'comma-dangle': ['warn', 'never'],
    'default-case': 'error',
    'prefer-const': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    'quote-props': ['warn', 'consistent'],
    '@typescript-eslint/no-unused-vars': 'warn',
    'unused-export-let': 'off'
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  }
};