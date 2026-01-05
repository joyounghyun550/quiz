/**
 * ESLint Configuration with Code Convention Rules (ESLint 8)
 *
 * 📋 주요 기능:
 * - FSD Lite 아키텍처 레이어 의존성 검사
 * - 화살표 함수 + export default 패턴 강제
 * - 네이밍 규칙 검사 (camelCase, PascalCase, UPPER_SNAKE_CASE)
 * - 완화된 규칙으로 점진적 적용 가능
 *
 * 🚀 사용법:
 *   npm run lint         - 린트 검사
 *   npm run lint:fix     - 자동 수정
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "next/core-web-vitals",
    "next/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react", "react-hooks", "@typescript-eslint", "simple-import-sort", "unicorn"],
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    "dist",
    "node_modules",
    "build",
    "public",
    ".next",
    "*.config.js",
    "*.config.ts",
    "*.config.mjs",
    "*.tsbuildinfo",
    ".env*",
    "coverage",
  ],
  rules: {
    // ========================================
    // 🎨 React 관련 규칙
    // ========================================
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/jsx-handler-names": [
      "error",
      {
        eventHandlerPrefix: "handle",
        eventHandlerPropPrefix: "on",
        checkLocalVariables: false,
        checkInlineFunction: false,
      },
    ],

    // ========================================
    // 📝 TypeScript 관련 규칙
    // ========================================
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-argument": "off",

    // ========================================
    // 🏗️ 코드 컨벤션: 함수 선언 패턴
    // ========================================
    "prefer-arrow-callback": [
      "warn",
      {
        allowNamedFunctions: true,
        allowUnboundThis: false,
      },
    ],
    "func-style": ["off"],

    // ========================================
    // 🏗️ 코드 컨벤션: 네이밍 규칙
    // ========================================
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
      },
      {
        selector: "function",
        format: ["camelCase", "PascalCase"],
      },
      {
        selector: "variable",
        modifiers: ["const"],
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: "typeAlias",
        filter: {
          regex: "Props$",
          match: true,
        },
        format: ["PascalCase"],
      },
      {
        selector: "class",
        format: ["PascalCase"],
      },
    ],

    // ========================================
    // 🔧 일반 JavaScript/ES6 규칙
    // ========================================
    "no-duplicate-imports": "error",
    "no-console": [
      "warn",
      {
        allow: ["warn", "error", "info"],
      },
    ],
    "prefer-const": "error",
    "no-var": "error",
    "no-unused-vars": "off",

    // ========================================
    // 📏 코드 품질 규칙
    // ========================================
    "prefer-template": "error",
    "object-shorthand": "error",
    "no-useless-concat": "error",

    // ========================================
    // 🏗️ 코드 컨벤션: 절대경로 사용 규칙
    // ========================================
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["./*", "../*"],
            message: "상대경로(./, ../) 사용을 금지합니다. 절대경로(@/)를 사용하세요.",
          },
        ],
      },
    ],

    // ========================================
    // 🏗️ 코드 컨벤션: Import 순서
    // ========================================
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          ["^react", "^react-dom"],
          ["^@?\\w"],
          ["^@/shared"],
          ["^@/entities"],
          ["^@/features"],
          ["^@/widgets"],
          ["^@/app"],
          ["^@/assets"],
          ["^\\."],
        ],
      },
    ],
    "simple-import-sort/exports": "error",

    // ========================================
    // 🚫 비활성화된 규칙
    // ========================================
    "@typescript-eslint/no-empty-function": "warn",
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-inferrable-types": "warn",
  },
  overrides: [
    // ========================================
    // 🧪 테스트/개발 파일용 설정
    // ========================================
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-console": "off",
        "react/display-name": "off",
        "prefer-arrow-callback": "off",
      },
    },

    // ========================================
    // ⚙️ 설정 파일용 설정
    // ========================================
    {
      files: ["*.mjs", "*.config.{js,mjs,ts}", "next.config.*", "tailwind.config.*"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "no-console": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-restricted-imports": "off",
      },
    },

    // ========================================
    // 📁 컴포넌트 파일용 설정 (App Router)
    // ========================================
    {
      files: ["src/app/**/*.tsx", "src/**/ui/**/*.tsx", "src/**/components/**/*.tsx", "src/widgets/**/*.tsx"],
      excludedFiles: ["src/app/**/layout.tsx", "src/app/**/page.tsx", "src/shared/ui/Providers.tsx"],
      rules: {
        "prefer-arrow-callback": [
          "error",
          {
            allowNamedFunctions: false,
            allowUnboundThis: false,
          },
        ],
        "func-style": [
          "error",
          "expression",
          {
            allowArrowFunctions: true,
          },
        ],
        "react/function-component-definition": [
          "error",
          {
            namedComponents: "arrow-function",
            unnamedComponents: "arrow-function",
          },
        ],
      },
    },
    // ========================================
    // 📁 Next.js 특수 파일 예외 처리
    // ========================================
    {
      files: ["src/app/**/layout.tsx", "src/app/**/page.tsx"],
      rules: {
        "react/function-component-definition": "off", // Next.js는 function 키워드 사용
        "no-restricted-syntax": "off", // metadata export 허용
      },
    },
    // ========================================
    // 📁 공유 컴포넌트 예외 처리
    // ========================================
    {
      files: ["src/shared/ui/Providers.tsx"],
      rules: {
        "no-restricted-syntax": "off", // named export 허용 (재사용 컴포넌트)
      },
    },

    // ========================================
    // 📁 Export 규칙: 컴포넌트는 default export만 허용
    // ========================================
    {
      files: ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/**/ui/**/*.tsx", "src/widgets/**/*.tsx"],
      excludedFiles: ["src/app/**/layout.tsx", "src/shared/ui/Providers.tsx"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "ExportNamedDeclaration[declaration!=null]",
            message: "컴포넌트 파일은 default export만 사용해야 합니다. named export는 index.ts에서 re-export하세요.",
          },
        ],
      },
    },

    // ========================================
    // 📁 Export 규칙: 유틸/API/훅은 named export만 허용
    // ========================================
    {
      files: ["src/**/lib/**/*.ts", "src/**/api/**/*.ts", "src/**/hooks/**/*.ts", "src/**/model/**/*.ts"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "ExportDefaultDeclaration",
            message: "유틸/API/훅/타입 파일은 named export만 사용해야 합니다. default export는 사용하지 마세요.",
          },
        ],
      },
    },

    // ========================================
    // 📁 레이어 의존성 규칙: shared
    // ========================================
    {
      files: ["src/shared/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/entities/**", "@/features/**", "@/widgets/**", "@/app/**"],
                message: "shared 레이어는 다른 레이어를 import할 수 없습니다.",
              },
            ],
          },
        ],
      },
    },

    // ========================================
    // 📁 레이어 의존성 규칙: entities
    // ========================================
    {
      files: ["src/entities/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/features/**", "@/widgets/**", "@/app/**"],
                message: "entities 레이어는 features, widgets, app을 import할 수 없습니다.",
              },
            ],
          },
        ],
      },
    },

    // ========================================
    // 📁 레이어 의존성 규칙: features
    // ========================================
    {
      files: ["src/features/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/widgets/**", "@/app/**"],
                message: "features 레이어는 widgets, app을 import할 수 없습니다.",
              },
            ],
          },
        ],
      },
    },

    // ========================================
    // 📁 레이어 의존성 규칙: widgets
    // ========================================
    {
      files: ["src/widgets/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/app/**"],
                message: "widgets 레이어는 app을 import할 수 없습니다.",
              },
            ],
          },
        ],
      },
    },

    // ========================================
    // 📁 파일명 네이밍 규칙: 컴포넌트 파일은 PascalCase
    // ========================================
    {
      files: ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/**/ui/**/*.tsx", "src/widgets/**/*.tsx"],
      rules: {
        "unicorn/filename-case": [
          "error",
          {
            case: "pascalCase",
            ignore: ["^page\\.tsx$", "^layout\\.tsx$", "^loading\\.tsx$", "^error\\.tsx$", "^not-found\\.tsx$"],
          },
        ],
      },
    },

    // ========================================
    // 📁 파일명 네이밍 규칙: 훅 파일은 kebab-case
    // ========================================
    {
      files: ["src/**/hooks/**/*.ts", "src/**/hooks/**/*.tsx"],
      rules: {
        "unicorn/filename-case": [
          "error",
          {
            case: "kebabCase",
            ignore: ["^index\\.tsx?$"],
          },
        ],
      },
    },

    // ========================================
    // 📁 파일명 네이밍 규칙: API 파일은 kebab-case
    // ========================================
    {
      files: ["src/**/api/**/*.ts"],
      rules: {
        "unicorn/filename-case": [
          "error",
          {
            case: "kebabCase",
            ignore: ["^index\\.ts$"],
          },
        ],
      },
    },

    // ========================================
    // 📁 파일명 네이밍 규칙: 유틸 파일은 kebab-case
    // ========================================
    {
      files: ["src/**/lib/**/*.ts"],
      rules: {
        "unicorn/filename-case": [
          "error",
          {
            case: "kebabCase",
            ignore: ["^index\\.ts$"],
          },
        ],
      },
    },
  ],
};

