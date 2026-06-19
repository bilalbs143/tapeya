import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

import tapeyaFormLayout from './eslint-rules/index.js';

function cleanGlobals(globalsObj) {
  if (!globalsObj || typeof globalsObj !== 'object') {
    return {};
  }
  return Object.fromEntries(Object.entries(globalsObj).map(([key, value]) => [key.trim(), value]));
}

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'ios/**',
      'android/**',
      '.capacitor/**',
      'vite.config.js',
      'capacitor.config.json',
    ],
  },
  js.configs.recommended,

  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        ...cleanGlobals(globals.node),
      },
      sourceType: 'module',
    },
  },

  // React + Vite
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Language options
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...cleanGlobals(globals.browser),
        ...cleanGlobals(globals.node),
        ...cleanGlobals(globals.es2021),
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
  },

  // React plugins
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react/no-unescaped-entities': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
    },
  },

  // Import plugins
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
          moduleDirectory: ['node_modules', 'src/'],
        },
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx'],
        },
      },
    },
    rules: {
      'import/no-unresolved': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Side-effect imports (e.g. import 'swiper/css')
            ['^\\u0000'],
            // 2. Node builtins (node:)
            ['^node:'],
            // 3. React first
            ['^react$', '^react-dom$'],
            // 4. Other external packages (alphabetical within group)
            ['^@?\\w'],
            // 5. Internal alias @/ (alphabetical within group)
            ['^@/'],
            // 6. Relative imports (../ then ./)
            ['^\\.\\./', '^\\./'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },

  // Code quality
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'log', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // Form layout
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'tapeya-form-layout': tapeyaFormLayout,
    },
    rules: {
      'tapeya-form-layout/no-raw-form-field-spacing': 'error',
    },
  },

  // OTP verify — digit-cell layout, not FormStack field stack (FORM_LAYOUT_STANDARDS §4.1)
  {
    files: ['src/pages/auth/Otp.jsx'],
    rules: {
      'tapeya-form-layout/no-raw-form-field-spacing': 'off',
    },
  },

  // Formatting (aligned with Prettier)
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'arrow-parens': ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1, ignoredNodes: ['ConditionalExpression'] }],
    },
  },
];
