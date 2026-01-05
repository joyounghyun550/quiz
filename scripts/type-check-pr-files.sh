#!/bin/bash

# PR에서 새로 추가된 파일들만 타입 체크하는 스크립트

echo "🔍 Checking types for new files in PR..."

# PR의 base 브랜치와 비교하여 새로 추가된 파일들 찾기
if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then
  # GitHub Actions 환경에서
  BASE_SHA=$GITHUB_BASE_SHA
  HEAD_SHA=$GITHUB_SHA
else
  # 로컬 환경에서 (dev 브랜치와 비교)
  BASE_SHA="origin/dev"
  HEAD_SHA="HEAD"
fi

echo "📊 Comparing $BASE_SHA..$HEAD_SHA"

# 새로 추가된 .ts, .tsx 파일들을 찾기
NEW_FILES=$(git diff --name-only --diff-filter=A $BASE_SHA..$HEAD_SHA | grep -E '\.(ts|tsx)$')

if [ -z "$NEW_FILES" ]; then
  echo "✅ No new TypeScript files found. Skipping type check."
  exit 0
fi

echo "📝 New TypeScript files found:"
echo "$NEW_FILES"

# 새 파일들만 타입 체크
echo "🔍 Running type check on new files..."
npx tsc --noEmit $NEW_FILES

if [ $? -eq 0 ]; then
  echo "✅ Type check passed for new files!"
  exit 0
else
  echo "❌ Type check failed for new files!"
  exit 1
fi
