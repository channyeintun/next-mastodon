import css from "@eslint/css";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  // Ignore patterns
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "out/**",
      "*.min.css",
    ]
  },
  // TypeScript files configuration
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // Add any base TypeScript rules here if needed
    },
  },
  // Lint CSS files for baseline compatibility
  {
    files: ["src/**/*.css"],
    plugins: {
      css,
    },
    language: "css/css",
    rules: {
      "css/no-duplicate-imports": "error",
      "css/no-empty-blocks": "error",
      "css/use-baseline": ["warn", {
        available: "widely"
      }]
    },
  },
  // Atomic Design - LOC limits for atoms
  {
    files: ["src/components/atoms/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "max-lines": ["error", {
        max: 120,
        skipBlankLines: true,
        skipComments: true
      }],
      "max-lines-per-function": ["error", {
        max: 50,
        skipBlankLines: true,
        skipComments: true
      }]
    }
  },
  // Atomic Design - LOC limits for molecules
  {
    files: ["src/components/molecules/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "max-lines": ["error", {
        max: 200,
        skipBlankLines: true,
        skipComments: true
      }],
      "max-lines-per-function": ["error", {
        max: 80,
        skipBlankLines: true,
        skipComments: true
      }]
    }
  },
  // Atomic Design - LOC limits for organisms
  {
    files: ["src/components/organisms/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "max-lines": ["error", {
        max: 350,
        skipBlankLines: true,
        skipComments: true
      }],
      "max-lines-per-function": ["error", {
        max: 80,
        skipBlankLines: true,
        skipComments: true
      }]
    }
  },
  // Pages should only orchestrate organisms
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "max-lines": ["error", {
        max: 300,
        skipBlankLines: true,
        skipComments: true
      }],
      "max-lines-per-function": ["error", {
        max: 100,
        skipBlankLines: true,
        skipComments: true
      }]
    }
  },
];
