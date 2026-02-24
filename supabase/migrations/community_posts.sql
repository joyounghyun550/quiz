-- =============================================================
-- Community Posts Table Migration
-- Supabase 대시보드 SQL Editor에서 실행하세요.
-- =============================================================

-- 1. community_posts 테이블 생성
CREATE TABLE IF NOT EXISTS public.community_posts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID        REFERENCES public.questions(id) ON DELETE CASCADE,
  parent_id   UUID        REFERENCES public.community_posts(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL CHECK (type IN ('comment', 'question', 'discussion')),
  title       TEXT,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 (모든 인증 유저가 읽기 가능, 자기 글만 쓰기/수정/삭제)
CREATE POLICY "Authenticated users can read all posts"
  ON public.community_posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. 인덱스
CREATE INDEX IF NOT EXISTS community_posts_user_id_idx ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS community_posts_question_id_idx ON public.community_posts(question_id);
CREATE INDEX IF NOT EXISTS community_posts_parent_id_idx ON public.community_posts(parent_id);
CREATE INDEX IF NOT EXISTS community_posts_type_created_idx ON public.community_posts(type, created_at DESC);
