// 股票健康評分相關型別定義
import { MarketType } from './stock';
import { AnalysisResult } from './analysis';

// 評分類別
export enum ScoreCategory {
  VALUATION = 'valuation', // 估值評分
  FUNDAMENTALS = 'fundamentals', // 基本面評分
  TECHNICAL = 'technical', // 技術面評分
  RISK = 'risk', // 風險評分
  GROWTH = 'growth', // 成長性評分
  QUALITY = 'quality', // 品質評分
  LIQUIDITY = 'liquidity', // 流動性評分
}

// 評分等級
export enum ScoreGrade {
  EXCELLENT = 'EXCELLENT', // 優秀 (90-100)
  GOOD = 'GOOD', // 良好 (80-89)
  AVERAGE = 'AVERAGE', // 平均 (70-79)
  BELOW_AVERAGE = 'BELOW_AVERAGE', // 低於平均 (60-69)
  POOR = 'POOR', // 不佳 (50-59)
  VERY_POOR = 'VERY_POOR', // 很差 (0-49)
}

// 評分細項介面
export interface ScoreBreakdown {
  category: ScoreCategory; // 評分類別
  score: number; // 分數 (0-100)
  grade: ScoreGrade; // 評分等級
  weight: number; // 權重 (0-1)
  weightedScore: number; // 加權分數
  factors: ScoreFactor[]; // 評分因子
  description: string; // 評分說明
  recommendations: string[]; // 改善建議
}

// 評分因子介面
export interface ScoreFactor {
  name: string; // 因子名稱
  value: number; // 因子數值
  benchmark: number; // 基準值
  score: number; // 單項分數 (0-100)
  weight: number; // 因子權重
  impact: 'positive' | 'negative' | 'neutral'; // 影響方向
  description: string; // 因子說明
}

// 健康評分風險因子介面
export interface HealthRiskFactor {
  name: string; // 風險名稱
  level: 'low' | 'medium' | 'high'; // 風險等級
  impact: number; // 影響程度 (0-1)
  probability: number; // 發生機率 (0-1)
  description: string; // 風險描述
  mitigation?: string; // 緩解措施
  category: 'financial' | 'operational' | 'market' | 'regulatory'; // 風險類別
}

// 健康報告介面
export interface HealthReport {
  symbol: string; // 股票代碼
  marketType: MarketType; // 市場類型
  overallScore: number; // 整體健康評分 (0-100)
  overallGrade: ScoreGrade; // 整體評分等級
  categoryScores: {
    // 各類別評分
    [key in ScoreCategory]: ScoreBreakdown;
  };
  riskFactors: HealthRiskFactor[]; // 風險因子
  strengths: string[]; // 優勢項目
  weaknesses: string[]; // 弱勢項目
  recommendations: string[]; // 改善建議
  investmentAdvice: {
    // 投資建議
    suitability: 'conservative' | 'moderate' | 'aggressive';
    timeHorizon: 'short' | 'medium' | 'long';
    riskTolerance: 'low' | 'medium' | 'high';
    advice: string;
  };
  lastUpdated: Date; // 最後更新時間
  confidence: number; // 評分置信度 (0-1)
  dataQuality: number; // 資料品質評分 (0-1)
}

// 評分計算配置介面
export interface ScoreCalculationConfig {
  categoryWeights: {
    // 類別權重配置
    [key in ScoreCategory]: number;
  };
  factorWeights: {
    // 因子權重配置
    [category: string]: { [factor: string]: number };
  };
  thresholds: {
    // 評分門檻
    [category: string]: {
      excellent: number;
      good: number;
      average: number;
      belowAverage: number;
      poor: number;
    };
  };
  industryAdjustments: {
    // 產業調整係數
    [industry: string]: {
      [category: string]: number;
    };
  };
}

// 健康評分歷史記錄介面
export interface HealthScoreHistory {
  symbol: string; // 股票代碼
  scores: {
    // 歷史評分記錄
    date: Date;
    overallScore: number;
    categoryScores: { [key in ScoreCategory]: number };
  }[];
  trend: 'IMPROVING' | 'DETERIORATING' | 'STABLE'; // 趨勢
  volatility: number; // 評分波動性
  averageScore: number; // 平均評分
  bestScore: number; // 最佳評分
  worstScore: number; // 最差評分
}

// 評分比較結果介面
export interface ScoreComparison {
  symbol: string; // 股票代碼
  currentScore: number; // 現行評分
  peerComparison: {
    // 同業比較
    industry: string;
    industryAverage: number;
    industryRank: number;
    industryPercentile: number;
  };
  historicalComparison: {
    // 歷史比較
    oneMonthAgo: number;
    threeMonthsAgo: number;
    sixMonthsAgo: number;
    oneYearAgo: number;
  };
  benchmarkComparison: {
    // 基準比較
    benchmark: string;
    benchmarkScore: number;
    relativePerformance: number;
  };
}

// 評分警報介面
export interface ScoreAlert {
  symbol: string; // 股票代碼
  type: 'score_drop' | 'risk_increase' | 'improvement' | 'threshold_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string; // 警報訊息
  currentValue: number; // 現行數值
  previousValue: number; // 先前數值
  threshold: number; // 觸發門檻
  timestamp: Date; // 警報時間
  acknowledged: boolean; // 是否已確認
}

// 健康評分服務介面
export interface IHealthScoreService {
  calculateHealthScore(symbol: string, data: AnalysisResult): Promise<HealthReport>;
  getScoreBreakdown(symbol: string): Promise<ScoreBreakdown[]>;
  getRiskAssessment(symbol: string): Promise<HealthRiskFactor[]>;
  generateRecommendations(healthReport: HealthReport): Promise<string[]>;
  compareWithPeers(symbol: string, industry: string): Promise<ScoreComparison>;
  getScoreHistory(symbol: string, period: string): Promise<HealthScoreHistory>;
  setAlertThresholds(symbol: string, thresholds: Record<string, number>): Promise<void>;
}
