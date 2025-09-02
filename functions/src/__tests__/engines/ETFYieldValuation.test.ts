// ETFYieldValuation 測試
import { ETFYieldValuation } from '../../engines/methods/ETFYieldValuation';
import { ETFValuationInput } from '../../types/valuation';

describe('ETFYieldValuation', () => {
  const buildInput = (overrides: Partial<ETFValuationInput> = {}): ETFValuationInput => ({
    symbol: '0056',
    price: 30,
    dividendYield: 0.08, // 8%
    targetYields: { high: 0.09, mid: 0.08, low: 0.07 },
    expenseRatio: 0.008,
    trackingError: 0.015,
    ...overrides,
  });

  test('應以目標殖利率區間計算合理價區間', () => {
    const v = new ETFYieldValuation();
    const input = buildInput();
    const res = v.calculate(input as any);

    expect(res.fairHigh).toBeGreaterThan(0);
    expect(res.fairLow).toBeGreaterThan(res.fairHigh as number); // 低殖利率 → 高價
    expect(res.fairMid).toBeGreaterThan(0);
    expect(res.confidence).toBeGreaterThan(0.7);
  });

  test('缺少殖利率或目標區間無效時應回傳 0 信心', () => {
    const v = new ETFYieldValuation();
    const input = buildInput({ dividendYield: 0, targetYields: { high: 0, mid: 0, low: 0 } });
    const res = v.calculate(input as any);

    expect(res.confidence).toBe(0);
    expect(res.fairMid).toBeUndefined();
  });
});
