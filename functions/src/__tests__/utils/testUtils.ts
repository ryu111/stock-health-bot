import { StockData, ETFData, MarketType } from '../../types/stock';
import { LineMessageEvent } from '../../types/line-events';

/**
 * 測試工具和輔助函數
 */
export class TestUtils {
  /**
   * 創建模擬股票數據
   */
  static createMockStockData(symbol: string = '2330'): StockData {
    return {
      symbol,
      name: '台積電',
      price: 500.0,
      volume: 1000000,
      dividendYield: 2.5,
      marketCap: 1000000000000,
      currency: 'TWD',
      peRatio: 15.5,
      pbRatio: 2.5,
      eps: 32.26,
      roe: 0.25,
      debtToEquity: 0.3,
      currentRatio: 2.5,
      quickRatio: 2.0,
      inventoryTurnover: 8.5,
      assetTurnover: 0.8,
      netProfitMargin: 0.35,
      grossProfitMargin: 0.55,
      operatingMargin: 0.45,
      revenueGrowth: 0.15,
      earningsGrowth: 0.20,
      beta: 1.2,
      volatility: 0.25,
      sharpeRatio: 1.8,
      maxDrawdown: -0.15,
      var95: -0.08,
      sector: '科技',
      industry: '半導體',
      description: '台灣積體電路製造股份有限公司',
      website: 'https://www.tsmc.com',
      employees: 65000,
      founded: 1987,
      marketType: MarketType.TW_STOCK,
      lastUpdated: new Date()
    };
  }

  /**
   * 創建模擬 LINE 事件
   */
  static createMockLineEvent(text: string = '查詢 2330'): LineMessageEvent {
    return {
      type: 'message',
      mode: 'active',
      timestamp: Date.now(),
      source: {
        type: 'user',
        userId: 'test-user-id'
      },
      webhookEventId: 'test-webhook-event-id',
      deliveryContext: {
        isRedelivery: false
      },
      replyToken: 'test-reply-token',
      message: {
        id: 'test-message-id',
        type: 'text',
        text
      }
    };
  }

  /**
   * 創建模擬 LINE 事件陣列
   */
  static createMockLineEvents(events: string[] = ['查詢 2330']): LineMessageEvent[] {
    return events.map((text, index) => ({
      type: 'message',
      mode: 'active',
      timestamp: Date.now() + index,
      source: {
        type: 'user',
        userId: 'test-user-id'
      },
      webhookEventId: `test-webhook-event-id-${index}`,
      deliveryContext: {
        isRedelivery: false
      },
      replyToken: `test-reply-token-${index}`,
      message: {
        id: `test-message-id-${index}`,
        type: 'text',
        text
      }
    }));
  }

  /**
   * 創建模擬 ETF 數據
   */
  static createMockETFData(symbol: string = '0050'): ETFData {
    return {
      symbol,
      name: '元大台灣50',
      price: 100.0,
      volume: 500000,
      dividendYield: 3.0,
      marketCap: 50000000000,
      currency: 'TWD',
      peRatio: 12.0,
      pbRatio: 1.8,
      eps: 8.33,
      roe: 0.15,
      debtToEquity: 0.1,
      currentRatio: 3.0,
      quickRatio: 2.8,
      inventoryTurnover: 0,
      assetTurnover: 0.6,
      netProfitMargin: 0.12,
      grossProfitMargin: 0.12,
      operatingMargin: 0.12,
      revenueGrowth: 0.08,
      earningsGrowth: 0.10,
      beta: 1.0,
      volatility: 0.20,
      sharpeRatio: 1.5,
      maxDrawdown: -0.12,
      var95: -0.06,
      sector: 'ETF',
      industry: '指數型',
      description: '元大台灣50證券投資信託基金',
      website: 'https://www.yuantaetfs.com',
      employees: null,
      founded: 2003,
      marketType: MarketType.ETF,
      lastUpdated: new Date(),
      expenseRatio: 0.32,
      holdings: 50,
      assetClass: '股票',
      category: '大型股'
    };
  }

  /**
   * 創建模擬分析結果
   */
  static createMockAnalysisResult(symbol: string = '2330') {
    return {
      symbol,
      healthScore: 85,
      analysis: {
        technical: {
          score: 80,
          indicators: {
            rsi: 65,
            macd: 'positive',
            movingAverage: 'above'
          }
        },
        fundamental: {
          score: 90,
          indicators: {
            pe: 15.5,
            pb: 2.5,
            debtToEquity: 0.3,
            returnOnEquity: 0.25
          }
        },
        market: {
          score: 85,
          indicators: {
            volume: 'high',
            volatility: 'medium',
            trend: 'upward'
          }
        }
      },
      recommendations: [
        '基本面強勁，建議持有',
        '技術面良好，可考慮加碼',
        '注意市場波動風險'
      ],
      riskLevel: 'medium',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 設置測試環境
   */
  static setupTestEnvironment() {
    // 設置測試環境變數
    process.env['NODE_ENV'] = 'test';
    process.env['FIREBASE_PROJECT_ID'] = 'test-project-id';
    process.env['LINE_CHANNEL_ACCESS_TOKEN'] = 'test-token';
    process.env['LINE_CHANNEL_SECRET'] = 'test-secret';
  }

  /**
   * 清理測試環境
   */
  static cleanupTestEnvironment() {
    // 清理模擬
    jest.clearAllMocks();
    jest.resetAllMocks();
  }

  /**
   * 等待指定時間（用於異步測試）
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 創建模擬錯誤
   */
  static createMockError(message: string = '測試錯誤'): Error {
    return new Error(message);
  }

  /**
   * 驗證股票數據結構
   */
  static validateStockData(data: any): boolean {
    const requiredFields = [
      'symbol', 'name', 'price', 'volume', 'marketCap',
      'peRatio', 'pbRatio', 'dividendYield', 'currency'
    ];
    
    return requiredFields.every(field => data.hasOwnProperty(field));
  }

  /**
   * 驗證 LINE 事件結構
   */
  static validateLineEvent(event: any): boolean {
    const requiredFields = ['type', 'message', 'replyToken', 'source', 'timestamp'];
    
    return requiredFields.every(field => event.hasOwnProperty(field)) &&
           event.message.hasOwnProperty('text') &&
           event.message.hasOwnProperty('type');
  }
}
