import {
  AnalysisType,
  AnalysisResult,
  IAnalysisEngine,
  Recommendation,
  AnalysisFactor,
} from '../types/analysis';
import { StockData, ETFData } from '../types/stock';

// 基礎分析引擎
export abstract class BaseAnalysisEngine implements IAnalysisEngine {
  public abstract readonly type: AnalysisType;

  /**
   * 分析股票
   * @param symbol - 股票代碼
   * @param data - 股票資料
   * @returns 分析結果
   */
  abstract analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult>;

  /**
   * 計算健康分數
   * @param data - 股票資料
   * @returns 健康分數
   */
  calculateHealthScore(data: StockData | ETFData): number {
    // 基礎健康分數計算邏輯
    let score = 50; // 基礎分數

    // 價格相關評分
    if (data.price && data.price > 0) {
      score += 10;
    }

    // 成交量相關評分
    if (data.volume && data.volume > 0) {
      score += 10;
    }

    // 市值相關評分
    if (data.marketCap && data.marketCap > 0) {
      score += 10;
    }

    // 股息相關評分
    if (data.dividendYield && data.dividendYield > 0) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 生成投資建議
   * @param data - 股票資料
   * @returns 投資建議
   */
  generateRecommendation(data: StockData | ETFData): Recommendation {
    const healthScore = this.calculateHealthScore(data);

    let type: 'BUY' | 'HOLD' | 'SELL';
    if (healthScore >= 70) {
      type = 'BUY';
    } else if (healthScore >= 40) {
      type = 'HOLD';
    } else {
      type = 'SELL';
    }

    return type as Recommendation;
  }

  /**
   * 取得分析因素
   * @param data - 股票資料
   * @returns 分析因素陣列
   */
  getAnalysisFactors(data: StockData | ETFData): AnalysisFactor[] {
    const factors = [];

    if (data.price) {
      factors.push({
        category: 'technical' as const,
        name: '價格',
        value: data.price,
        weight: 0.3,
        description: '當前股價',
      });
    }

    if (data.volume) {
      factors.push({
        category: 'technical' as const,
        name: '成交量',
        value: data.volume,
        weight: 0.2,
        description: '交易量',
      });
    }

    if (data.marketCap) {
      factors.push({
        category: 'fundamental' as const,
        name: '市值',
        value: data.marketCap,
        weight: 0.5,
        description: '市場價值',
      });
    }

    return factors;
  }
}

// 分析引擎工廠
export class AnalysisEngineFactory {
  private static engines = new Map<AnalysisType, new () => BaseAnalysisEngine>();

  /**
   * 註冊引擎
   * @param type - 分析類型
   * @param engineClass - 引擎類別
   */
  static registerEngine(type: AnalysisType, engineClass: new () => BaseAnalysisEngine): void {
    this.engines.set(type, engineClass);
  }

  /**
   * 建立引擎
   * @param type - 分析類型
   * @returns 引擎實例
   */
  static createEngine(type: AnalysisType): BaseAnalysisEngine | null {
    const EngineClass = this.engines.get(type);
    if (!EngineClass) {
      return null;
    }
    return new EngineClass();
  }

  /**
   * 取得支援的分析類型
   * @returns 支援的分析類型陣列
   */
  static getSupportedTypes(): AnalysisType[] {
    return Array.from(this.engines.keys());
  }

  /**
   * 檢查是否支援分析類型
   * @param type - 分析類型
   * @returns 是否支援
   */
  static isSupported(type: AnalysisType): boolean {
    return this.engines.has(type);
  }
}
