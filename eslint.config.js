import css from "@eslint/css";

/**
 * ESLint is scoped to CSS only.
 *
 * TypeScript/TSX linting moved to oxlint (see .oxlintrc.json), which parses TS
 * with its own Rust parser. typescript-eslint hard-throws on TypeScript 7 —
 * it requires the JS compiler API that the native compiler no longer exposes —
 * so keeping it here would break linting entirely. Tracking issue for their
 * TS >=7.1 support: https://github.com/typescript-eslint/typescript-eslint/issues/10940
 *
 * @eslint/css has no such dependency, so baseline CSS checking stays here.
 */
export default [
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
];
