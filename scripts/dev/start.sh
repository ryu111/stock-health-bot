#!/bin/bash

# 🚀 股健檢本地開發環境啟動腳本

echo "🤖 啟動股健檢本地開發環境..."
echo "================================================================"

# 檢查 Node.js 版本
echo "🔍 檢查 Node.js 版本..."
node --version

# 安裝依賴
echo "📦 安裝依賴套件..."
if [ -d "functions" ]; then
  cd functions && npm install && cd ..
else
  echo "⚠️  functions 目錄不存在，跳過依賴安裝"
fi

# 啟動 Firebase 模擬器
echo "🔥 啟動 Firebase 模擬器..."
echo "📡 本地 API 端點: http://localhost:5001/stock-health-app/us-central1/api"
echo "🔗 Webhook 端點: http://localhost:5001/stock-health-app/us-central1/api/webhook"
echo "📊 模擬器 UI: http://localhost:4000"
echo ""
echo "💡 開發提示："
echo "  - 修改程式碼後會自動重新載入"
echo "  - 使用 Ctrl+C 停止模擬器"
echo "  - 查看日誌: firebase emulators:start --only functions --debug"
echo ""

firebase emulators:start --only functions
