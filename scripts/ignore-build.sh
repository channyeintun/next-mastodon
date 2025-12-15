#!/usr/bin/env bash

echo "Deployment source: $VERCEL_DEPLOYMENT_SOURCE"

if [ "$VERCEL_DEPLOYMENT_SOURCE" = "deploy-hook" ]; then
  echo "Allowing build (deploy hook)"
  exit 1   # ❗ continue build
fi

echo "Ignoring build (not deploy hook)"
exit 0     # ❗ skip build
