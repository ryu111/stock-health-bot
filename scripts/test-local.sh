#!/bin/bash

# 🧪 股健檢本地測試腳本

echo "🧪 開始本地測試..."
echo "================================================================"

# 測試基本端點
echo "🔍 測試基本端點..."
RESPONSE_STATUS=$(curl -s "http://localhost:5001/stock-health-app/us-central1/api/")
echo "狀態端點回應:"
echo "$RESPONSE_STATUS"

echo ""
echo "🔍 測試健康檢查端點..."
curl -s "http://localhost:5001/stock-health-app/us-central1/api/test"

echo ""
echo "================================================================"
echo "🧪 測試股票查詢功能..."

# 測試股票查詢
echo "📈 測試台積電查詢..."
RESPONSE=$(curl -s -X POST "http://localhost:5001/stock-health-app/us-central1/api/test-webhook" \
  -H "Content-Type: application/json" \
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
  }')

echo "回應內容:"
echo "$RESPONSE"
echo ""

echo "📈 測試 ETF 查詢 (0050)..."
RESPONSE2=$(curl -s -X POST "http://localhost:5001/stock-health-app/us-central1/api/test-webhook" \
  -H "Content-Type: application/json" \
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
  }')

echo "回應內容:"
echo "$RESPONSE2"

echo ""
echo "📈 測試高股息 ETF 查詢 (0056)..."
RESPONSE3=$(curl -s -X POST "http://localhost:5001/stock-health-app/us-central1/api/test-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "type": "message",
      "message": {
        "type": "text",
        "text": "查詢 0056"
      },
      "replyToken": "test-reply-token",
      "source": {
        "userId": "test-user"
      }
    }]
  }')

echo "回應內容:"
echo "$RESPONSE3"

echo ""
echo "📈 測試特選高股息 ETF 查詢 (00900)..."
RESPONSE4=$(curl -s -X POST "http://localhost:5001/stock-health-app/us-central1/api/test-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "type": "message",
      "message": {
        "type": "text",
        "text": "查詢 00900"
      },
      "replyToken": "test-reply-token",
      "source": {
        "userId": "test-user"
      }
    }]
  }')

echo "回應內容:"
echo "$RESPONSE4"

echo ""
echo "✅ 本地測試完成！"
