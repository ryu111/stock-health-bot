// 健康報告生成器
import { HealthReport, ScoreCalculationConfig } from '../types/health-score';
import { AnalysisResult } from '../types/analysis';
import { ValuationResult } from '../types/valuation';
import { MarketType } from '../types/stock';
import { HealthScoreCalculator } from './HealthScoreCalculator';
import { ScoreWeightConfigService } from './ScoreWeightConfig';

export class HealthReportGenerator {
  private weightConfig: ScoreWeightConfigService;

  constructor(config?: Partial<ScoreCalculationConfig>) {
    this.weightConfig = new ScoreWeightConfigService(config);
  }

  async generateReport(
    symbol: string,
    _marketType: MarketType,
    analysisResult: AnalysisResult,
    _valuationResult: ValuationResult,
    industry?: string
  ): Promise<HealthReport> {
    // 取得產業調整後的權重配置
    const effectiveWeights = this.weightConfig.getEffectiveWeights(industry);

    // 使用調整後的權重重新計算健康評分
    const adjustedConfig: ScoreCalculationConfig = {
      categoryWeights: effectiveWeights,
      factorWeights: this.weightConfig.getConfig().factorWeights,
      thresholds: this.weightConfig.getConfig().thresholds,
      industryAdjustments: this.weightConfig.getConfig().industryAdjustments,
    };

    // 重新建立計算器以使用調整後的權重
    const adjustedCalculator = new HealthScoreCalculator(adjustedConfig);

    // 產生健康報告
    const report = await adjustedCalculator.calculateHealthScore(symbol, analysisResult);

    // 注意：HealthReport 目前沒有 notes 屬性，產業調整資訊將在未來版本中加入
    if (industry) {
      console.log(`已套用 ${industry} 產業權重調整`);
      console.log(
        `調整後權重配置: ${Object.entries(effectiveWeights)
          .map(([k, v]) => `${k}: ${(v * 100).toFixed(1)}%`)
          .join(', ')}`
      );
    }

    return report;
  }

  async generateComparativeReport(
    symbols: string[],
    marketType: MarketType,
    analysisResults: Record<string, AnalysisResult>,
    valuationResults: Record<string, ValuationResult>,
    industry?: string
  ): Promise<{
    reports: Record<string, HealthReport>;
    comparison: {
      topPerformers: string[];
      bottomPerformers: string[];
      averageScore: number;
      industryBenchmark?: number;
    };
  }> {
    const reports: Record<string, HealthReport> = {};
    const scores: Array<{ symbol: string; score: number }> = [];

    // 為每個標的產生報告
    for (const symbol of symbols) {
      const analysis = analysisResults[symbol];
      const valuation = valuationResults[symbol];

      if (analysis && valuation) {
        const report = await this.generateReport(symbol, marketType, analysis, valuation, industry);
        reports[symbol] = report;
        scores.push({ symbol, score: report.overallScore });
      }
    }

    // 排序並產生比較分析
    scores.sort((a, b) => b.score - a.score);
    const topPerformers = scores.slice(0, 3).map(s => s.symbol);
    const bottomPerformers = scores.slice(-3).map(s => s.symbol);
    const averageScore =
      scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;

    // 計算產業基準（如果有多個同產業標的）
    let industryBenchmark: number | undefined;
    if (industry && scores.length > 1) {
      industryBenchmark = averageScore;
    }

    const comparison: {
      topPerformers: string[];
      bottomPerformers: string[];
      averageScore: number;
      industryBenchmark?: number;
    } = {
      topPerformers,
      bottomPerformers,
      averageScore: Number(averageScore.toFixed(2)),
    };

    if (industryBenchmark !== undefined) {
      comparison.industryBenchmark = industryBenchmark;
    }

    return {
      reports,
      comparison,
    };
  }

  getWeightConfiguration(): ScoreCalculationConfig {
    return this.weightConfig.getConfig();
  }

  updateWeights(config: Partial<ScoreCalculationConfig>): void {
    this.weightConfig = new ScoreWeightConfigService(config);
  }
}
