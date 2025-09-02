// 估值引擎基礎類別
import { ValuationInput, ValuationResult, MethodFair } from '../types/valuation';
import { MarketType } from '../types/stock';
import { DataQualityController } from '../services/DataQualityController';

export interface IValuationMethod {
  getName(): 'PE' | 'DCF' | 'DDM';
  calculate(input: ValuationInput): MethodFair;
}

export interface ValuationEngineOptions {
  safetyThreshold?: number; // 價格低於合理價的比例視為便宜，例如 0.9
  expensiveThreshold?: number; // 價格高於合理價的比例視為昂貴，例如 1.1
}

export class ValuationEngine {
  private readonly methods: IValuationMethod[];
  private readonly qualityController: DataQualityController;
  private readonly options: Required<ValuationEngineOptions>;

  constructor(methods: IValuationMethod[], options?: ValuationEngineOptions) {
    this.methods = methods;
    this.qualityController = new DataQualityController();
    this.options = {
      safetyThreshold: options?.safetyThreshold ?? 0.9,
      expensiveThreshold: options?.expensiveThreshold ?? 1.1,
    };
  }

  async evaluate(input: ValuationInput): Promise<ValuationResult> {
    // 1) 基本資料品質評估（不擋流程，只提供品質分數）
    const qc = await this.qualityController.validate(
      {
        symbol: input.symbol,
        price: input.price,
        marketType: input.marketType as unknown as MarketType,
        lastUpdated: new Date(),
      } as unknown as Record<string, unknown>,
      {
        id: 'valuation_engine',
        name: 'ValuationEngine',
        type: 'market_data' as any,
        status: 'active' as any,
        priority: 10,
        reliability: 0.95,
        updateFrequency: 'realtime',
        lastUpdate: new Date(),
        nextUpdate: new Date(),
        supportedMarkets: [input.marketType],
        supportedDataTypes: ['valuation'],
        cost: { free: true },
      }
    );

    // 2) 執行各估值方法
    const methods: MethodFair[] = this.methods.map(m => {
      try {
        return m.calculate(input);
      } catch (err) {
        const fallback: MethodFair = {
          method: m.getName(),
          confidence: 0,
          assumptions: [],
          limitations: [`方法執行失敗: ${err instanceof Error ? err.message : 'Unknown error'}`],
        };
        return fallback;
      }
    });

    // 3) 綜合合理價（依方法信心加權）
    const composite = this.calculateComposite(methods);

    // 4) 訊號判定
    const signal = this.judgeSignal(input.price, composite?.mid);

    // 5) 建議買價（含安全邊際）
    const suggestedBuyPrice = this.calculateSuggestedBuyPrice(composite?.mid, input.marginOfSafety);

    const baseResult = {
      symbol: input.symbol,
      price: input.price,
      marketType: input.marketType,
      methods,
      signal,
      suggestedBuyPrice,
      notes: [],
      timestamp: new Date(),
      dataQuality: qc.quality.overallScore,
      confidence: this.estimateConfidence(methods),
    } as Omit<ValuationResult, 'compositeFair'>;

    const result: ValuationResult = composite
      ? { ...baseResult, compositeFair: composite }
      : ({ ...baseResult } as ValuationResult);

    return result;
  }

  private calculateComposite(
    methods: MethodFair[]
  ): { low?: number; mid?: number; high?: number } | undefined {
    const valid = methods.filter(m => typeof m.confidence === 'number' && m.confidence > 0);
    if (valid.length === 0) return undefined;

    const sumWeight = valid.reduce((acc, m) => acc + m.confidence, 0);
    const pickWeighted = (selector: (m: MethodFair) => number | undefined): number | undefined => {
      const pairs = valid
        .map(m => ({ w: m.confidence, v: selector(m) }))
        .filter(p => typeof p.v === 'number') as Array<{ w: number; v: number }>;
      if (pairs.length === 0) return undefined;
      const total = pairs.reduce((acc, p) => acc + p.w * p.v, 0);
      return total / sumWeight;
    };

    const out: { low?: number; mid?: number; high?: number } = {};
    const low = pickWeighted(m => m.fairLow);
    if (typeof low === 'number') out.low = low;
    const mid = pickWeighted(m => m.fairMid);
    if (typeof mid === 'number') out.mid = mid;
    const high = pickWeighted(m => m.fairHigh);
    if (typeof high === 'number') out.high = high;

    // 若三者皆缺，視為無法計算
    if (out.low === undefined && out.mid === undefined && out.high === undefined) return undefined;
    return out;
  }

  private judgeSignal(price: number, fairMid?: number): 'CHEAP' | 'FAIR' | 'EXPENSIVE' {
    if (fairMid === undefined) return 'FAIR';
    if (price <= fairMid * this.options.safetyThreshold) return 'CHEAP';
    if (price >= fairMid * this.options.expensiveThreshold) return 'EXPENSIVE';
    return 'FAIR';
  }

  private calculateSuggestedBuyPrice(
    fairMid?: number,
    marginOfSafety?: number
  ): number | undefined {
    if (fairMid === undefined) return undefined;
    const mos = marginOfSafety ?? 0.2; // 預設20%安全邊際
    return Math.max(0, fairMid * (1 - mos));
  }

  private estimateConfidence(methods: MethodFair[]): number {
    if (methods.length === 0) return 0;
    const avg = methods.reduce((acc, m) => acc + (m.confidence || 0), 0) / methods.length;
    return Math.max(0, Math.min(1, avg));
  }
}
