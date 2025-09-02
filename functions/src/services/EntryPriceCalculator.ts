// 進場價格計算器
import { ValuationResult } from '../types/valuation';
import { HealthReport } from '../types/health-score';

export interface EntryPriceConfig {
  // 安全邊際設定
  safetyMargin: {
    conservative: number; // 保守型：0.15 (15%)
    moderate: number; // 適中型：0.10 (10%)
    aggressive: number; // 積極型：0.05 (5%)
  };

  // 風險調整係數
  riskAdjustment: {
    low: number; // 低風險：1.0
    medium: number; // 中風險：0.95
    high: number; // 高風險：0.90
  };

  // 市場條件調整
  marketAdjustment: {
    bullish: number; // 多頭市場：1.05
    neutral: number; // 中性市場：1.0
    bearish: number; // 空頭市場：0.95
  };

  // 產業調整係數
  industryAdjustment: Record<string, number>;
}

export interface EntryPriceResult {
  symbol: string;
  currentPrice: number;
  fairValue: {
    low: number;
    mid: number;
    high: number;
  };
  recommendedEntryPrice: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
  riskAdjustedPrice: {
    low: number;
    medium: number;
    high: number;
  };
  marketAdjustedPrice: {
    bullish: number;
    neutral: number;
    bearish: number;
  };
  confidence: number;
  reasoning: string[];
  lastUpdated: Date;
}

export class EntryPriceCalculator {
  private config: EntryPriceConfig;

  constructor(config?: Partial<EntryPriceConfig>) {
    this.config = {
      safetyMargin: {
        conservative: 0.15,
        moderate: 0.1,
        aggressive: 0.05,
      },
      riskAdjustment: {
        low: 1.0,
        medium: 0.95,
        high: 0.9,
      },
      marketAdjustment: {
        bullish: 1.05,
        neutral: 1.0,
        bearish: 0.95,
      },
      industryAdjustment: {
        // 科技股：較高估值容忍度
        technology: 1.05,
        semiconductor: 1.08,
        software: 1.06,
        // 金融股：較保守估值
        financial: 0.95,
        banking: 0.93,
        insurance: 0.94,
        // 消費股：標準估值
        consumer: 1.0,
        retail: 1.0,
        food: 1.0,
        // 能源股：較低估值容忍度
        energy: 0.92,
        oil: 0.9,
        renewable: 0.95,
        // 醫療股：適中估值
        healthcare: 1.02,
        biotech: 1.04,
        pharmaceutical: 1.01,
      },
      ...config,
    };
  }

  /**
   * 計算建議進場價格
   */
  calculateEntryPrice(
    symbol: string,
    valuationResult: ValuationResult,
    healthReport: HealthReport,
    marketCondition: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'NEUTRAL',
    industry?: string,
    _riskProfile: 'conservative' | 'moderate' | 'aggressive' = 'moderate' // 重命名為 _riskProfile 避免未使用警告
  ): EntryPriceResult {
    const currentPrice = valuationResult.price;
    const fairValue = valuationResult.compositeFair;

    if (!fairValue) {
      throw new Error('無法取得合理價值資料');
    }

    // 計算安全邊際調整後的建議價格
    const recommendedEntryPrice = {
      conservative: (fairValue.mid || 0) * (1 - this.config.safetyMargin.conservative),
      moderate: (fairValue.mid || 0) * (1 - this.config.safetyMargin.moderate),
      aggressive: (fairValue.mid || 0) * (1 - this.config.safetyMargin.aggressive),
    };

    // 根據健康評分調整風險係數
    const healthScore = healthReport.overallScore;
    let riskLevel: 'low' | 'medium' | 'high';

    if (healthScore >= 85) {
      riskLevel = 'low';
    } else if (healthScore >= 65) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    // 計算風險調整後的價格
    const riskAdjustedPrice = {
      low: recommendedEntryPrice.moderate * this.config.riskAdjustment[riskLevel],
      medium: recommendedEntryPrice.moderate * this.config.riskAdjustment.medium,
      high: recommendedEntryPrice.moderate * this.config.riskAdjustment.high,
    };

    // 計算市場條件調整後的價格
    const marketAdjustedPrice = {
      bullish: recommendedEntryPrice.moderate * this.config.marketAdjustment.bullish,
      neutral: recommendedEntryPrice.moderate * this.config.marketAdjustment.neutral,
      bearish: recommendedEntryPrice.moderate * this.config.marketAdjustment.bearish,
    };

    // 應用產業調整係數
    if (industry && this.config.industryAdjustment[industry]) {
      const industryMultiplier = this.config.industryAdjustment[industry];
      Object.keys(recommendedEntryPrice).forEach(key => {
        recommendedEntryPrice[key as keyof typeof recommendedEntryPrice] *= industryMultiplier;
      });
      Object.keys(riskAdjustedPrice).forEach(key => {
        riskAdjustedPrice[key as keyof typeof riskAdjustedPrice] *= industryMultiplier;
      });
      Object.keys(marketAdjustedPrice).forEach(key => {
        marketAdjustedPrice[key as keyof typeof marketAdjustedPrice] *= industryMultiplier;
      });
    }

    // 計算置信度
    const confidence = this.calculateConfidence(valuationResult, healthReport);

    // 產生推理說明
    const reasoning = this.generateReasoning(
      currentPrice,
      { low: fairValue.low || 0, mid: fairValue.mid || 0, high: fairValue.high || 0 },
      recommendedEntryPrice,
      riskLevel,
      marketCondition,
      industry
    );

    return {
      symbol,
      currentPrice,
      fairValue: { low: fairValue.low || 0, mid: fairValue.mid || 0, high: fairValue.high || 0 },
      recommendedEntryPrice,
      riskAdjustedPrice,
      marketAdjustedPrice,
      confidence,
      reasoning,
      lastUpdated: new Date(),
    };
  }

  /**
   * 計算置信度
   */
  private calculateConfidence(
    valuationResult: ValuationResult,
    healthReport: HealthReport
  ): number {
    const valuationConfidence = valuationResult.confidence || 0.8;
    const healthConfidence = healthReport.confidence || 0.8;
    const dataQuality = valuationResult.dataQuality || 0.8;

    // 加權平均
    return Number(
      (valuationConfidence * 0.4 + healthConfidence * 0.4 + dataQuality * 0.2).toFixed(2)
    );
  }

  /**
   * 產生推理說明
   */
  private generateReasoning(
    currentPrice: number,
    fairValue: { low: number; mid: number; high: number },
    recommendedEntryPrice: { conservative: number; moderate: number; aggressive: number },
    riskLevel: 'low' | 'medium' | 'high',
    marketCondition: 'BULLISH' | 'NEUTRAL' | 'BEARISH',
    industry?: string
  ): string[] {
    const reasoning: string[] = [];

    // 價格分析
    if (currentPrice < fairValue.low) {
      reasoning.push('當前價格低於合理價值下限，具有投資價值');
    } else if (currentPrice > fairValue.high) {
      reasoning.push('當前價格高於合理價值上限，需謹慎評估');
    } else {
      reasoning.push('當前價格在合理價值區間內');
    }

    // 風險等級說明
    reasoning.push(`風險等級：${this.getRiskLevelDescription(riskLevel)}`);

    // 市場條件說明
    reasoning.push(`市場條件：${this.getMarketConditionDescription(marketCondition)}`);

    // 產業調整說明
    if (industry && this.config.industryAdjustment[industry]) {
      const adjustment = this.config.industryAdjustment[industry];
      if (adjustment > 1.0) {
        reasoning.push(`${industry} 產業具有較高估值容忍度`);
      } else if (adjustment < 1.0) {
        reasoning.push(`${industry} 產業建議較保守估值`);
      }
    }

    // 建議價格說明
    const priceDiff = ((currentPrice - recommendedEntryPrice.moderate) / currentPrice) * 100;
    if (priceDiff > 10) {
      reasoning.push('建議等待價格回調至建議區間');
    } else if (priceDiff < -10) {
      reasoning.push('當前價格具吸引力，可考慮分批布局');
    } else {
      reasoning.push('價格接近建議區間，可適度配置');
    }

    return reasoning;
  }

  /**
   * 取得風險等級描述
   */
  private getRiskLevelDescription(riskLevel: 'low' | 'medium' | 'high'): string {
    const descriptions = {
      low: '低風險，適合長期持有',
      medium: '中風險，需定期檢視',
      high: '高風險，建議設置停損',
    };
    return descriptions[riskLevel];
  }

  /**
   * 取得市場條件描述
   */
  private getMarketConditionDescription(
    marketCondition: 'BULLISH' | 'NEUTRAL' | 'BEARISH'
  ): string {
    const descriptions = {
      BULLISH: '多頭市場，可適度提高估值',
      NEUTRAL: '中性市場，標準估值',
      BEARISH: '空頭市場，建議保守估值',
    };
    return descriptions[marketCondition];
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<EntryPriceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 取得當前配置
   */
  getConfig(): EntryPriceConfig {
    return { ...this.config };
  }

  /**
   * 新增產業調整係數
   */
  addIndustryAdjustment(industry: string, adjustment: number): void {
    this.config.industryAdjustment[industry] = adjustment;
  }

  /**
   * 移除產業調整係數
   */
  removeIndustryAdjustment(industry: string): void {
    delete this.config.industryAdjustment[industry];
  }
}
