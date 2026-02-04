# @itandsy/react-common 가이드

📍 **위치**: [홈](../00-README.md) > [라이브러리](../09-libraries/) > @itandsy/react-common

---

## 개요

모든 프로젝트에서 사용하는 사내 공통 UI 컴포넌트 라이브러리입니다.

### 설치

```bash
npm install @itandsy/react-common
```

---

## 주요 컴포넌트

| 컴포넌트            | 용도                | 예시               |
| ------------------- | ------------------- | ------------------ |
| `SolidPrimary`      | 주요 액션 버튼      | 로그인, 제출, 저장 |
| `SolidSecondary`    | 보조 액션 버튼      | 취소, 뒤로가기     |
| `OutlinedPrimary`   | 아웃라인 주요 버튼  | 필터, 정렬         |
| `OutlinedSecondary` | 아웃라인 보조 버튼  | 더보기, 옵션       |
| `TextBox`           | 텍스트 입력 필드    | 폼 입력, 검색      |
| `TextArea`          | 여러 줄 텍스트 입력 | 댓글, 설명         |
| `SelectBox`         | 드롭다운 선택       | 카테고리 선택      |
| `CheckBox`          | 체크박스            | 약관 동의          |
| `RadioButton`       | 라디오 버튼         | 단일 선택          |
| `Modal`             | 모달 다이얼로그     | 확인창, 폼         |
| `Toast`             | 토스트 알림         | 성공/에러 메시지   |
| `Spinner`           | 로딩 스피너         | 데이터 로딩        |

---

## 사용 예시

```tsx
import { SolidPrimary, SolidSecondary, TextBox, Modal } from "@itandsy/react-common";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form className="flex flex-col gap-4">
      <TextBox label="이메일" value={email} onChange={setEmail} placeholder="이메일을 입력하세요" />
      <TextBox
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="비밀번호를 입력하세요"
      />
      <div className="flex gap-2">
        <SolidSecondary label="취소" onClick={handleCancel} />
        <SolidPrimary label="로그인" onClick={handleLogin} disabled={isLoading} />
      </div>
    </form>
  );
};
```

---

## 버튼 컴포넌트 사용 규칙

```tsx
// ✅ 올바른 사용
<SolidPrimary label="저장" onClick={handleSave} />
<SolidPrimary label="저장" onClick={handleSave} disabled={isLoading} />
<SolidSecondary label="취소" onClick={handleCancel} />
<OutlinedPrimary label="필터" onClick={toggleFilter} />

// ❌ 잘못된 사용 - children 대신 label prop 사용
<SolidPrimary onClick={handleSave}>저장</SolidPrimary>
```

---

## TextBox 컴포넌트 사용 규칙

```tsx
// ✅ 올바른 사용 - onChange는 value만 받음
<TextBox
  value={value}
  onChange={setValue}  // (value: string) => void
  placeholder="입력하세요"
/>

// ref 사용 시
<TextBox
  ref={textBoxRef}
  value={value}
  onChange={setValue}
/>

// ❌ 잘못된 사용 - event 객체를 받지 않음
<TextBox
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

## 자주하는 실수

| ❌ 잘못된 사용                               | ✅ 올바른 사용                  | 설명                      |
| -------------------------------------------- | ------------------------------- | ------------------------- |
| `<SolidPrimary>저장</SolidPrimary>`          | `<SolidPrimary label="저장" />` | children 대신 label prop  |
| `onChange={(e) => setValue(e.target.value)}` | `onChange={setValue}`           | TextBox는 value 직접 전달 |

---

**관련 문서**:

- [Quick Start](../01-onboarding/Quick-Start.md)
- [컴포넌트 구조](../06-code-style/컴포넌트-구조.md)
- [주요 라이브러리](./주요-라이브러리.md)

**최종 업데이트**: 2026년 2월 4일
