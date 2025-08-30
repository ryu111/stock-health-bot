#!/usr/bin/env node

const { execSync } = require('child_process');

// 本地 API 端點
const LOCAL_API_BASE = 'http://localhost:5001/stock-health-app/us-central1/api';

function testAPI() {
  console.log('🧪 開始測試本地 API...');
  console.log('==============================================================');

  try {
    // 測試基本端點
    console.log('🔍 測試基本端點...');
    const statusResponse = execSync(`curl -s "${LOCAL_API_BASE}/"`, { encoding: 'utf8' });
    console.log('✅ 狀態端點:', statusResponse);

    // 測試健康檢查
    console.log('\n🔍 測試健康檢查...');
    const healthResponse = execSync(`curl -s "${LOCAL_API_BASE}/test"`, { encoding: 'utf8' });
    console.log('✅ 健康檢查:', healthResponse);

    // 測試股票查詢
    console.log('\n📈 測試股票查詢...');
    const stockQueryResponse = execSync(`curl -s -X POST "${LOCAL_API_BASE}/webhook" \
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
      }'`, { encoding: 'utf8' });
    console.log('✅ 股票查詢回應:', stockQueryResponse);

    // 測試 ETF 查詢
    console.log('\n📈 測試 ETF 查詢...');
    const etfQueryResponse = execSync(`curl -s -X POST "${LOCAL_API_BASE}/webhook" \
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
      }'`, { encoding: 'utf8' });
    console.log('✅ ETF 查詢回應:', etfQueryResponse);

    console.log('\n🎉 所有測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

// 執行測試
testAPI();
