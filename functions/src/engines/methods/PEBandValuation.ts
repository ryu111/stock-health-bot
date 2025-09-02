// PE Band 估值方法
import { IValuationMethod } from '../ValuationEngine';
import { ValuationInput, MethodFair } from '../../types/valuation';

export class PEBandValuation implements IValuationMethod {
  getName(): 'PE' {
    return 'PE';
  }

  calculate(input: ValuationInput): MethodFair {
    const assumptions: string[] = [];
    const limitations: string[] = [];

    const eps = this.pickEps(input);
    if (eps === null || eps <= 0) {
      limitations.push('無有效 EPS，無法以本益比法估值');
      return { method: 'PE', confidence: 0, assumptions, limitations };
    }

    const { peLow, peHigh } = input;
    if (typeof peLow !== 'number' || typeof peHigh !== 'number' || peLow <= 0 || peHigh <= 0 || peHigh < peLow) {
      limitations.push('PE 區間無效，需提供正數且高於下限');
      return { method: 'PE', confidence: 0, assumptions, limitations };
    }

    const peMid = (peLow + peHigh) / 2;
    const fairLow = eps * peLow;
    const fairMid = eps * peMid;
    const fairHigh = eps * peHigh;

    assumptions.push(`使用 EPS=${eps.toFixed(2)}，PE 低/中/高=${peLow}/${peMid.toFixed(2)}/${peHigh}`);

    const confidence = this.estimateConfidence(input);

    return {
      method: 'PE',
      fairLow,
      fairMid,
      fairHigh,
      confidence,
      assumptions,
      limitations,
    };
  }

  private pickEps(input: ValuationInput): number | null {
    // 優先使用 forward EPS，其次 TTM
    if (typeof input.financials?.epsForward1y === 'number') return input.financials.epsForward1y as number;
    if (typeof input.financials?.epsTtm === 'number') return input.financials.epsTtm as number;
    return null;
  }

  private estimateConfidence(input: ValuationInput): number {
    let score = 0.6; // 基礎信心
    if (typeof input.financials?.epsForward1y === 'number') score += 0.15;
    if (typeof input.epsCagr === 'number') score += 0.1;
    if (typeof input.peLow === 'number' && typeof input.peHigh === 'number') score += 0.1;
    return Math.max(0, Math.min(1, score));
  }
}
