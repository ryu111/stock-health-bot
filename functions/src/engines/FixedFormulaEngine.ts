import { BaseAnalysisEngine, AnalysisEngineFactory } from './AnalysisEngine';
import { AnalysisType, AnalysisResult, Recommendation } from '../types/analysis';
import { MarketType, StockData, ETFData } from '../types/stock';

// 固定公式引擎
export class FixedFormulaEngine extends BaseAnalysisEngine {
  public readonly type = AnalysisType.TECHNICAL;

  constructor() {
    super();
    this.initializeFormulas();
  }

  /**
   * 分析股票
   * @param symbol - 股票代碼
   * @param data - 股票資料
   * @returns 分析結果
   */
  async analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult> {
    try {
      console.log(`🔍 開始固定公式分析: ${symbol}`);

      // 根據市場類型進行分析
      if (data.marketType === MarketType.ETF) {
        await this.analyzeETFData(data as ETFData);
      } else {
        await this.analyzeStockData(data as StockData);
      }

      const healthScore = this.calculateHealthScore(data);
      const technicalScore = this.calculateTechnicalScore(data);
      const fundamentalScore = this.calculateFundamentalScore(data);
      const riskScore = this.calculateRiskScore(data);
      const recommendation = this.generateRecommendation(data);
      const factors = this.getAnalysisFactors(data);

      const result: AnalysisResult = {
        symbol,
        type: this.type,
        marketType: data.marketType || MarketType.TW_STOCK,
        technicalScore,
        fundamentalScore,
        riskScore,
        healthScore,
        recommendation,
        confidence: 0.5,
        factors,
        timestamp: new Date(),
        dataQuality: 0.8,
        marketCondition: 'NEUTRAL',
        summary: '固定公式分析完成',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      console.log(`✅ 固定公式分析完成: ${symbol}`);
      return result;
    } catch (error) {
      console.error(`❌ 固定公式分析失敗: ${symbol}`, error);
      throw error;
    }
  }

  /**
   * 初始化分析公式
   */
  private initializeFormulas(): void {
    // 公式已內建在分析方法中，不需要額外初始化
  }

  /**
   * 分析股票資料
   * @param data - 股票資料
   * @returns 分析結果
   */
  private analyzeStockData(data: StockData): Record<string, number> {
    // 股票特定分析邏輯
    const analysis = {
      peRatio: data.peRatio || 0,
      pbRatio: data.pbRatio || 0,
      roe: data.roe || 0,
      debtToEquity: data.debtToEquity || 0,
      currentRatio: data.currentRatio || 0,
      quickRatio: data.quickRatio || 0,
      inventoryTurnover: data.inventoryTurnover || 0,
      assetTurnover: data.assetTurnover || 0,
      netProfitMargin: data.netProfitMargin || 0,
      grossProfitMargin: data.grossProfitMargin || 0,
      operatingMargin: data.operatingMargin || 0,
      revenueGrowth: data.revenueGrowth || 0,
      earningsGrowth: data.earningsGrowth || 0,
      beta: (data as StockData).beta || 1,
      volatility: (data as StockData).volatility || 0.2,
      sharpeRatio: data.sharpeRatio || 0,
      maxDrawdown: data.maxDrawdown || 0,
      var95: data.var95 || 0,
    };

    return analysis;
  }

  /**
   * 分析 ETF 資料
   * @param data - ETF 資料
   * @returns 分析結果
   */
  private analyzeETFData(data: ETFData): Record<string, unknown> {
    // ETF 特定分析邏輯
    const analysis = {
      expenseRatio: data.expenseRatio || 0,
      holdings: data.holdings || 0,
      assetClass: data.assetClass || '',
      category: data.category || '',
      yield: data.dividendYield || 0,
    };

    return analysis;
  }

  /**
   * 計算技術面評分
   * @param data - 股票/ETF 資料
   * @returns 技術面評分 (0-100)
   */
  calculateTechnicalScore(data: StockData | ETFData): number {
    let score = 50; // 基礎分數

    // 價格趨勢分析
    if (data.price && data.price > 0) {
      // 簡單的價格趨勢評分
      score += 10;
    }

    // 成交量分析
    if (data.volume && data.volume > 0) {
      score += 10;
    }

    // RSI 分析
    const rsi = this.calculateRSI(data);
    if (rsi > 30 && rsi < 70) {
      score += 15; // RSI 在合理區間
    } else if (rsi <= 30) {
      score += 5; // 超賣
    } else {
      score += 10; // 超買
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 計算基本面評分
   * @param data - 股票/ETF 資料
   * @returns 基本面評分 (0-100)
   */
  calculateFundamentalScore(data: StockData | ETFData): number {
    let score = 50; // 基礎分數

    if ('sector' in data) {
      // 股票基本面分析
      const stockData = data as StockData;

      // PE 比率分析
      if (stockData.peRatio && stockData.peRatio > 0 && stockData.peRatio < 30) {
        score += 15;
      } else if (stockData.peRatio && stockData.peRatio > 0) {
        score += 5;
      }

      // PB 比率分析
      if (stockData.pbRatio && stockData.pbRatio > 0 && stockData.pbRatio < 3) {
        score += 10;
      } else if (stockData.pbRatio && stockData.pbRatio > 0) {
        score += 5;
      }

      // ROE 分析
      if (stockData.roe && stockData.roe > 0.1) {
        score += 15;
      } else if (stockData.roe && stockData.roe > 0) {
        score += 10;
      }

      // 股息殖利率分析
      if (stockData.dividendYield && stockData.dividendYield > 0.03) {
        score += 10;
      } else if (stockData.dividendYield && stockData.dividendYield > 0) {
        score += 5;
      }
    } else {
      // ETF 基本面分析
      const etfData = data as ETFData;

      // 費用率分析
      if (etfData.expenseRatio && etfData.expenseRatio < 0.01) {
        score += 20;
      } else if (etfData.expenseRatio && etfData.expenseRatio < 0.02) {
        score += 15;
      } else if (etfData.expenseRatio && etfData.expenseRatio < 0.05) {
        score += 10;
      }

      // 追蹤誤差分析
      score += 15; // 假設追蹤誤差在合理範圍

      // 股息殖利率分析
      if (etfData.dividendYield && etfData.dividendYield > 0.02) {
        score += 10;
      } else if (etfData.dividendYield && etfData.dividendYield > 0) {
        score += 5;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 計算風險評分
   * @param data - 股票/ETF 資料
   * @returns 風險評分 (0-100)
   */
  calculateRiskScore(data: StockData | ETFData): number {
    let score = 50; // 基礎分數

    // 波動性分析
    if (data.volatility && data.volatility < 0.2) {
      score += 20; // 低波動性
    } else if (data.volatility && data.volatility < 0.3) {
      score += 15; // 中等波動性
    } else if (data.volatility && data.volatility < 0.4) {
      score += 10; // 高波動性
    } else {
      score += 5; // 極高波動性
    }

    // Beta 係數分析
    if (data.beta && data.beta < 0.8) {
      score += 15; // 低 Beta
    } else if (data.beta && data.beta < 1.2) {
      score += 10; // 中等 Beta
    } else {
      score += 5; // 高 Beta
    }

    // 流動性分析（基於成交量）
    if (data.volume && data.volume > 1000000) {
      score += 15; // 高流動性
    } else if (data.volume && data.volume > 100000) {
      score += 10; // 中等流動性
    } else {
      score += 5; // 低流動性
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 生成投資建議
   * @param data - 股票/ETF 資料
   * @returns 投資建議
   */
  override generateRecommendation(data: StockData | ETFData): Recommendation {
    const healthScore = this.calculateHealthScore(data);
    if (healthScore >= 80) {
      return 'BUY';
    } else if (healthScore >= 60) {
      return 'HOLD';
    } else if (healthScore >= 40) {
      return 'SELL';
    } else {
      return 'STRONG_SELL';
    }
  }

  /**
   * 計算 RSI
   * @param data - 股票/ETF 資料
   * @returns RSI 值
   */
  private calculateRSI(data: StockData | ETFData): number {
    // 簡化的 RSI 計算，實際應該基於歷史價格資料
    if (data.volatility && data.volatility > 0) {
      return Math.min(100, Math.max(0, 50 + data.volatility * 100));
    }
    return 50; // 預設值
  }
}

// 註冊引擎
AnalysisEngineFactory.registerEngine(AnalysisType.TECHNICAL, FixedFormulaEngine);
