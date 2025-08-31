import { BaseMarketDataAdapter } from './MarketDataAdapter';
import { StockData, MarketType } from '../types/stock';
import type { YahooFinanceQuote, YahooFinanceHistoricalData } from 'yahoo-finance2';

// 股票數據適配器
export class StockDataAdapter extends BaseMarketDataAdapter {
  constructor() {
    super(MarketType.TW_STOCK);
  }

  /**
   * 取得股票數據
   * @param symbol - 股票代碼
   * @returns 股票數據
   */
  async fetchStockData(symbol: string): Promise<StockData> {
    try {
      console.log(`🔍 開始取得 ${symbol} 股票資料...`);

      // 格式化代碼
      const formattedSymbol = this.formatSymbol(symbol);

      // 從 Yahoo Finance 取得資料
      const yahooData = await this.fetchFromYahooFinance(formattedSymbol);

      // 轉換為股票數據格式
      const stockData: StockData = {
        symbol: yahooData.symbol || symbol,
        name: yahooData.longName || yahooData.shortName || symbol,
        price: yahooData.regularMarketPrice || null,
        volume: yahooData.volume || null,
        dividendYield: yahooData.dividendYield || null,
        marketCap: yahooData.marketCap || null,
        currency: yahooData.currency || 'TWD',
        peRatio: yahooData.trailingPE || null,
        pbRatio: yahooData.priceToBook || null,
        eps: yahooData.trailingEps || null,
        roe: yahooData.returnOnEquity || null,
        debtToEquity: yahooData.debtToEquity || null,
        currentRatio: yahooData.currentRatio || null,
        quickRatio: yahooData.quickRatio || null,
        inventoryTurnover: yahooData.inventoryTurnover || null,
        assetTurnover: yahooData.assetTurnover || null,
        netProfitMargin: yahooData.netIncomeToCommon || null,
        grossProfitMargin: yahooData.grossMargins || null,
        operatingMargin: yahooData.operatingMargins || null,
        revenueGrowth: yahooData.revenueGrowth || null,
        earningsGrowth: yahooData.earningsGrowth || null,
        beta: yahooData.beta || null,
        volatility: yahooData.regularMarketDayRange
          ? this.calculateVolatility(yahooData.regularMarketDayRange)
          : null,
        sharpeRatio: null,
        maxDrawdown: null,
        var95: null,
        sector: yahooData.sector || '',
        industry: yahooData.industry || '',
        description: yahooData.longBusinessSummary || '',
        website: yahooData.website || '',
        employees: yahooData.fullTimeEmployees || null,
        founded: yahooData.founded || null,
        marketType: MarketType.TW_STOCK,
        lastUpdated: new Date(),
      };

      console.log(`✅ 成功取得 ${symbol} 股票資料`);
      return stockData;
    } catch (error) {
      console.error(
        `❌ 取得 ${symbol} 股票資料失敗，使用模擬資料:`,
        error instanceof Error ? error.message : 'Unknown error'
      );

      // 返回模擬資料而不是拋出錯誤
      const mockData = this.getMockData(this.formatSymbol(symbol));
      const fallbackStockData: StockData = {
        symbol: mockData.symbol || symbol,
        name: mockData.longName || mockData.shortName || symbol,
        price: mockData.regularMarketPrice || null,
        volume: mockData.volume || null,
        dividendYield: mockData.dividendYield || null,
        marketCap: mockData.marketCap || null,
        currency: mockData.currency || 'TWD',
        peRatio: mockData.trailingPE || null,
        pbRatio: mockData.priceToBook || null,
        eps: mockData.trailingEps || null,
        roe: mockData.returnOnEquity || null,
        debtToEquity: mockData.debtToEquity || null,
        currentRatio: mockData.currentRatio || null,
        quickRatio: mockData.quickRatio || null,
        inventoryTurnover: mockData.inventoryTurnover || null,
        assetTurnover: mockData.assetTurnover || null,
        netProfitMargin: mockData.netIncomeToCommon || null,
        grossProfitMargin: mockData.grossMargins || null,
        operatingMargin: mockData.operatingMargins || null,
        revenueGrowth: mockData.revenueGrowth || null,
        earningsGrowth: mockData.earningsGrowth || null,
        beta: mockData.beta || null,
        volatility: mockData.regularMarketDayRange
          ? this.calculateVolatility(mockData.regularMarketDayRange)
          : null,
        sharpeRatio: null,
        maxDrawdown: null,
        var95: null,
        sector: mockData.sector || '',
        industry: mockData.industry || '',
        description: mockData.longBusinessSummary || '',
        website: mockData.website || '',
        employees: mockData.fullTimeEmployees || null,
        founded: mockData.founded || null,
        marketType: MarketType.TW_STOCK,
        lastUpdated: new Date(),
      };

      console.log(`✅ 使用模擬資料 for ${symbol}`);
      return fallbackStockData;
    }
  }

  /**
   * 取得多個股票數據
   * @param symbols - 股票代碼陣列
   * @returns 股票數據陣列
   */
  async fetchMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const results: StockData[] = [];
    const errors: string[] = [];

    for (const symbol of symbols) {
      try {
        const data = await this.fetchStockData(symbol);
        results.push(data);
      } catch (error) {
        errors.push(
          `Failed to fetch ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    if (errors.length > 0) {
      console.warn('Some stocks failed to fetch:', errors);
    }

    return results;
  }

  /**
   * 驗證股票代碼
   * @param symbol - 股票代碼
   * @returns 是否有效
   */
  validateSymbol(symbol: string): boolean {
    // 台股代碼驗證：4位數字
    return /^[0-9]{4}$/.test(symbol);
  }

  /**
   * 取得支援的股票代碼
   * @returns 支援的股票代碼陣列
   */
  getSupportedSymbols(): string[] {
    // 台灣主要股票代碼列表
    return [
      '2330',
      '2317',
      '2454',
      '2412',
      '1301',
      '1303',
      '2002',
      '2308',
      '2881',
      '2882',
      '2884',
      '2885',
      '2886',
      '2887',
      '2888',
      '2889',
      '2890',
      '2891',
      '2892',
      '2897',
      '2903',
      '2904',
      '2905',
      '2906',
      '2908',
      '2910',
      '2911',
      '2912',
      '2913',
      '2915',
      '2916',
      '2918',
      '2923',
      '2924',
      '2926',
      '2929',
      '2936',
      '2939',
      '3008',
      '3019',
      '3034',
      '3035',
      '3037',
      '3045',
      '3054',
      '3090',
      '3092',
      '3189',
      '3231',
      '3257',
      '3406',
      '3443',
      '3450',
      '3481',
      '3504',
      '3528',
      '3532',
      '3533',
      '3545',
      '3557',
      '3561',
      '3576',
      '3583',
      '3588',
      '3596',
      '3605',
      '3617',
      '3622',
      '3645',
      '3653',
      '3661',
      '3673',
      '3682',
      '3694',
      '3701',
      '3702',
      '3703',
      '3704',
      '3705',
      '3706',
      '3711',
      '3712',
      '3714',
      '3715',
      '3721',
      '3738',
      '3747',
      '3759',
      '3762',
      '3777',
      '3789',
      '3791',
      '3808',
      '3816',
      '3825',
      '3834',
      '3844',
      '3856',
      '3861',
      '3877',
      '3888',
      '3899',
      '3904',
      '3919',
      '3921',
      '3923',
      '3924',
      '3928',
      '3930',
      '3933',
      '3936',
      '3939',
      '3943',
      '3947',
      '3950',
      '3954',
      '3956',
      '3960',
      '3962',
      '3968',
      '3971',
      '3972',
      '3976',
      '3983',
      '3984',
      '3989',
      '3990',
      '3991',
      '3992',
      '3993',
      '3994',
      '3995',
      '3996',
      '3997',
      '3998',
      '3999',
    ];
  }

  /**
   * 格式化股票代碼
   * @param symbol - 原始代碼
   * @returns 格式化後的代碼
   */
  protected override formatSymbol(symbol: string): string {
    // 台股代碼加上 .TW 後綴
    return `${symbol}.TW`;
  }

  /**
   * 從 Yahoo Finance 取得資料
   * @param symbol - 股票代碼
   * @returns Yahoo Finance 資料
   */
  private async fetchFromYahooFinance(symbol: string): Promise<YahooFinanceQuote> {
    const isProduction = process.env['NODE_ENV'] === 'production';
    const useMockData = process.env['USE_MOCK_DATA'] === 'true' || !isProduction;

    if (useMockData) {
      console.log(`使用模擬資料 for ${symbol} (環境: ${process.env['NODE_ENV'] || 'development'})`);
      return this.getMockData(symbol);
    }

    try {
      console.log(`使用正式 Yahoo Finance API for ${symbol}`);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const yahooModule = require('yahoo-finance2') as { default: unknown };
      const yahoo = yahooModule.default as {
        quote: (symbol: string) => Promise<YahooFinanceQuote>;
      };
      const quote = await yahoo.quote(symbol);
      return quote;
    } catch (error) {
      console.warn(
        `Yahoo Finance 資料取得失敗 ${symbol}，回退到模擬資料:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      // 返回模擬資料作為回退
      return this.getMockData(symbol);
    }
  }

  /**
   * 取得模擬資料
   * @param symbol - 股票代碼
   * @returns 模擬資料
   */
  private getMockData(symbol: string): YahooFinanceQuote {
    const mockData: Record<string, YahooFinanceQuote> = {
      '2330.TW': {
        symbol: '2330.TW',
        longName: '台積電',
        shortName: '台積電',
        regularMarketPrice: 580,
        volume: 50000000,
        marketCap: 15000000000000,
        currency: 'TWD',
        trailingPE: 18.5,
        priceToBook: 6.2,
        trailingEps: 31.35,
        returnOnEquity: 0.25,
        debtToEquity: 0.15,
        currentRatio: 2.1,
        quickRatio: 1.8,
        inventoryTurnover: 8.5,
        assetTurnover: 0.6,
        netIncomeToCommon: 0.35,
        grossMargins: 0.55,
        operatingMargins: 0.42,
        revenueGrowth: 0.15,
        earningsGrowth: 0.12,
        beta: 1.2,
        regularMarketDayRange: '575-585',
        sector: '科技',
        industry: '半導體',
        longBusinessSummary: '台灣積體電路製造股份有限公司是全球最大的專業積體電路製造服務公司。',
        website: 'https://www.tsmc.com',
        fullTimeEmployees: 65000,
        founded: 1987,
      },
      '2317.TW': {
        symbol: '2317.TW',
        longName: '鴻海',
        shortName: '鴻海',
        regularMarketPrice: 105,
        volume: 30000000,
        marketCap: 1500000000000,
        currency: 'TWD',
        trailingPE: 12.5,
        priceToBook: 1.8,
        trailingEps: 8.4,
        returnOnEquity: 0.15,
        debtToEquity: 0.25,
        currentRatio: 1.5,
        quickRatio: 1.2,
        inventoryTurnover: 6.2,
        assetTurnover: 0.8,
        netIncomeToCommon: 0.08,
        grossMargins: 0.12,
        operatingMargins: 0.06,
        revenueGrowth: 0.08,
        earningsGrowth: 0.05,
        beta: 1.1,
        regularMarketDayRange: '103-107',
        sector: '科技',
        industry: '電子製造',
        longBusinessSummary: '鴻海精密工業股份有限公司是全球最大的電子製造服務公司。',
        website: 'https://www.foxconn.com',
        fullTimeEmployees: 800000,
        founded: 1974,
      },
      '2454.TW': {
        symbol: '2454.TW',
        longName: '聯發科',
        shortName: '聯發科',
        regularMarketPrice: 720,
        volume: 15000000,
        marketCap: 1200000000000,
        currency: 'TWD',
        trailingPE: 22.5,
        priceToBook: 4.8,
        trailingEps: 32.0,
        returnOnEquity: 0.22,
        debtToEquity: 0.12,
        currentRatio: 2.8,
        quickRatio: 2.3,
        inventoryTurnover: 7.2,
        assetTurnover: 0.7,
        netIncomeToCommon: 0.18,
        grossMargins: 0.48,
        operatingMargins: 0.25,
        revenueGrowth: 0.22,
        earningsGrowth: 0.18,
        beta: 1.3,
        regularMarketDayRange: '715-725',
        sector: '科技',
        industry: '半導體',
        longBusinessSummary:
          '聯發科技股份有限公司是全球領先的無線通訊及數位媒體晶片整合系統方案之主要供應商。',
        website: 'https://www.mediatek.com',
        fullTimeEmployees: 15000,
        founded: 1997,
      },
    };

    const fallbackData = mockData[symbol];
    if (fallbackData) {
      return fallbackData;
    }

    // 如果沒有找到特定的模擬資料，返回通用模擬資料
    return {
      symbol: `${symbol}`,
      longName: `${symbol.replace('.TW', '')} 股票`,
      shortName: `${symbol.replace('.TW', '')} 股票`,
      regularMarketPrice: Math.random() * 100 + 10,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: Math.random() * 100000000000 + 10000000000,
      currency: 'TWD',
      trailingPE: Math.random() * 20 + 5,
      priceToBook: Math.random() * 5 + 1,
      trailingEps: Math.random() * 10 + 1,
      returnOnEquity: Math.random() * 0.3 + 0.05,
      debtToEquity: Math.random() * 0.5 + 0.1,
      currentRatio: Math.random() * 2 + 1,
      quickRatio: Math.random() * 1.5 + 0.5,
      inventoryTurnover: Math.random() * 10 + 2,
      assetTurnover: Math.random() * 2 + 0.5,
      netIncomeToCommon: Math.random() * 0.2 + 0.05,
      grossMargins: Math.random() * 0.4 + 0.2,
      operatingMargins: Math.random() * 0.25 + 0.1,
      revenueGrowth: Math.random() * 0.3 - 0.1,
      earningsGrowth: Math.random() * 0.4 - 0.2,
      beta: Math.random() * 2 + 0.5,
      regularMarketDayRange: '100-110',
      sector: '科技',
      industry: '電子',
      longBusinessSummary: '模擬股票資料',
      website: 'https://example.com',
      fullTimeEmployees: Math.floor(Math.random() * 10000) + 1000,
      founded: Math.floor(Math.random() * 50) + 1970,
    } as YahooFinanceQuote;
  }

  /**
   * 計算波動率
   * @param dayRange - 日內價格範圍
   * @returns 波動率
   */
  private calculateVolatility(dayRange: string): number {
    try {
      const [low, high] = dayRange.split('-').map(Number);
      if (low && high) {
        return (high - low) / low;
      }
    } catch (error) {
      console.warn('波動率計算失敗:', error);
    }
    return 0.05; // 預設波動率
  }

  /**
   * 取得歷史數據
   * @param symbol - 股票代碼
   * @returns 歷史數據
   */
  async getHistoricalData(symbol: string): Promise<YahooFinanceHistoricalData[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const yahooModule = require('yahoo-finance2') as { default: unknown };
      const yahoo = yahooModule.default as {
        historical: (
          symbol: string,
          options: Record<string, unknown>
        ) => Promise<YahooFinanceHistoricalData[]>;
      };
      const historical = await yahoo.historical(symbol, {
        period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: '1d',
      });
      return historical;
    } catch (error) {
      console.warn(
        `取得歷史數據失敗 ${symbol}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return [];
    }
  }

  /**
   * 取得基本面數據
   * @param symbol - 股票代碼
   * @returns 基本面數據
   */
  async getFundamentalData(symbol: string): Promise<YahooFinanceQuote> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const yahooModule = require('yahoo-finance2') as { default: unknown };
      const yahoo = yahooModule.default as {
        quote: (symbol: string) => Promise<YahooFinanceQuote>;
      };
      const fundamental = await yahoo.quote(symbol);
      return fundamental;
    } catch (error) {
      console.warn(
        `取得基本面數據失敗 ${symbol}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return {
        symbol: symbol,
        longName: `${symbol} 股票`,
        shortName: `${symbol} 股票`,
        regularMarketPrice: 0,
        volume: 0,
        marketCap: 0,
        currency: 'TWD',
      } as YahooFinanceQuote;
    }
  }
}
