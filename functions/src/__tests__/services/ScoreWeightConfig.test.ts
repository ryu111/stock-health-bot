// ScoreWeightConfig 測試
import { ScoreWeightConfigService } from '../../services/ScoreWeightConfig';
import { ScoreCategory } from '../../types/health-score';

describe('ScoreWeightConfigService', () => {
  test('初始化應正規化為總和=1', () => {
    const svc = new ScoreWeightConfigService({
      categoryWeights: {
        valuation: 2 as any,
        fundamentals: 2 as any,
        growth: 2 as any,
        quality: 2 as any,
        risk: 1 as any,
        technical: 1 as any,
        liquidity: 0 as any,
      } as any,
    });
    const cfg = svc.getConfig();
    const vals = Object.values(cfg.categoryWeights as unknown as Record<string, number>) as number[];
    const sum: number = vals.reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-6);
  });

  test('更新權重後仍維持總和=1', () => {
    const svc = new ScoreWeightConfigService();
    svc.updateCategoryWeights({ [ScoreCategory.VALUATION]: 0.5, [ScoreCategory.RISK]: 0.05 });
    const vals = Object.values(svc.getConfig().categoryWeights as unknown as Record<string, number>) as number[];
    const sum: number = vals.reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-6);
  });

  test('產業調整後取得有效權重且正規化', () => {
    const svc = new ScoreWeightConfigService();
    svc.setIndustryAdjustment('semiconductor', { [ScoreCategory.QUALITY]: 0.1, [ScoreCategory.RISK]: -0.05 });
    const weights = svc.getEffectiveWeights('semiconductor');
    const vals = Object.values(weights) as number[];
    const sum: number = vals.reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-6);
    expect(weights[ScoreCategory.QUALITY]).toBeGreaterThan(0);
  });
});
