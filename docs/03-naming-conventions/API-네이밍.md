# API 네이밍 규칙

📍 **위치**: [홈](../00-README.md) > [네이밍 규칙](../03-naming-conventions/) > API 네이밍

---

## API 함수 네이밍: `동작 + 엔티티 + 조건`

### 인증 API (features/auth/api/auth.api.ts)

```typescript
export const getCurrentUserProfile = async (): Promise<UserProfile> => { ... }
export const saveTermsAgreement = async (data: SaveTermsAgreementRequest): Promise<void> => { ... }
export const withdrawUser = async (data: WithdrawRequest): Promise<void> => { ... }
```

### 채팅 API (features/chat/api/chat.api.ts)

```typescript
export const getChatSessions = async (): Promise<ChatSession[]> => { ... }
export const deleteChatSession = async (sessionId: string): Promise<void> => { ... }
export const sendChatMessage = async (data: SendMessageRequest): Promise<ChatMessage> => { ... }
```

### 게시글 API (features/post/api/post.api.ts)

```typescript
export const getPosts = async (params: GetPostsRequest): Promise<GetPostsResponse> => { ... }
export const getPostById = async (id: string): Promise<Post> => { ... }
export const createPost = async (data: CreatePostRequest): Promise<Post> => { ... }
export const updatePost = async (id: string, data: UpdatePostRequest): Promise<Post> => { ... }
export const deletePost = async (id: string): Promise<void> => { ... }
```

---

## API 타입 네이밍

### 인증 타입 (features/auth/api/auth.api.type.ts)

```typescript
export type UserProfile = { ... }
export type SaveTermsAgreementRequest = { ... }
export type WithdrawRequest = { ... }
```

### 채팅 타입 (features/chat/api/chat.api.type.ts)

```typescript
export type ChatSession = { ... }
export type SendMessageRequest = { ... }
export type ChatMessage = { ... }
```

### 게시글 타입 (features/post/api/post.api.type.ts)

```typescript
export type Post = { ... }
export type GetPostsRequest = { ... }
export type GetPostsResponse = { ... }
export type CreatePostRequest = { ... }
export type UpdatePostRequest = { ... }
```

---

## 네이밍 패턴

### 조회 (GET)

- `get + 엔티티 (복수형)`: 목록 조회
  - `getPosts`, `getChatSessions`
- `get + 엔티티 + By + 조건`: 단일 조회
  - `getPostById`, `getUserByEmail`
- `get + Current + 엔티티`: 현재 사용자/세션 조회
  - `getCurrentUserProfile`, `getCurrentSession`

### 생성 (POST)

- `create + 엔티티`
  - `createPost`, `createChatSession`

### 수정 (PUT/PATCH)

- `update + 엔티티`
  - `updatePost`, `updateUserProfile`
- `save + 엔티티` (생성 또는 수정)
  - `saveTermsAgreement`, `saveChatHistory`

### 삭제 (DELETE)

- `delete + 엔티티`
  - `deletePost`, `deleteChatSession`
- `withdraw + 엔티티` (회원탈퇴 등 특수 삭제)
  - `withdrawUser`

### 기타 동작

- `send + 엔티티`
  - `sendChatMessage`, `sendEmail`
- `verify + 엔티티`
  - `verifyEmail`, `verifyToken`

---

## 파일 구조

```
features/[도메인]/api/
├── [도메인].api.ts         # API 함수
├── [도메인].api.type.ts    # API 타입
└── index.ts                # re-export
```

### 예시

```
features/post/api/
├── post.api.ts
├── post.api.type.ts
└── index.ts
```

---

**관련 문서**:

- [TanStack Query 네이밍](./TanStack-Query-네이밍.md)
- [네이밍 규칙 총정리](./네이밍-규칙-총정리.md)
- [폴더 구조](../02-architecture/폴더-구조.md)

**최종 업데이트**: 2026년 2월 4일
