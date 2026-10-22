import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const relativeClimbBan = {
  group: ['../../*'],
  message: 'Use the @/ alias instead of climbing multiple directories.',
};

/** Architecture doc §5 — other packages import features only via their barrel. */
const featureDeepImportBan = {
  group: ['@/features/*/*', '@/features/*/*/**'],
  message: 'Import from @/features/<name> (the feature barrel), not deep paths.',
};

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'ios/**', 'android/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2022 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.app.json' },
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Architecture doc §9 — no `any`, ever. Use `unknown` + a Zod parse at the boundary.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      'no-restricted-imports': [
        'error',
        {
          patterns: [relativeClimbBan, featureDeepImportBan],
        },
      ],
      'import/no-default-export': 'warn',

      '@typescript-eslint/no-invalid-void-type': ['error', { allowInGenericTypeArguments: true }],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^@[^/]', '^\\w'],
            ['^@/app'],
            ['^@/features'],
            ['^@/entities'],
            ['^@/shared'],
            ['^@/test'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
    },
  },
  {
    // Inside a feature (and deliberate aggregators), deep @/features/<self>/… is normal.
    // Relative climbs stay banned.
    files: [
      'src/features/**/*.{ts,tsx}',
      'src/app/routes.tsx',
      'src/shared/dialogs/registry.ts',
      'src/test/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [relativeClimbBan],
        },
      ],
    },
  },
  {
    files: ['**/pages/**/*.tsx', 'src/main.tsx', 'vite.config.ts', 'playwright.config.ts', 'capacitor.config.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}', 'e2e/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.es2022 },
    },
    rules: {
      'import/no-default-export': 'off',
    },
  }
);
