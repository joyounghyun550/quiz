# VS Code 설정

📍 **위치**: [홈](../00-README.md) > [개발 도구](../10-tooling/) > VS Code 설정

---

## 워크스페이스 설정

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

## 추천 익스텐션

### 필수 익스텐션

| 익스텐션                                                    | 용도              |
| ----------------------------------------------------------- | ----------------- |
| **ESLint** (`dbaeumer.vscode-eslint`)                       | 코드 린팅         |
| **Prettier** (`esbenp.prettier-vscode`)                     | 코드 포매팅       |
| **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) | Tailwind 자동완성 |

### 권장 익스텐션

| 익스텐션              | 용도                    |
| --------------------- | ----------------------- |
| **TypeScript Hero**   | Import 자동 관리        |
| **Auto Rename Tag**   | HTML/JSX 태그 자동 변경 |
| **Error Lens**        | 인라인 에러 표시        |
| **GitLens**           | Git 이력 확인           |
| **Path Intellisense** | 경로 자동완성           |

---

## extensions.json 설정

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

---

## 유용한 단축키

| 단축키             | 기능                            |
| ------------------ | ------------------------------- |
| `Ctrl + P`         | 빠른 파일 열기                  |
| `Ctrl + Shift + P` | 명령 팔레트                     |
| `Ctrl + .`         | Quick Fix (ESLint 자동 수정 등) |
| `Ctrl + D`         | 같은 단어 다중 선택             |
| `Alt + Shift + F`  | 파일 포매팅                     |
| `F2`               | 심볼 이름 변경 (리팩토링)       |
| `Ctrl + Shift + F` | 프로젝트 전체 검색              |

---

## TypeScript 설정 팁

### 자동 Import 활성화

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  "javascript.suggest.autoImports": true
}
```

### Import 경로 스타일

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## Tailwind CSS IntelliSense 설정

```json
// .vscode/settings.json
{
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]]
}
```

---

**관련 문서**:

- [ESLint / Prettier 설정](./ESLint-Prettier-설정.md)
- [Tailwind CSS 가이드](../06-code-style/Tailwind-CSS-가이드.md)

**최종 업데이트**: 2026년 2월 4일
