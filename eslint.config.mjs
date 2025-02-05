import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",  // Desativa erro de variável não utilizada
      "prefer-const": "off",                     // Desativa recomendação de usar const
      "@next/next/no-img-element": "off"         // Desativa a advertência sobre <img>
    },
  },
];

export default eslintConfig;
