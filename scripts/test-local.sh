#!/bin/bash

# 🧪 股健檢本地測試腳本

echo "🧪 開始本地測試..."
echo "================================================================"

# 測試基本端點
echo "🔍 測試基本端點..."
curl -s "http://localhost:5001/stock-health-app/us-central1/api/" | jq .

echo ""
echo "🔍 測試健康檢查端點..."
curl -s "http://localhost:5001/stock-health-app/us-central1/api/test"

echo ""
echo "================================================================"
echo "🧪 測試股票查詢功能..."

# 測試股票查詢
echo "📈 測試台積電查詢..."
curl -s -X POST "http://localhost:5001/stock-health-app/us-central1/api/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: test" \
  -d '{
    "events": [{
      "type": "message",
      "message": {
        "type": "text",
        "text": "查詢 2330"
      },
      "replyToken": "test-reply-token",
      "source": {
        "userId": "test-user"
      }
    }]
  }' | jq .

echo ""
echo "📈 測試 ETF 查詢..."
curl -s -X POST "http://localhost:5001/stock-health-app/us-central1/api/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: test" \
  -d '{
    "events": [{
      "type": "message",
      "message": {
        "type": "text",
        "text": "查詢 0050"
      },
      "replyToken": "test-reply-token",
      "source": {
        "userId": "test-user"
      }
    }]
  }' | jq .

echo ""
echo "✅ 本地測試完成！"
