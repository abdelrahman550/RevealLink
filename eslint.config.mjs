import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Flat ESLint config. `eslint-config-next` ships a flat-config array in v16,
 * so it can be spread directly.
 */
const config = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", ".agents/**"],
  },
];

export default config;
