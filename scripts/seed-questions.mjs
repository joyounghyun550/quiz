#!/usr/bin/env node
/**
 * Seed questions into Supabase
 * Usage: node scripts/seed-questions.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (read from .env.local or environment variables)
 */

import { readFileSync } from "fs";
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
  console.error(
    "  SUPABASE_SERVICE_ROLE_KEY:",
    SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING"
  );
  console.error("\nPlease set these in .env.local or export them before running.");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Load question data files
const part1 = JSON.parse(
  readFileSync(join(__dirname, "../data/questions/questions-part1.json"), "utf-8")
);
const part2 = JSON.parse(
  readFileSync(join(__dirname, "../data/questions/questions-part2.json"), "utf-8")
);

const allQuestions = [...part1, ...part2];
console.log(`Found ${allQuestions.length} questions to seed.`);

// Validate required fields
const requiredFields = ["format", "category", "difficulty", "title", "correct_answer", "explanation"];
const invalid = allQuestions.filter((q, i) => {
  const missing = requiredFields.filter((f) => !q[f]);
  if (missing.length > 0) {
    console.warn(`  Question ${i + 1} missing fields: ${missing.join(", ")}`);
    return true;
  }
  return false;
});

if (invalid.length > 0) {
  console.warn(`\nWarning: ${invalid.length} questions have missing required fields and will be skipped.`);
}

const validQuestions = allQuestions.filter((q) =>
  requiredFields.every((f) => q[f])
);
console.log(`Inserting ${validQuestions.length} valid questions...\n`);

// Check for existing questions to avoid duplicates
const { data: existing, error: countError } = await supabase
  .from("questions")
  .select("id", { count: "exact", head: true });

if (countError) {
  console.error("Error checking existing questions:", countError.message);
  process.exit(1);
}

// Insert in batches
const BATCH_SIZE = 20;
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
  const batch = validQuestions.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(validQuestions.length / BATCH_SIZE);

  const { error } = await supabase.from("questions").insert(batch);

  if (error) {
    console.error(`Batch ${batchNum}/${totalBatches} failed:`, error.message);
    errorCount += batch.length;
  } else {
    successCount += batch.length;
    console.log(`Batch ${batchNum}/${totalBatches}: ${batch.length} questions inserted ✓`);
  }
}

console.log(`\nSeeding complete!`);
console.log(`  Inserted: ${successCount}`);
if (errorCount > 0) console.log(`  Failed:   ${errorCount}`);
