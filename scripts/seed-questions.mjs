#!/usr/bin/env node
/**
 * Seed questions into Supabase
 * Usage: node scripts/seed-questions.mjs
 *
 * - data/questions/*.json 파일을 자동으로 모두 불러옴
 * - DB에 이미 동일한 title이 있으면 스킵 (중복 방지)
 * - Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local if present
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
  // .env.local not found — rely on environment variables
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: Missing required environment variables.");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "set" : "MISSING");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING");
  console.error("\nPlease set these in .env.local or export them before running.");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// data/questions/ 안의 모든 JSON 파일 자동 로드
const questionsDir = join(__dirname, "../data/questions");
const jsonFiles = readdirSync(questionsDir).filter((f) => f.endsWith(".json"));

console.log(`\n발견된 파일 (${jsonFiles.length}개):`);
let allQuestions = [];
for (const file of jsonFiles) {
  const questions = JSON.parse(readFileSync(join(questionsDir, file), "utf-8"));
  console.log(`  ${file}: ${questions.length}개`);
  allQuestions = allQuestions.concat(questions);
}
console.log(`\n로컬 전체 문제 수: ${allQuestions.length}개`);

// 로컬 JSON 내 제목 중복 제거
const seenTitles = new Set();
const deduped = [];
let localDupeCount = 0;
for (const q of allQuestions) {
  if (seenTitles.has(q.title)) {
    localDupeCount++;
    continue;
  }
  seenTitles.add(q.title);
  deduped.push(q);
}
if (localDupeCount > 0) {
  console.log(`로컬 JSON 중복 제거: ${localDupeCount}개 스킵`);
}

// 필수 필드 검증
const requiredFields = ["format", "category", "difficulty", "title", "correct_answer", "explanation"];
const validQuestions = deduped.filter((q, i) => {
  const missing = requiredFields.filter((f) => !q[f]);
  if (missing.length > 0) {
    console.warn(`  [SKIP] ${q.title || `#${i + 1}`} — 필드 누락: ${missing.join(", ")}`);
    return false;
  }
  return true;
});

// DB에 이미 있는 title 조회 (중복 방지)
console.log("\nDB 기존 문제 확인 중...");
const { data: existingRows, error: fetchError } = await supabase
  .from("questions")
  .select("title");

if (fetchError) {
  console.error("DB 조회 실패:", fetchError.message);
  process.exit(1);
}

const existingTitles = new Set((existingRows ?? []).map((r) => r.title));
console.log(`DB 기존 문제: ${existingTitles.size}개`);

const newQuestions = validQuestions.filter((q) => !existingTitles.has(q.title));
const skipCount = validQuestions.length - newQuestions.length;

if (skipCount > 0) {
  console.log(`이미 DB에 존재하여 스킵: ${skipCount}개`);
}

if (newQuestions.length === 0) {
  console.log("\n✅ 새로 삽입할 문제가 없습니다. DB가 최신 상태입니다.");
  process.exit(0);
}

console.log(`\n새로 삽입할 문제: ${newQuestions.length}개\n`);

// 배치 삽입
const BATCH_SIZE = 20;
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < newQuestions.length; i += BATCH_SIZE) {
  const batch = newQuestions.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(newQuestions.length / BATCH_SIZE);

  const { error } = await supabase.from("questions").insert(batch);

  if (error) {
    console.error(`Batch ${batchNum}/${totalBatches} 실패:`, error.message);
    errorCount += batch.length;
  } else {
    successCount += batch.length;
    console.log(`Batch ${batchNum}/${totalBatches}: ${batch.length}개 삽입 ✓`);
  }
}

console.log(`\n✅ Seeding 완료!`);
console.log(`  삽입: ${successCount}개`);
if (errorCount > 0) console.log(`  실패: ${errorCount}개`);
console.log(`  스킵(중복): ${skipCount}개`);
