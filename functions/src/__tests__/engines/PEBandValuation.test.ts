// PEBandValuation 測試
import { PEBandValuation } from '../../engines/methods/PEBandValuation';
import { ValuationInput } from '../../types/valuation';
import { MarketType } from '../../types/stock';

describe('PEBandValuation', () => {
  const buildInput = (overrides: Partial<ValuationInput> = {}): ValuationInput => ({
    symbol: '2330',
    price: 600,
    marketType: MarketType.TW_STOCK,
    financials: { epsTtm: 30, epsForward1y: 32, dividendYield: 0.025 },
    peLow: 15,
    peHigh: 25,
    marginOfSafety: 0.2,
    ...overrides,
  });

  test('應以 EPS 與 PE 區間計算合理價', () => {
    const v = new PEBandValuation();
    const input = buildInput();
    const res = v.calculate(input);

    expect(res.method).toBe('PE');
    expect(res.fairLow).toBeCloseTo((input.financials.epsForward1y as number) * (input.peLow as number));
    expect(res.fairMid).toBeCloseTo((input.financials.epsForward1y as number) * (((input.peLow as number) + (input.peHigh as number)) / 2));
    expect(res.fairHigh).toBeCloseTo((input.financials.epsForward1y as number) * (input.peHigh as number));
    expect(res.confidence).toBeGreaterThan(0.6);
  });

  test('無效 EPS 應回傳 0 信心且無合理價', () => {
    const v = new PEBandValuation();
    const input = buildInput({ financials: { dividendYield: 0.02 } as any });
    const res = v.calculate(input);

    expect(res.confidence).toBe(0);
    expect(res.fairLow).toBeUndefined();
    expect(res.fairMid).toBeUndefined();
    expect(res.fairHigh).toBeUndefined();
  });

  test('無效 PE 區間應回傳 0 信心且無合理價', () => {
    const v = new PEBandValuation();
    const input = buildInput({ peLow: -5, peHigh: 0 });
    const res = v.calculate(input);

    expect(res.confidence).toBe(0);
    expect(res.fairLow).toBeUndefined();
    expect(res.fairMid).toBeUndefined();
    expect(res.fairHigh).toBeUndefined();
  });
});
