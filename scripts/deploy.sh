#!/bin/bash

# 🚀 股健檢部署腳本

echo "🚀 開始部署股健檢到 Firebase..."
echo "================================================================"

# 執行品質檢查
echo "🔍 執行品質檢查..."
cd functions && npm run analyze && cd ..

if [ $? -ne 0 ]; then
  echo "❌ 品質檢查失敗，停止部署"
  exit 1
fi

# 部署到 Firebase
echo "🔥 部署到 Firebase..."
firebase deploy --only functions

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 部署成功！"
  echo "📡 生產環境 API: https://api-bhtpq7s4ka-uc.a.run.app"
  echo "🔗 Webhook URL: https://api-bhtpq7s4ka-uc.a.run.app/webhook"
  echo ""
  echo "💡 記得在 LINE Developer Console 中設定 Webhook URL"
else
  echo "❌ 部署失敗"
  exit 1
fi
