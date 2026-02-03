// @ts-check
// ESLint 9 flat config – modern standard (https://eslint.org/docs/latest/use/configure/configuration-files-new)

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const importPlugin = require('eslint-plugin-import');

module.exports = tseslint.config(
  // Global ignores
  {
    ignores: [
      'projects/**',
      'dist/**',
      'node_modules/**',
      '**/*.js',
      'out-tsc/**',
      'coverage/**',
      '*.min.js',
    ],
  },
  // TypeScript (and inline templates via processor)
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...angular.configs.tsRecommended,
      prettierRecommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        createDefaultProgram: true,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // Import order (modern: groups + newlines + alphabetize)
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: 'src/**', group: 'parent', position: 'after' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            '^@angular/',
            '^src/',
            '^@ng-matero/',
            '^angular-tabler-icons',
            '^angular-tabler-icons/',
          ],
        },
      ],
      'import/named': 'off',
      // Angular style
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/prefer-standalone': 'warn',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/no-input-rename': 'off',
      // TypeScript – balanced strictness
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      // Angular rules (same as before)
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-conflicting-lifecycle': 'error',
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/no-lifecycle-call': 'error',
      '@angular-eslint/use-injectable-provided-in': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/no-attribute-decorator': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/use-component-selector': 'error',
      '@angular-eslint/no-queries-metadata-property': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
    },
  },
  // HTML templates
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettierRecommended,
    ],
    rules: {
      'prettier/prettier': ['error', { parser: 'angular' }],
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
    },
  },
);
