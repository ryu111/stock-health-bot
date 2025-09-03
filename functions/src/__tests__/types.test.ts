// 型別定義測試
import {
  Financials,
  ValuationInput,
  ValuationResult,
  MethodFair,
  ETFValuationInput,
  ETFValuationResult,
} from '../types/valuation';

import {
  ScoreCategory,
  ScoreGrade,
  ScoreBreakdown,
  HealthReport,
  HealthRiskFactor,
} from '../types/health-score';

import {
  DataSourceType,
  DataSourceStatus,
  DataSource,
  DataQuality,
  DataQualityLevel,
  ValidationResult,
} from '../types/data-source';

import { MarketType } from '../types/stock';

describe('型別定義測試', () => {
  test('估值相關型別應該能正確建立', () => {
    const financials: Financials = {
      epsTtm: 10.5,
      dividendYield: 0.05,
    };

    const valuationInput: ValuationInput = {
      symbol: '2330',
      price: 1000,
      marketType: MarketType.TW_STOCK,
      financials,
      epsCagr: 0.1,
      discountRate: 0.08,
    };

    const methodFair: MethodFair = {
      method: 'PE',
      fairLow: 800,
      fairMid: 1000,
      fairHigh: 1200,
      confidence: 0.8,
      assumptions: ['EPS成長率10%'],
      limitations: ['僅考慮PE估值'],
    };

    const valuationResult: ValuationResult = {
      symbol: '2330',
      price: 1000,
      marketType: MarketType.TW_STOCK,
      methods: [methodFair],
      signal: 'FAIR',
      notes: ['估值分析完成'],
      timestamp: new Date(),
      dataQuality: 0.9,
      confidence: 0.8,
    };

    expect(financials.epsTtm).toBe(10.5);
    expect(valuationInput.symbol).toBe('2330');
    expect(methodFair.method).toBe('PE');
    expect(valuationResult.signal).toBe('FAIR');
  });

  test('健康評分型別應該能正確建立', () => {
    const scoreBreakdown: ScoreBreakdown = {
      category: ScoreCategory.VALUATION,
      score: 85,
      grade: ScoreGrade.GOOD,
      weight: 0.3,
      weightedScore: 25.5,
      factors: [],
      description: '估值評分良好',
      recommendations: ['可以考慮進場'],
    };

    const healthRiskFactor: HealthRiskFactor = {
      name: '市場波動風險',
      level: 'medium',
      impact: 0.6,
      probability: 0.4,
      description: '市場波動可能影響股價',
      category: 'market',
    };

    const healthReport: HealthReport = {
      symbol: '2330',
      marketType: MarketType.TW_STOCK,
      overallScore: 80,
      overallGrade: ScoreGrade.GOOD,
      categoryScores: {
        [ScoreCategory.VALUATION]: scoreBreakdown,
      } as Record<ScoreCategory, ScoreBreakdown>,
      riskFactors: [healthRiskFactor],
      strengths: ['基本面強勁'],
      weaknesses: ['估值偏高'],
      recommendations: ['等待回檔'],
      investmentAdvice: {
        suitability: 'moderate',
        timeHorizon: 'medium',
        riskTolerance: 'medium',
        advice: '適合中長期投資',
      },
      lastUpdated: new Date(),
      confidence: 0.8,
      dataQuality: 0.9,
    };

    expect(scoreBreakdown.category).toBe(ScoreCategory.VALUATION);
    expect(healthRiskFactor.level).toBe('medium');
    expect(healthReport.overallScore).toBe(80);
  });

  test('資料來源型別應該能正確建立', () => {
    const dataSource: DataSource = {
      id: 'yahoo_finance',
      name: 'Yahoo Finance',
      type: DataSourceType.YAHOO_FINANCE,
      status: DataSourceStatus.ACTIVE,
      priority: 1,
      reliability: 0.95,
      updateFrequency: 'realtime',
      lastUpdate: new Date(),
      nextUpdate: new Date(),
      supportedMarkets: [MarketType.TW_STOCK, MarketType.ETF],
      supportedDataTypes: ['price', 'fundamentals'],
    };

    const dataQuality: DataQuality = {
      overallScore: 90,
      level: DataQualityLevel.EXCELLENT,
      completeness: 85,
      accuracy: 95,
      timeliness: 90,
      consistency: 88,
      validity: 92,
      factors: [],
      lastValidation: new Date(),
    };

    const validationResult: ValidationResult = {
      isValid: true,
      quality: dataQuality,
      errors: [],
      warnings: [],
      suggestions: [],
      timestamp: new Date(),
      duration: 100,
    };

    expect(dataSource.type).toBe(DataSourceType.YAHOO_FINANCE);
    expect(dataSource.status).toBe(DataSourceStatus.ACTIVE);
    expect(dataQuality.overallScore).toBe(90);
    expect(validationResult.isValid).toBe(true);
  });

  test('ETF估值型別應該能正確建立', () => {
    const etfValuationInput: ETFValuationInput = {
      symbol: '0056',
      price: 35,
      dividendYield: 0.08,
      targetYields: {
        high: 0.12,
        mid: 0.1,
        low: 0.08,
      },
      expenseRatio: 0.003,
    };

    const etfValuationResult: ETFValuationResult = {
      symbol: '0056',
      price: 35,
      dividendYield: 0.08,
      fairLow: 30,
      fairMid: 35,
      fairHigh: 40,
      signal: 'FAIR',
      notes: ['ETF估值分析完成'],
      timestamp: new Date(),
      confidence: 0.85,
    };

    expect(etfValuationInput.symbol).toBe('0056');
    expect(etfValuationInput.dividendYield).toBe(0.08);
    expect(etfValuationResult.signal).toBe('FAIR');
  });
});
