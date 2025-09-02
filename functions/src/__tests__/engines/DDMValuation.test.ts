// DDMValuation 測試
import { DDMValuation } from '../../engines/methods/DDMValuation';
import { ValuationInput } from '../../types/valuation';
import { MarketType } from '../../types/stock';

describe('DDMValuation', () => {
  const buildInput = (overrides: Partial<ValuationInput> = {}): ValuationInput => ({
    symbol: '0056',
    price: 30,
    marketType: MarketType.ETF,
    financials: { dividendYield: 0.06 },
    dividendGrowth: 0.03,
    ddmDiscountRate: 0.08,
    ...overrides,
  });

  test('應以股利、成長率與折現率計算合理價', () => {
    const v = new DDMValuation();
    const input = buildInput();
    const res = v.calculate(input);

    expect(res.method).toBe('DDM');
    expect(res.fairMid).toBeGreaterThan(0);
    expect(res.fairLow).toBeLessThan(res.fairHigh as number);
    expect(res.confidence).toBeGreaterThan(0.7);
  });

  test('缺少殖利率（股利）時應回傳 0 信心', () => {
    const v = new DDMValuation();
    const input = buildInput({ financials: {} as any });
    const res = v.calculate(input);

    expect(res.confidence).toBe(0);
    expect(res.fairMid).toBeUndefined();
  });

  test('折現率小於等於成長率時應回傳 0 信心', () => {
    const v = new DDMValuation();
    const input = buildInput({ ddmDiscountRate: 0.02, dividendGrowth: 0.03 });
    const res = v.calculate(input);

    expect(res.confidence).toBe(0);
    expect(res.fairHigh).toBeUndefined();
  });
});
