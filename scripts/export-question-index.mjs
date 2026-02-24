/**
 * export-question-index.mjs
 * DB에 있는 모든 문제의 제목과 서브카테고리를 JSON 파일로 내보냅니다.
 * 다음번 문제 생성 시 이 파일을 참고해서 중복을 방지하세요.
 *
 * 사용법: node scripts/export-question-index.mjs
 * 결과:  data/questions/question-index.json
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 로드 (seed-questions.mjs와 동일한 방식)
const envPath = join(__dirname, "../.env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local 없으면 환경변수 사용
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ 환경변수가 없습니다. .env.local 파일을 확인하세요.");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function exportIndex() {
  console.log("DB에서 문제 목록을 가져오는 중...\n");

  let allQuestions = [];
  let from = 0;
  const batchSize = 1000;

  // 1000개 제한 우회: 여러 번 나눠서 가져오기
  while (true) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, title, category, subcategory, difficulty, format")
      .order("category", { ascending: true })
      .order("subcategory", { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error("❌ 오류:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) break;

    allQuestions = allQuestions.concat(data);
    console.log(`  ${from + 1} ~ ${from + data.length} 번째 가져옴`);

    if (data.length < batchSize) break;
    from += batchSize;
  }

  console.log(`\n총 ${allQuestions.length}개 문제 로드 완료\n`);

  // 카테고리 > 서브카테고리 > 제목 목록으로 정리
  const index = {};

  for (const q of allQuestions) {
    const cat = q.category ?? "unknown";
    const sub = q.subcategory ?? "unknown";

    if (!index[cat]) index[cat] = {};
    if (!index[cat][sub]) index[cat][sub] = [];

    index[cat][sub].push({
      title: q.title,
      difficulty: q.difficulty,
      format: q.format,
    });
  }

  // 통계 출력
  console.log("=== 카테고리별 문제 수 ===");
  for (const [cat, subs] of Object.entries(index)) {
    const total = Object.values(subs).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`\n[${cat}] 총 ${total}개`);
    for (const [sub, questions] of Object.entries(subs)) {
      console.log(`  - ${sub}: ${questions.length}개`);
    }
  }

  // 메타 정보 포함
  const output = {
    exportedAt: new Date().toISOString(),
    totalQuestions: allQuestions.length,
    categories: index,
  };

  const outputPath = join(__dirname, "../data/questions/question-index.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n✅ 완료! → ${outputPath}`);
  console.log("다음번 문제 생성 시 이 파일을 참고해서 중복을 방지하세요.");
}

exportIndex();
