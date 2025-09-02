// 評分權重配置服務
import { ScoreCategory, ScoreCalculationConfig } from '../types/health-score';

export class ScoreWeightConfigService {
  private config: ScoreCalculationConfig;

  constructor(initial?: Partial<ScoreCalculationConfig>) {
    const defaultWeights: Record<ScoreCategory, number> = {
      [ScoreCategory.VALUATION]: 0.2,
      [ScoreCategory.FUNDAMENTALS]: 0.2,
      [ScoreCategory.GROWTH]: 0.15,
      [ScoreCategory.QUALITY]: 0.15,
      [ScoreCategory.RISK]: 0.1,
      [ScoreCategory.TECHNICAL]: 0.1,
      [ScoreCategory.LIQUIDITY]: 0.1,
    };
    this.config = {
      categoryWeights:
        (initial?.categoryWeights as Record<ScoreCategory, number>) ?? defaultWeights,
      factorWeights: initial?.factorWeights ?? {},
      thresholds: initial?.thresholds ?? {},
      industryAdjustments: initial?.industryAdjustments ?? {},
    } as ScoreCalculationConfig;
    this.validateWeights();
  }

  getConfig(): ScoreCalculationConfig {
    return this.config;
  }

  updateCategoryWeights(weights: Partial<Record<ScoreCategory, number>>): void {
    this.config.categoryWeights = {
      ...this.config.categoryWeights,
      ...(weights as Record<ScoreCategory, number>),
    };
    this.validateWeights();
  }

  setIndustryAdjustment(
    industry: string,
    adjustments: Partial<Record<ScoreCategory, number>>
  ): void {
    const current = this.config.industryAdjustments[industry] ?? {};
    this.config.industryAdjustments[industry] = {
      ...current,
      ...(adjustments as Record<string, number>),
    };
  }

  getEffectiveWeights(industry?: string): Record<ScoreCategory, number> {
    const base = this.config.categoryWeights;
    if (!industry || !this.config.industryAdjustments[industry]) return base;
    const adj = this.config.industryAdjustments[industry];
    const out: Record<ScoreCategory, number> = { ...base } as Record<ScoreCategory, number>;
    (Object.keys(adj) as Array<keyof typeof adj>).forEach(k => {
      const key = k as unknown as ScoreCategory;
      const v = adj[k];
      if (typeof v === 'number') out[key] = Math.max(0, Math.min(1, out[key] + v));
    });
    // 正規化為總和=1
    const sum = (Object.values(out) as number[]).reduce((a, b) => a + b, 0) || 1;
    (Object.keys(out) as ScoreCategory[]).forEach(k => {
      out[k] = Number((out[k] / sum).toFixed(4));
    });
    return out;
  }

  private validateWeights(): void {
    const weights = this.config.categoryWeights;
    const total = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 1) > 1e-6) {
      // 若總和不為1，則正規化
      (Object.keys(weights) as ScoreCategory[]).forEach(k => {
        weights[k] = Number((weights[k] / (total || 1)).toFixed(4));
      });
    }
    (Object.keys(weights) as ScoreCategory[]).forEach(k => {
      const v = weights[k];
      if (!(v >= 0 && v <= 1)) {
        weights[k] = Math.max(0, Math.min(1, v));
      }
    });
  }
}
