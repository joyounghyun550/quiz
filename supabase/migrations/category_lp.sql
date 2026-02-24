-- =============================================================
-- Category LP Table Migration
-- Supabase 대시보드 SQL Editor에서 실행하세요.
-- =============================================================

-- 1. category_lp 테이블 생성
CREATE TABLE IF NOT EXISTS public.category_lp (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category    TEXT        NOT NULL,
  lp          INTEGER     NOT NULL DEFAULT 0,
  total_answered INTEGER  NOT NULL DEFAULT 0,
  total_correct  INTEGER  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category)
);

-- 2. RLS 활성화
ALTER TABLE public.category_lp ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 (자신의 데이터만 쓰기 가능)
CREATE POLICY "Users can select own category_lp"
  ON public.category_lp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category_lp"
  ON public.category_lp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category_lp"
  ON public.category_lp FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. 인덱스 (카테고리별 순위 조회 최적화)
CREATE INDEX IF NOT EXISTS category_lp_user_id_idx
  ON public.category_lp (user_id);

CREATE INDEX IF NOT EXISTS category_lp_category_lp_desc_idx
  ON public.category_lp (category, lp DESC);
