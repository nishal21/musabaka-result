#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Edit .env before production use."
fi
npm ci
npx prisma migrate deploy
npm run build
pm2 start deploy/ecosystem.config.cjs || pm2 restart musabaka
pm2 save
echo "Musabaka running — configure nginx from deploy/DEPLOY.md"
