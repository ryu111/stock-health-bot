// DCFValuation 測試
import { DCFValuation } from '../../engines/methods/DCFValuation';
import { ValuationInput } from '../../types/valuation';
import { MarketType } from '../../types/stock';

describe('DCFValuation', () => {
  const buildInput = (overrides: Partial<ValuationInput> = {}): ValuationInput => ({
    symbol: '2330',
    price: 600,
    marketType: MarketType.TW_STOCK,
    financials: { fcfPerShare: 20, epsTtm: 30, dividendYield: 0.02 },
    fcfCagr: 0.08,
    discountRate: 0.1,
    terminalGrowth: 0.02,
    ...overrides,
  });

  test('應以 FCF、成長率、貼現率與終期成長計算合理價', () => {
    const v = new DCFValuation();
    const input = buildInput();
    const res = v.calculate(input);

    expect(res.method).toBe('DCF');
    expect(res.fairMid).toBeGreaterThan(0);
    expect(res.fairLow).toBeLessThan(res.fairHigh as number);
    expect(res.confidence).toBeGreaterThan(0.7);
  });

  test('缺少 FCF 且 EPS 亦無時，應回傳 0 信心', () => {
    const v = new DCFValuation();
    const input = buildInput({ financials: { dividendYield: 0.02 } as any });
    const res = v.calculate(input);

    expect(res.confidence).toBe(0);
    expect(res.fairMid).toBeUndefined();
  });

  test('貼現率小於等於終期成長率時，應回傳 0 信心', () => {
    const v = new DCFValuation();
    const input = buildInput({ discountRate: 0.02, terminalGrowth: 0.03 });
    const res = v.calculate(input);

    expect(res.confidence).toBe(0);
    expect(res.fairHigh).toBeUndefined();
  });
});
