# ESLint / Prettier 설정

📍 **위치**: [홈](../00-README.md) > [개발 도구](../10-tooling/) > ESLint / Prettier 설정

---

## ESLint 권장 설정

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier", // Prettier와 충돌하는 규칙 비활성화 (마지막에 위치)
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // TypeScript
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

    // React
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Import 정렬
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", ["parent", "sibling"], "index", "type"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],

    // 일반
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
};
```

---

## Prettier 권장 설정

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## 권장 패키지

```bash
# ESLint
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-config-next eslint-config-prettier
npm install -D eslint-plugin-import eslint-import-resolver-typescript

# Prettier
npm install -D prettier prettier-plugin-tailwindcss
```

---

## VS Code 설정

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never" // ESLint import/order 사용
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## .eslintignore / .prettierignore

```
# .eslintignore / .prettierignore
node_modules/
.next/
out/
build/
dist/
coverage/
*.config.js
*.config.ts
```

---

**관련 문서**:

- [VS Code 설정](./VS-Code-설정.md)
- [컴포넌트 구조](../06-code-style/컴포넌트-구조.md)

**최종 업데이트**: 2026년 2월 4일
