import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    "plugins": ["react-compiler", "simple-import-sort"],
    rules: {
      "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "react-compiler/react-compiler": "error"
    },
  }),
]

export default eslintConfig