import { StockData, MarketType } from '../../types/stock';
// import { LineEvent } from '../../types/line-events';

/**
 * 模擬股票服務
 */
export class MockStockService {
  static async getStockData(symbol: string): Promise<StockData> {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const mockData: { [key: string]: StockData } = {
      '2330': {
        symbol: '2330',
        name: '台積電',
        price: 500.0,
        volume: 1000000,
        dividendYield: 2.5,
        marketCap: 1000000000000,
        currency: 'TWD',
        peRatio: 15.5,
        pbRatio: 2.5,
        eps: 32.0,
        roe: 25.0,
        debtToEquity: 0.1,
        currentRatio: 2.5,
        quickRatio: 2.0,
        inventoryTurnover: 8.0,
        assetTurnover: 0.8,
        netProfitMargin: 35.0,
        grossProfitMargin: 50.0,
        operatingMargin: 40.0,
        revenueGrowth: 15.0,
        earningsGrowth: 20.0,
        beta: 1.2,
        volatility: 0.25,
        sharpeRatio: 1.5,
        maxDrawdown: -0.15,
        var95: -0.08,
        sector: 'Technology',
        industry: 'Semiconductors',
        description: '台灣積體電路製造股份有限公司',
        website: 'https://www.tsmc.com',
        employees: 65000,
        founded: 1987,
        marketType: MarketType.TW_STOCK,
        lastUpdated: new Date()
      },
      '0050': {
        symbol: '0050',
        name: '元大台灣50',
        price: 100.0,
        volume: 500000,
        dividendYield: 3.0,
        marketCap: 50000000000,
        currency: 'TWD',
        peRatio: 12.0,
        pbRatio: 1.8,
        eps: 8.5,
        roe: 15.0,
        debtToEquity: 0.05,
        currentRatio: 3.0,
        quickRatio: 2.8,
        inventoryTurnover: 12.0,
        assetTurnover: 1.2,
        netProfitMargin: 25.0,
        grossProfitMargin: 40.0,
        operatingMargin: 30.0,
        revenueGrowth: 10.0,
        earningsGrowth: 12.0,
        beta: 0.9,
        volatility: 0.18,
        sharpeRatio: 1.8,
        maxDrawdown: -0.12,
        var95: -0.06,
        sector: 'ETF',
        industry: 'Index Fund',
        description: '元大台灣50 ETF',
        website: 'https://www.yuantaetfs.com',
        employees: null,
        founded: 2003,
        marketType: MarketType.ETF,
        lastUpdated: new Date()
      }
    };

    if (mockData[symbol]) {
      return mockData[symbol];
    }

    throw new Error(`找不到股票代碼: ${symbol}`);
  }

  static async getMultipleStockData(symbols: string[]): Promise<StockData[]> {
    const results = await Promise.all(
      symbols.map(symbol => this.getStockData(symbol))
    );
    return results;
  }
}

/**
 * 模擬 LINE Bot API
 */
export class MockLineBotAPI {
  static async replyMessage(replyToken: string, messages: any[]): Promise<void> {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log(`模擬 LINE Bot 回覆: ${replyToken}`, messages);
  }

  static async pushMessage(userId: string, messages: any[]): Promise<void> {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log(`模擬 LINE Bot 推送: ${userId}`, messages);
  }

  static async getProfile(userId: string): Promise<any> {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 30));
    
    return {
      userId,
      displayName: '測試用戶',
      pictureUrl: 'https://example.com/avatar.jpg',
      statusMessage: '測試狀態'
    };
  }

  static async validateSignature(_body: string, signature: string): Promise<boolean> {
    // 模擬簽名驗證
    return signature === 'test-signature';
  }
}

/**
 * 模擬 Firebase Admin SDK
 */
export class MockFirebaseAdmin {
  static firestore() {
    return {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ test: 'data' }),
        id: 'test-doc-id'
      }),
      set: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      add: jest.fn().mockResolvedValue({ id: 'test-doc-id' }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis()
    };
  }

  static auth() {
    return {
      verifyIdToken: jest.fn().mockResolvedValue({
        uid: 'test-user-id',
        email: 'test@example.com'
      }),
      createCustomToken: jest.fn().mockResolvedValue('test-custom-token'),
      setCustomUserClaims: jest.fn().mockResolvedValue({})
    };
  }

  static initializeApp() {
    return {
      firestore: this.firestore,
      auth: this.auth
    };
  }
}

/**
 * 模擬 Express 請求
 */
export class MockExpressRequest {
  static create(options: any = {}): any {
    return {
      body: options.body || {},
      headers: options.headers || {},
      params: options.params || {},
      query: options.query || {},
      method: options.method || 'GET',
      url: options.url || '/',
      ...options
    };
  }
}

/**
 * 模擬 Express 回應
 */
export class MockExpressResponse {
  static create(): any {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.getHeader = jest.fn().mockReturnValue('test-header');
    return res;
  }
}

/**
 * 模擬快取服務
 */
export class MockCacheService {
  private static cache: Map<string, any> = new Map();

  static async get(key: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 10));
    return this.cache.get(key);
  }

  static async set(key: string, value: any, _ttl?: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 10));
    this.cache.set(key, value);
  }

  static async delete(key: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 10));
    this.cache.delete(key);
  }

  static async clear(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 10));
    this.cache.clear();
  }

  static has(key: string): boolean {
    return this.cache.has(key);
  }

  static size(): number {
    return this.cache.size;
  }
}

/**
 * 模擬日誌服務
 */
export class MockLogger {
  static info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}
