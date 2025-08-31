#!/usr/bin/env ts-node

import { execSync } from 'child_process';

/**
 * API 測試腳本
 */
class APITestScript {
  private readonly LOCAL_API_BASE = 'http://localhost:5001/stock-health-app/us-central1/api';

  /**
   * 執行 API 測試
   */
  async run(): Promise<void> {
    console.log('🧪 開始測試本地 API...');
    console.log('==============================================================');

    try {
      // 測試基本端點
      await this.testBasicEndpoints();

      // 測試健康檢查
      await this.testHealthCheck();

      // 測試股票查詢
      await this.testStockQuery();

      // 測試 ETF 查詢
      await this.testETFQuery();

      console.log('\n🎉 所有測試完成！');
    } catch (error) {
      console.error('❌ 測試失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  /**
   * 測試基本端點
   */
  private async testBasicEndpoints(): Promise<void> {
    console.log('🔍 測試基本端點...');
    const statusResponse = execSync(`curl -s "${this.LOCAL_API_BASE}/"`, { encoding: 'utf8' });
    console.log('✅ 狀態端點:', statusResponse);
  }

  /**
   * 測試健康檢查
   */
  private async testHealthCheck(): Promise<void> {
    console.log('\n🔍 測試健康檢查...');
    const healthResponse = execSync(`curl -s "${this.LOCAL_API_BASE}/health"`, { encoding: 'utf8' });
    console.log('✅ 健康檢查:', healthResponse);
  }

  /**
   * 測試股票查詢
   */
  private async testStockQuery(): Promise<void> {
    console.log('\n📈 測試股票查詢...');
    const stockQueryResponse = execSync(`curl -s -X POST "${this.LOCAL_API_BASE}/webhook" \
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
  }

  /**
   * 測試 ETF 查詢
   */
  private async testETFQuery(): Promise<void> {
    console.log('\n📈 測試 ETF 查詢...');
    const etfQueryResponse = execSync(`curl -s -X POST "${this.LOCAL_API_BASE}/webhook" \
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
  }
}

// 執行測試
if (require.main === module) {
  const apiTestScript = new APITestScript();
  apiTestScript.run().catch(error => {
    console.error('API 測試失敗:', error);
    process.exit(1);
  });
}

export { APITestScript };


