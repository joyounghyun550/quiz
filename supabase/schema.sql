-- DevRank Database Schema
-- Supabase SQL Editor에서 실행하세요

-- ========================================
-- USERS
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_image_url TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  current_lp INTEGER NOT NULL DEFAULT 0,
  current_tier TEXT NOT NULL DEFAULT 'inline',
  current_tier_division INTEGER NOT NULL DEFAULT 4,
  highest_tier TEXT NOT NULL DEFAULT 'inline',
  highest_lp INTEGER NOT NULL DEFAULT 0,
  demotion_shield_until TIMESTAMPTZ,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_quiz_completed_at DATE,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_answered INTEGER NOT NULL DEFAULT 0,
  has_completed_placement BOOLEAN NOT NULL DEFAULT FALSE,
  notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notification_time TIME NOT NULL DEFAULT '09:00:00',
  fcm_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- QUESTIONS
-- ========================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  format TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  code_snippet TEXT,
  code_language TEXT DEFAULT 'typescript',
  options JSONB,
  correct_answer TEXT NOT NULL,
  hint_1 TEXT,
  hint_2 TEXT,
  explanation TEXT NOT NULL,
  explanation_code TEXT,
  reference_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  times_served INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- QUIZ SESSIONS
-- ========================================
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  lp_change INTEGER NOT NULL DEFAULT 0
);

-- ========================================
-- ANSWER HISTORY
-- ========================================
CREATE TABLE IF NOT EXISTS public.answer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  hint_1_used BOOLEAN NOT NULL DEFAULT FALSE,
  hint_2_used BOOLEAN NOT NULL DEFAULT FALSE,
  lp_change INTEGER NOT NULL DEFAULT 0,
  time_spent_ms INTEGER,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- CATEGORY STATS
-- ========================================
CREATE TABLE IF NOT EXISTS public.category_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  total_answered INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, category, subcategory)
);

-- ========================================
-- LP HISTORY
-- ========================================
CREATE TABLE IF NOT EXISTS public.lp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lp_before INTEGER NOT NULL,
  lp_after INTEGER NOT NULL,
  lp_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- DAILY QUIZ LOG
-- ========================================
CREATE TABLE IF NOT EXISTS public.daily_quiz_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_id UUID REFERENCES public.quiz_sessions(id),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(user_id, quiz_date)
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_questions_category_difficulty ON public.questions(category, difficulty) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_answer_history_user_id ON public.answer_history(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_history_session_id ON public.answer_history(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_log_user_date ON public.daily_quiz_log(user_id, quiz_date);
CREATE INDEX IF NOT EXISTS idx_lp_history_user_id ON public.lp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_category_stats_user_id ON public.category_stats(user_id);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quiz_log ENABLE ROW LEVEL SECURITY;

-- Users: 본인 데이터만 읽기/쓰기
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Questions: 모든 인증 유저가 읽기 가능
CREATE POLICY "questions_select_all" ON public.questions FOR SELECT USING (auth.role() = 'authenticated');

-- Quiz Sessions: 본인 데이터만
CREATE POLICY "quiz_sessions_select_own" ON public.quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quiz_sessions_insert_own" ON public.quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_sessions_update_own" ON public.quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Answer History: 본인 데이터만
CREATE POLICY "answer_history_select_own" ON public.answer_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "answer_history_insert_own" ON public.answer_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Category Stats: 본인 데이터만
CREATE POLICY "category_stats_select_own" ON public.category_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "category_stats_insert_own" ON public.category_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "category_stats_update_own" ON public.category_stats FOR UPDATE USING (auth.uid() = user_id);

-- LP History: 본인 데이터만
CREATE POLICY "lp_history_select_own" ON public.lp_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "lp_history_insert_own" ON public.lp_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Quiz Log: 본인 데이터만
CREATE POLICY "daily_quiz_log_select_own" ON public.daily_quiz_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_quiz_log_insert_own" ON public.daily_quiz_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_quiz_log_update_own" ON public.daily_quiz_log FOR UPDATE USING (auth.uid() = user_id);
