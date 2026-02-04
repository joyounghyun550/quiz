# 라이브러리 가이드

📍 **위치**: [홈](../00-README.md) > [라이브러리](../09-libraries/) > 00-README

---

## 📦 필수 라이브러리

이 boilerplate에 기본 포함된 라이브러리입니다. 모든 프로젝트에서 사용합니다.

| 라이브러리         | 용도                 | 문서                                    |
| ------------------ | -------------------- | --------------------------------------- |
| **TanStack Query** | 서버 상태 관리       | [주요 라이브러리](./주요-라이브러리.md) |
| **Zustand**        | 클라이언트 상태 관리 | [주요 라이브러리](./주요-라이브러리.md) |
| **axios**          | HTTP 클라이언트      | [주요 라이브러리](./주요-라이브러리.md) |
| **sonner**         | 토스트 알림          | [주요 라이브러리](./주요-라이브러리.md) |

자세한 사용법: [주요-라이브러리.md](./주요-라이브러리.md)

---

## 🔧 선택적 라이브러리

프로젝트 필요에 따라 추가할 수 있는 라이브러리입니다.

### 사내 공통 컴포넌트

- **[@itandsy/react-common](./optional/itandsy-react-common.md)** - 사내 공통 UI 컴포넌트 라이브러리
  - 사용 시기: 사내 프로젝트에서 공통 디자인 시스템이 필요한 경우
  - 설치: `npm install @itandsy/react-common`

### 기타 추천 라이브러리

프로젝트 요구사항에 따라 추가 고려:

| 라이브러리        | 용도          | 설치 명령                     |
| ----------------- | ------------- | ----------------------------- |
| `react-hook-form` | 폼 관리       | `npm install react-hook-form` |
| `zod`             | 스키마 검증   | `npm install zod`             |
| `date-fns`        | 날짜 처리     | `npm install date-fns`        |
| `lodash-es`       | 유틸리티 함수 | `npm install lodash-es`       |
| `framer-motion`   | 애니메이션    | `npm install framer-motion`   |

---

## 📋 라이브러리 추가 가이드

### 1. 라이브러리 설치

```bash
npm install <library-name>
```

### 2. 타입 정의 설치 (필요시)

```bash
npm install --save-dev @types/<library-name>
```

### 3. 문서화 (권장)

새 라이브러리를 추가한 경우:

1. **주요 라이브러리**: `docs/09-libraries/주요-라이브러리.md`에 추가
2. **선택적 라이브러리**: `docs/09-libraries/optional/`에 별도 파일 생성
3. **Quick Start**: 중요한 경우 `docs/01-onboarding/Quick-Start.md`에 언급

### 4. 사용 패턴 정의

- 컴포넌트에서 어떻게 사용할지 예시 작성
- 주의사항 및 Best Practice 정리
- 관련 설정 파일 업데이트 (필요시)

---

## ⚠️ 라이브러리 선택 원칙

### DO ✅

- **프로젝트 요구사항에 맞는 라이브러리 선택**
- **유지보수가 활발한 라이브러리 우선**
- **타입 정의가 제공되는 라이브러리 선호**
- **번들 사이즈 고려** (가벼운 대안이 있다면 검토)

### DON'T ❌

- **중복 기능의 라이브러리 설치 지양** (예: axios + fetch wrapper 동시 사용)
- **오래된 라이브러리 피하기** (최근 1년 이내 업데이트 확인)
- **과도한 라이브러리 의존 지양** (직접 구현 가능한 간단한 기능)

---

## 📚 관련 문서

- [주요 라이브러리 상세 가이드](./주요-라이브러리.md)
- [선택적 라이브러리 목록](./optional/)
- [TanStack Query 사용법](../08-state-management/TanStack-Query-사용법.md)
- [Zustand 스토어 규칙](../08-state-management/Zustand-스토어-규칙.md)

---

**최종 업데이트**: 2026년 2월 4일
