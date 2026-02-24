-- ============================================================
-- 중복 데이터 정리 스크립트
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

-- 1. category_lp 중복 제거 (user_id + category 기준, LP 높은 것만 남김)
DELETE FROM category_lp
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, category
             ORDER BY lp DESC, total_answered DESC
           ) as rn
    FROM category_lp
  ) ranked
  WHERE rn > 1
);

-- category_lp UNIQUE 제약 재적용
DO $$
BEGIN
  ALTER TABLE category_lp ADD CONSTRAINT category_lp_user_category_unique UNIQUE (user_id, category);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- 2. category_stats 중복 제거 (user_id + category + subcategory 기준)
DELETE FROM category_stats
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, category, subcategory
             ORDER BY total_answered DESC
           ) as rn
    FROM category_stats
  ) ranked
  WHERE rn > 1
);

-- 3. questions 중복 제거 (title 기준, 가장 오래된 것만 남김)
DELETE FROM questions
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY title
             ORDER BY created_at ASC
           ) as rn
    FROM questions
  ) ranked
  WHERE rn > 1
);

-- 4. daily_quiz_log 중복 제거 (user_id + quiz_date 기준)
DELETE FROM daily_quiz_log
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, quiz_date
             ORDER BY is_completed DESC, id ASC
           ) as rn
    FROM daily_quiz_log
  ) ranked
  WHERE rn > 1
);

-- 5. 정리 결과 확인
SELECT 'category_lp' as tbl, COUNT(*) as rows FROM category_lp
UNION ALL SELECT 'category_stats', COUNT(*) FROM category_stats
UNION ALL SELECT 'questions', COUNT(*) FROM questions
UNION ALL SELECT 'daily_quiz_log', COUNT(*) FROM daily_quiz_log
UNION ALL SELECT 'answer_history', COUNT(*) FROM answer_history
UNION ALL SELECT 'quiz_sessions', COUNT(*) FROM quiz_sessions
UNION ALL SELECT 'lp_history', COUNT(*) FROM lp_history
UNION ALL SELECT 'community_posts', COUNT(*) FROM community_posts;
