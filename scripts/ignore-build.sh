if [ "$VERCEL_DEPLOYMENT_SOURCE" != "deploy-hook" ]; then
  echo "Skipping build: not triggered by deploy hook"
  exit 1
fi

echo "Build allowed: deploy hook detected"
exit 0
