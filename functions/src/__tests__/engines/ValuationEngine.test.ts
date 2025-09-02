// ValuationEngine 測試
import { ValuationEngine, IValuationMethod } from '../../engines/ValuationEngine';
import { ValuationInput, MethodFair } from '../../types/valuation';
import { MarketType } from '../../types/stock';

describe('ValuationEngine', () => {
  const buildInput = (overrides: Partial<ValuationInput> = {}): ValuationInput => ({
    symbol: '2330',
    price: 600,
    marketType: MarketType.TW_STOCK,
    financials: { epsTtm: 30, dividendYield: 0.025 },
    peLow: 15,
    peHigh: 25,
    marginOfSafety: 0.2,
    ...overrides,
  });

  const mockMethod = (
    name: 'PE' | 'DCF' | 'DDM',
    fair: { low?: number; mid?: number; high?: number },
    confidence: number
  ): IValuationMethod => ({
    getName: () => name,
    calculate: (_input: ValuationInput): MethodFair => {
      const out: MethodFair = {
        method: name,
        confidence,
        assumptions: [],
        limitations: [],
      };
      if (typeof fair.low === 'number') out.fairLow = fair.low;
      if (typeof fair.mid === 'number') out.fairMid = fair.mid;
      if (typeof fair.high === 'number') out.fairHigh = fair.high;
      return out;
    },
  });

  test('應能彙總多方法結果並給出訊號與建議買價', async () => {
    const methods: IValuationMethod[] = [
      mockMethod('PE', { low: 500, mid: 650, high: 800 }, 0.8),
      mockMethod('DCF', { low: 520, mid: 700, high: 850 }, 0.6),
    ];
    const engine = new ValuationEngine(methods);
    const input = buildInput({ price: 600 });

    const result = await engine.evaluate(input);

    expect(result.symbol).toBe('2330');
    expect(result.methods.length).toBe(2);
    expect((result.compositeFair?.mid ?? 0)).toBeGreaterThan(600); // 加權後的 mid 應在 650 與 700 間
    expect(['CHEAP', 'FAIR', 'EXPENSIVE']).toContain(result.signal);
    expect(result.suggestedBuyPrice).toBeGreaterThan(0);
    expect(result.dataQuality).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('當方法失敗時應提供fallback並繼續', async () => {
    const badMethod: IValuationMethod = {
      getName: () => 'DDM',
      calculate: () => {
        throw new Error('boom');
      },
    };
    const goodMethod = mockMethod('PE', { low: 500, mid: 650, high: 800 }, 0.9);
    const engine = new ValuationEngine([badMethod, goodMethod]);

    const result = await engine.evaluate(buildInput());

    expect(result.methods.length).toBe(2);
    // fallback confidence 應為 0，另一個方法正常
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('無法計算綜合合理價時，compositeFair 應為 undefined 且訊號為 FAIR', async () => {
    const onlyFallback: IValuationMethod = {
      getName: () => 'PE',
      calculate: () => ({ method: 'PE', confidence: 0, assumptions: [], limitations: [] }),
    };
    const engine = new ValuationEngine([onlyFallback]);
    const result = await engine.evaluate(buildInput());

    expect(result.compositeFair).toBeUndefined();
    expect(result.signal).toBe('FAIR');
  });
});
