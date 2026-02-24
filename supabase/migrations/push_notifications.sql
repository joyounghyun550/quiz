-- Web Push 구독 정보 저장 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS push_subscription JSONB DEFAULT NULL;
