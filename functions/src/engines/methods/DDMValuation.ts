// DDM 估值方法
import { IValuationMethod } from '../ValuationEngine';
import { ValuationInput, MethodFair } from '../../types/valuation';

export class DDMValuation implements IValuationMethod {
  getName(): 'DDM' {
    return 'DDM';
  }

  calculate(input: ValuationInput): MethodFair {
    const assumptions: string[] = [];
    const limitations: string[] = [];

    const dividendYield = input.financials?.dividendYield ?? null; // 以殖利率推估股利
    const price = input.price;

    // 以現價與殖利率近似當年股利：D0 = price * dividendYield
    const d0 = dividendYield && dividendYield > 0 ? price * dividendYield : null;
    const g = input.dividendGrowth ?? 0.03; // 預設 3%
    const r = input.ddmDiscountRate ?? 0.08; // 預設 8%

    if (d0 === null || d0 <= 0) {
      limitations.push('缺少股利資訊（殖利率），無法使用DDM');
      return { method: 'DDM', confidence: 0, assumptions, limitations };
    }
    if (r <= g) {
      limitations.push('折現率需大於股利成長率');
      return { method: 'DDM', confidence: 0, assumptions, limitations };
    }

    // Gordon Growth: P0 = D1 / (r - g) ，D1 = D0 * (1+g)
    const d1 = d0 * (1 + g);
    const fairMid = d1 / (r - g);

    // 低/高以成長率 ±1% 做區間
    const gLow = Math.max(0, g - 0.01);
    const gHigh = g + 0.01;
    const fairLow = (d0 * (1 + gLow)) / (r - gLow);
    const fairHigh = (d0 * (1 + gHigh)) / (r - gHigh);

    assumptions.push(
      `以 D0=${d0.toFixed(2)}, g=${(g * 100).toFixed(1)}%, r=${(r * 100).toFixed(1)}% 計算`);

    const confidence = this.estimateConfidence(dividendYield, g, r);

    return { method: 'DDM', fairLow, fairMid, fairHigh, confidence, assumptions, limitations };
  }

  private estimateConfidence(dividendYield: number | null, g: number, r: number): number {
    let score = 0.6;
    if (dividendYield && dividendYield > 0) score += 0.1;
    if (g >= 0 && g <= 0.06) score += 0.1;
    if (r >= 0.06 && r <= 0.12) score += 0.1;
    return Math.max(0, Math.min(1, score));
  }
}
