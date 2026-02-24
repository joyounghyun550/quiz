-- =============================================
-- Phase 5~8 DB Migration
-- Supabase SQL Editor에서 실행
-- =============================================

-- =============================================
-- Phase 5: 시즌 시스템
-- =============================================

CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season_number INTEGER NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.season_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  final_lp INTEGER NOT NULL DEFAULT 0,
  final_tier TEXT NOT NULL DEFAULT 'inline',
  final_rank INTEGER,
  total_quizzes INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(season_id, user_id)
);

-- 시즌 RLS
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seasons_select" ON public.seasons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "season_records_select" ON public.season_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "season_records_insert" ON public.season_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "season_records_update" ON public.season_records
  FOR UPDATE USING (auth.uid() = user_id);

-- 현재 시즌 1 데이터 삽입 (2025년 1~3월)
INSERT INTO public.seasons (name, season_number, start_date, end_date, is_active)
VALUES ('시즌 1', 1, '2025-01-01', '2025-03-31', FALSE)
ON CONFLICT (season_number) DO NOTHING;

-- 시즌 2 (2025년 4~6월)
INSERT INTO public.seasons (name, season_number, start_date, end_date, is_active)
VALUES ('시즌 2', 2, '2025-04-01', '2025-06-30', FALSE)
ON CONFLICT (season_number) DO NOTHING;

-- 시즌 3 (2025년 7~9월)
INSERT INTO public.seasons (name, season_number, start_date, end_date, is_active)
VALUES ('시즌 3', 3, '2025-07-01', '2025-09-30', FALSE)
ON CONFLICT (season_number) DO NOTHING;

-- 시즌 4 (2025년 10~12월)
INSERT INTO public.seasons (name, season_number, start_date, end_date, is_active)
VALUES ('시즌 4', 4, '2025-10-01', '2025-12-31', FALSE)
ON CONFLICT (season_number) DO NOTHING;

-- 시즌 5 (2026년 1~3월) - 현재 활성
INSERT INTO public.seasons (name, season_number, start_date, end_date, is_active)
VALUES ('시즌 5', 5, '2026-01-01', '2026-03-31', TRUE)
ON CONFLICT (season_number) DO NOTHING;


-- =============================================
-- Phase 6: 오늘의 한줄 팁
-- =============================================

CREATE TABLE IF NOT EXISTS public.daily_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  code_snippet TEXT,
  reference_url TEXT,
  tip_date DATE NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tip_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES public.daily_tips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

-- 팁 RLS
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tips_select" ON public.daily_tips
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "bookmarks_select" ON public.tip_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert" ON public.tip_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks_delete" ON public.tip_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- 샘플 팁 데이터 (7일분)
INSERT INTO public.daily_tips (category, title, content, code_snippet, tip_date) VALUES
('javascript', '옵셔널 체이닝 (?.) 활용', '깊은 객체 접근 시 옵셔널 체이닝을 사용하면 중간에 null/undefined가 있어도 에러 없이 undefined를 반환합니다.', 'const city = user?.address?.city ?? "알 수 없음";', CURRENT_DATE),
('react', 'useCallback vs useMemo', 'useCallback은 함수를 메모이제이션하고, useMemo는 값을 메모이제이션합니다. 자식 컴포넌트에 콜백을 넘길 때 useCallback을 사용하세요.', 'const handleClick = useCallback(() => {\n  setCount(c => c + 1);\n}, []);', CURRENT_DATE + INTERVAL '1 day'),
('typescript', '제네릭 기본값 지정', 'TypeScript 제네릭에 기본 타입을 지정할 수 있습니다. API 응답 래퍼 등에 유용합니다.', 'type ApiResponse<T = unknown> = {\n  data: T;\n  error: string | null;\n};', CURRENT_DATE + INTERVAL '2 days'),
('css', 'clamp()로 반응형 폰트', 'CSS clamp() 함수로 미디어 쿼리 없이 반응형 폰트 크기를 구현할 수 있습니다.', 'font-size: clamp(1rem, 2.5vw, 2rem);', CURRENT_DATE + INTERVAL '3 days'),
('nextjs', 'Server Actions 활용', 'Next.js 14의 Server Actions를 사용하면 별도 API 라우트 없이 서버 함수를 직접 호출할 수 있습니다.', '"use server"\n\nexport async function createPost(formData: FormData) {\n  const title = formData.get("title");\n  // DB 저장 로직\n}', CURRENT_DATE + INTERVAL '4 days'),
('javascript', 'structuredClone으로 깊은 복사', 'JSON.parse(JSON.stringify())보다 structuredClone()이 더 안전하고 빠릅니다. Date, Map, Set도 올바르게 복사됩니다.', 'const original = { date: new Date(), items: [1, 2] };\nconst copy = structuredClone(original);', CURRENT_DATE + INTERVAL '5 days'),
('react', 'key prop으로 컴포넌트 리셋', 'key를 변경하면 React가 컴포넌트를 언마운트하고 새로 마운트합니다. state 리셋에 활용할 수 있습니다.', '<UserForm key={selectedUserId} userId={selectedUserId} />', CURRENT_DATE + INTERVAL '6 days')
ON CONFLICT (tip_date) DO NOTHING;


-- =============================================
-- Phase 7: 1v1 친구 대결
-- =============================================

CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.quiz_sessions(id),
  status TEXT NOT NULL DEFAULT 'waiting',
  question_count INTEGER NOT NULL DEFAULT 5,
  category TEXT,
  host_score INTEGER NOT NULL DEFAULT 0,
  host_correct INTEGER NOT NULL DEFAULT 0,
  host_time_ms INTEGER NOT NULL DEFAULT 0,
  guest_score INTEGER NOT NULL DEFAULT 0,
  guest_correct INTEGER NOT NULL DEFAULT 0,
  guest_time_ms INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE TABLE IF NOT EXISTS public.battle_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  question_order INTEGER NOT NULL,
  UNIQUE(battle_id, question_order)
);

-- 대결 RLS
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "battles_select" ON public.battles
  FOR SELECT USING (auth.uid() IN (host_id, guest_id));

CREATE POLICY "battles_insert" ON public.battles
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "battles_update" ON public.battles
  FOR UPDATE USING (auth.uid() IN (host_id, guest_id));

CREATE POLICY "battle_questions_select" ON public.battle_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.battles WHERE id = battle_id AND auth.uid() IN (host_id, guest_id))
  );

CREATE POLICY "battle_questions_insert" ON public.battle_questions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.battles WHERE id = battle_id AND auth.uid() = host_id)
  );


-- =============================================
-- Phase 8: 스킬 트리
-- =============================================

CREATE TABLE IF NOT EXISTS public.skill_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  parent_id UUID REFERENCES public.skill_nodes(id),
  required_correct INTEGER NOT NULL DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category, subcategory)
);

CREATE TABLE IF NOT EXISTS public.user_skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.skill_nodes(id) ON DELETE CASCADE,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_answered INTEGER NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, node_id)
);

-- 스킬 트리 RLS
ALTER TABLE public.skill_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_nodes_select" ON public.skill_nodes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "skill_progress_select" ON public.user_skill_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "skill_progress_insert" ON public.user_skill_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skill_progress_update" ON public.user_skill_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 스킬 노드 시드 데이터
-- =============================================

-- JavaScript 스킬 트리
INSERT INTO public.skill_nodes (category, subcategory, name, description, icon, required_correct, sort_order) VALUES
('javascript', 'variables', '변수 & 타입', 'var, let, const와 원시/참조 타입의 차이를 이해합니다', '📦', 5, 1),
('javascript', 'scope', '스코프', '함수 스코프, 블록 스코프, 렉시컬 스코프를 이해합니다', '🔍', 5, 2),
('javascript', 'closure', '클로저', '클로저의 동작 원리와 활용 패턴을 마스터합니다', '🔒', 8, 3),
('javascript', 'arrays', '배열', '배열 메서드와 이터레이션을 능숙하게 사용합니다', '📋', 5, 4),
('javascript', 'higher_order', '고차 함수', 'map, filter, reduce 등 고차 함수를 마스터합니다', '⚡', 8, 5),
('javascript', 'objects', '객체', '객체 생성, 속성 접근, 디스트럭처링을 이해합니다', '🧱', 5, 6),
('javascript', 'prototype', '프로토타입', '프로토타입 체인과 상속 메커니즘을 이해합니다', '🔗', 8, 7),
('javascript', 'class', '클래스', 'ES6 클래스 문법과 상속 패턴을 마스터합니다', '🏛️', 8, 8),
('javascript', 'async', '비동기', '콜백, Promise, async/await의 동작을 이해합니다', '⏳', 5, 9),
('javascript', 'promise', 'Promise', 'Promise 체이닝, all, race 등을 마스터합니다', '🤝', 8, 10),
('javascript', 'async_await', 'async/await', 'async/await 패턴과 에러 핸들링을 마스터합니다', '✨', 8, 11),
('javascript', 'dom', 'DOM', 'DOM 조작과 이벤트 처리를 이해합니다', '🌐', 5, 12),
('javascript', 'events', '이벤트', '이벤트 버블링, 캡처링, 위임을 마스터합니다', '🎯', 8, 13)
ON CONFLICT (category, subcategory) DO NOTHING;

-- React 스킬 트리
INSERT INTO public.skill_nodes (category, subcategory, name, description, icon, required_correct, sort_order) VALUES
('react', 'jsx', 'JSX', 'JSX 문법과 변환 원리를 이해합니다', '⚛️', 5, 1),
('react', 'components', '컴포넌트', '함수 컴포넌트와 컴포넌트 합성을 이해합니다', '🧩', 5, 2),
('react', 'props', 'Props', 'Props 전달과 children 패턴을 마스터합니다', '📨', 5, 3),
('react', 'useState', 'useState', 'useState 훅의 동작과 상태 업데이트를 이해합니다', '💾', 5, 4),
('react', 'useEffect', 'useEffect', 'useEffect의 라이프사이클과 클린업을 마스터합니다', '🔄', 8, 5),
('react', 'useRef', 'useRef', 'useRef로 DOM 접근과 값 보존을 이해합니다', '📌', 5, 6),
('react', 'useContext', 'useContext', 'Context API로 전역 상태를 관리합니다', '🌍', 5, 7),
('react', 'useReducer', 'useReducer', 'useReducer로 복잡한 상태 로직을 관리합니다', '🔀', 8, 8),
('react', 'custom_hooks', '커스텀 훅', '재사용 가능한 커스텀 훅을 설계합니다', '🪝', 10, 9),
('react', 'rendering', '리렌더링', 'React 렌더링 프로세스와 최적화를 이해합니다', '🖥️', 5, 10),
('react', 'memo', 'memo/useMemo', 'React.memo와 useMemo로 성능을 최적화합니다', '🧠', 8, 11),
('react', 'useCallback', 'useCallback', 'useCallback으로 함수 메모이제이션을 활용합니다', '📎', 8, 12),
('react', 'routing', '라우팅', 'React 라우팅 개념과 Next.js 라우팅을 이해합니다', '🛤️', 5, 13),
('react', 'ssr', 'SSR/SSG', '서버 사이드 렌더링과 정적 생성을 이해합니다', '🖨️', 8, 14)
ON CONFLICT (category, subcategory) DO NOTHING;

-- TypeScript 스킬 트리
INSERT INTO public.skill_nodes (category, subcategory, name, description, icon, required_correct, sort_order) VALUES
('typescript', 'basic_types', '기본 타입', 'string, number, boolean 등 기본 타입을 이해합니다', '🏷️', 5, 1),
('typescript', 'interfaces', '인터페이스', 'interface와 type의 차이와 활용법을 이해합니다', '📐', 5, 2),
('typescript', 'generics', '제네릭', '제네릭 타입과 제약 조건을 마스터합니다', '🔧', 8, 3),
('typescript', 'utility_types', '유틸리티 타입', 'Partial, Pick, Omit 등 유틸리티 타입을 활용합니다', '🛠️', 8, 4),
('typescript', 'type_guards', '타입 가드', '타입 내로잉과 커스텀 타입 가드를 마스터합니다', '🛡️', 8, 5),
('typescript', 'advanced', '고급 타입', '조건부 타입, 매핑 타입 등 고급 기법을 이해합니다', '🎓', 10, 6)
ON CONFLICT (category, subcategory) DO NOTHING;

-- CSS 스킬 트리
INSERT INTO public.skill_nodes (category, subcategory, name, description, icon, required_correct, sort_order) VALUES
('css', 'selectors', '셀렉터', 'CSS 셀렉터 우선순위와 결합자를 이해합니다', '🎯', 5, 1),
('css', 'box_model', '박스 모델', 'margin, padding, border와 box-sizing을 이해합니다', '📦', 5, 2),
('css', 'flexbox', 'Flexbox', 'Flexbox 레이아웃을 능숙하게 사용합니다', '📐', 8, 3),
('css', 'grid', 'Grid', 'CSS Grid 레이아웃을 마스터합니다', '🔲', 8, 4),
('css', 'responsive', '반응형', '미디어 쿼리와 반응형 디자인을 구현합니다', '📱', 8, 5),
('css', 'animation', '애니메이션', 'CSS 트랜지션과 애니메이션을 활용합니다', '🎬', 8, 6)
ON CONFLICT (category, subcategory) DO NOTHING;

-- Next.js 스킬 트리
INSERT INTO public.skill_nodes (category, subcategory, name, description, icon, required_correct, sort_order) VALUES
('nextjs', 'app_router', 'App Router', 'Next.js App Router의 구조를 이해합니다', '🗂️', 5, 1),
('nextjs', 'server_components', '서버 컴포넌트', 'RSC와 클라이언트 컴포넌트의 차이를 이해합니다', '🖥️', 8, 2),
('nextjs', 'data_fetching', '데이터 페칭', 'fetch, cache, revalidation을 마스터합니다', '📡', 8, 3),
('nextjs', 'middleware', '미들웨어', 'Next.js 미들웨어로 요청을 제어합니다', '🔀', 8, 4),
('nextjs', 'optimization', '최적화', 'Image, Font, 번들 최적화를 활용합니다', '🚀', 8, 5)
ON CONFLICT (category, subcategory) DO NOTHING;

-- Web Fundamentals 스킬 트리
INSERT INTO public.skill_nodes (category, subcategory, name, description, icon, required_correct, sort_order) VALUES
('web_fundamentals', 'http', 'HTTP', 'HTTP 메서드, 상태 코드, 헤더를 이해합니다', '🌐', 5, 1),
('web_fundamentals', 'browser', '브라우저 동작', '렌더링 파이프라인과 Critical Path를 이해합니다', '🔍', 8, 2),
('web_fundamentals', 'security', '웹 보안', 'XSS, CSRF, CORS 등 보안 개념을 이해합니다', '🔐', 8, 3),
('web_fundamentals', 'performance', '성능 최적화', 'Core Web Vitals와 성능 측정을 이해합니다', '⚡', 8, 4),
('web_fundamentals', 'accessibility', '접근성', 'WAI-ARIA와 웹 접근성 기준을 이해합니다', '♿', 8, 5)
ON CONFLICT (category, subcategory) DO NOTHING;

-- 부모-자식 관계 설정 (JavaScript)
UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'javascript' AND subcategory = 'variables')
WHERE category = 'javascript' AND subcategory = 'scope';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'javascript' AND subcategory = 'scope')
WHERE category = 'javascript' AND subcategory = 'closure';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'javascript' AND subcategory = 'arrays')
WHERE category = 'javascript' AND subcategory = 'higher_order';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'javascript' AND subcategory = 'objects')
WHERE category = 'javascript' AND subcategory = 'prototype';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'javascript' AND subcategory = 'prototype')
WHERE category = 'javascript' AND subcategory = 'class';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'javascript' AND subcategory = 'async')
WHERE category = 'javascript' AND subcategory = 'promise';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'javascript' AND subcategory = 'promise')
WHERE category = 'javascript' AND subcategory = 'async_await';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'javascript' AND subcategory = 'dom')
WHERE category = 'javascript' AND subcategory = 'events';

-- 부모-자식 관계 설정 (React)
UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'react' AND subcategory = 'jsx')
WHERE category = 'react' AND subcategory = 'components';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'react' AND subcategory = 'components')
WHERE category = 'react' AND subcategory = 'props';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'react' AND subcategory = 'useEffect')
WHERE category = 'react' AND subcategory = 'useRef';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'react' AND subcategory = 'useContext')
WHERE category = 'react' AND subcategory = 'useReducer';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'react' AND subcategory = 'useReducer')
WHERE category = 'react' AND subcategory = 'custom_hooks';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'react' AND subcategory = 'rendering')
WHERE category = 'react' AND subcategory = 'memo';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'react' AND subcategory = 'memo')
WHERE category = 'react' AND subcategory = 'useCallback';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'react' AND subcategory = 'routing')
WHERE category = 'react' AND subcategory = 'ssr';

-- 부모-자식 관계 설정 (TypeScript)
UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'typescript' AND subcategory = 'basic_types')
WHERE category = 'typescript' AND subcategory = 'interfaces';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'typescript' AND subcategory = 'interfaces')
WHERE category = 'typescript' AND subcategory = 'generics';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'typescript' AND subcategory = 'generics')
WHERE category = 'typescript' AND subcategory = 'utility_types';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'typescript' AND subcategory = 'generics')
WHERE category = 'typescript' AND subcategory = 'type_guards';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'typescript' AND subcategory = 'type_guards')
WHERE category = 'typescript' AND subcategory = 'advanced';

-- 부모-자식 관계 설정 (CSS)
UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'css' AND subcategory = 'selectors')
WHERE category = 'css' AND subcategory = 'box_model';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'css' AND subcategory = 'box_model')
WHERE category = 'css' AND subcategory = 'flexbox';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'css' AND subcategory = 'flexbox')
WHERE category = 'css' AND subcategory = 'grid';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'css' AND subcategory = 'grid')
WHERE category = 'css' AND subcategory = 'responsive';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'css' AND subcategory = 'responsive')
WHERE category = 'css' AND subcategory = 'animation';

-- 부모-자식 관계 설정 (Next.js)
UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'nextjs' AND subcategory = 'app_router')
WHERE category = 'nextjs' AND subcategory = 'server_components';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'nextjs' AND subcategory = 'server_components')
WHERE category = 'nextjs' AND subcategory = 'data_fetching';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'nextjs' AND subcategory = 'data_fetching')
WHERE category = 'nextjs' AND subcategory = 'middleware';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'nextjs' AND subcategory = 'middleware')
WHERE category = 'nextjs' AND subcategory = 'optimization';

-- 부모-자식 관계 설정 (Web Fundamentals)
UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'web_fundamentals' AND subcategory = 'http')
WHERE category = 'web_fundamentals' AND subcategory = 'browser';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'web_fundamentals' AND subcategory = 'browser')
WHERE category = 'web_fundamentals' AND subcategory = 'security';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'web_fundamentals' AND subcategory = 'security')
WHERE category = 'web_fundamentals' AND subcategory = 'performance';

UPDATE public.skill_nodes SET parent_id = (SELECT id FROM public.skill_nodes WHERE category = 'web_fundamentals' AND subcategory = 'performance')
WHERE category = 'web_fundamentals' AND subcategory = 'accessibility';


-- =============================================
-- 완료!
-- =============================================
-- 생성된 테이블: seasons, season_records, daily_tips, tip_bookmarks, battles, battle_questions, skill_nodes, user_skill_progress
-- 시드 데이터: 시즌 5개, 팁 7개, 스킬 노드 47개 (6개 카테고리)
