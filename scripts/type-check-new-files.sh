#!/bin/bash

# 새로 추가된 TypeScript 파일들만 타입 체크하는 스크립트

echo "🔍 Checking types for new files only..."

# 새로 추가되거나 수정된 .ts, .tsx 파일들을 찾기
NEW_FILES=$(git diff --name-only --cached | grep -E '\.(ts|tsx)$')

if [ -z "$NEW_FILES" ]; then
  echo "✅ No new TypeScript files found. Skipping type check."
  exit 0
fi

echo "📝 New TypeScript files found:"
echo "$NEW_FILES"

# 새 파일들만 타입 체크 (프로젝트 설정 사용)
echo "🔍 Running type check on new files..."
# 임시 tsconfig 파일 생성하여 새 파일들만 포함
TEMP_CONFIG=$(mktemp)
cat > "$TEMP_CONFIG" << EOF
{
  "extends": "./tsconfig.json",
  "include": [
$(echo "$NEW_FILES" | sed 's/^/    "/' | sed 's/$/",/' | sed '$s/,$//')
  ]
}
EOF

npx tsc --noEmit --project "$TEMP_CONFIG"
RESULT=$?

# 임시 파일 정리
rm -f "$TEMP_CONFIG"

if [ $RESULT -eq 0 ]; then
  echo "✅ Type check passed for new files!"
  exit 0
else
  echo "❌ Type check failed for new files!"
  exit 1
fi
