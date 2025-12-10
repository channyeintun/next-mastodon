#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
echo "VERCEL_GIT_COMMIT_MESSAGE: $VERCEL_GIT_COMMIT_MESSAGE"

# Check if commit message contains [skip deploy]
if [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[skip deploy]"* ]]; then
  echo "🛑 - Build cancelled: commit message contains [skip deploy]"
  exit 0
fi

# Only build on main branch
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]]; then
  echo "✅ - Build can proceed"
  exit 1
else
  echo "🛑 - Build cancelled: branch is not main"
  exit 0
fi
