#!/bin/bash

# 🧪 股健檢本地測試腳本

echo "🧪 開始本地測試..."
echo "================================================================"

# 測試基本端點
echo "🔍 測試基本端點..."
RESPONSE_STATUS=$(curl -s "http://localhost:5001/stock-health-app/us-central1/stockHealthAPI/api/health")
echo "健康檢查端點回應:"
echo "$RESPONSE_STATUS"

echo ""
echo "🔍 測試快取狀態端點..."
CACHE_STATUS=$(curl -s "http://localhost:5001/stock-health-app/us-central1/stockHealthAPI/api/cache/status")
echo "快取狀態端點回應:"
echo "$CACHE_STATUS"

echo ""
echo "================================================================"
echo "🧪 測試股票查詢功能..."

# 測試股票查詢
echo "📈 測試台積電查詢..."
RESPONSE=$(curl -s "http://localhost:5001/stock-health-app/us-central1/stockHealthAPI/api/stock/2330")
echo "台積電查詢回應:"
echo "$RESPONSE"
echo ""

echo "📈 測試 ETF 查詢 (0050)..."
RESPONSE2=$(curl -s "http://localhost:5001/stock-health-app/us-central1/stockHealthAPI/api/etf/0050")
echo "0050 ETF 查詢回應:"
echo "$RESPONSE2"
echo ""

echo "📈 測試高股息 ETF 查詢 (0056)..."
RESPONSE3=$(curl -s "http://localhost:5001/stock-health-app/us-central1/stockHealthAPI/api/etf/0056")
echo "0056 ETF 查詢回應:"
echo "$RESPONSE3"
echo ""

echo "📈 測試特選高股息 ETF 查詢 (00900)..."
RESPONSE4=$(curl -s "http://localhost:5001/stock-health-app/us-central1/stockHealthAPI/api/etf/00900")
echo "00900 ETF 查詢回應:"
echo "$RESPONSE4"

echo ""
echo "================================================================"
echo "🧪 測試 LINE Webhook 功能..."

# 測試 LINE Webhook
echo "🤖 測試 LINE Webhook 端點..."
WEBHOOK_RESPONSE=$(curl -s -X POST "http://localhost:5001/stock-health-app/us-central1/webhook" \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"message","message":{"type":"text","text":"2330"},"replyToken":"test-token"}]}')
echo "Webhook 回應:"
echo "$WEBHOOK_RESPONSE"

echo ""
echo "✅ 本地測試完成！"
