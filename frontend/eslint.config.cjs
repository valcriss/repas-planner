const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const vuePlugin = require('eslint-plugin-vue');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    ignores: ['node_modules', 'dist', 'coverage'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module', ecmaVersion: 2020 },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
];
