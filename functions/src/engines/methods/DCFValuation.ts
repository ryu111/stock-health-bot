// DCF 估值方法
import { IValuationMethod } from '../ValuationEngine';
import { ValuationInput, MethodFair } from '../../types/valuation';

export class DCFValuation implements IValuationMethod {
  getName(): 'DCF' {
    return 'DCF';
  }

  calculate(input: ValuationInput): MethodFair {
    const assumptions: string[] = [];
    const limitations: string[] = [];

    const fcf = this.pickFcfPerShare(input);
    const growth = input.fcfCagr ?? input.epsCagr ?? 0.05; // 預設 5%
    const discount = input.discountRate ?? 0.1; // 預設 10%
    const terminalGrowth = input.terminalGrowth ?? 0.02; // 預設 2%
    const years = 10;

    if (fcf === null || fcf <= 0) {
      limitations.push('缺少每股自由現金流，無法進行DCF估值');
      return { method: 'DCF', confidence: 0, assumptions, limitations };
    }
    if (discount <= terminalGrowth) {
      limitations.push('貼現率需大於終期成長率');
      return { method: 'DCF', confidence: 0, assumptions, limitations };
    }

    // 顯性期現金流折現
    let pvSum = 0;
    let currentFcf = fcf;
    for (let t = 1; t <= years; t++) {
      currentFcf = currentFcf * (1 + growth);
      const pv = currentFcf / Math.pow(1 + discount, t);
      pvSum += pv;
    }

    // 終值 (Gordon Growth)
    const terminalFcf = currentFcf * (1 + terminalGrowth);
    const terminalValue = terminalFcf / (discount - terminalGrowth);
    const pvTerminal = terminalValue / Math.pow(1 + discount, years);

    const fairMid = pvSum + pvTerminal;
    const fairLow = fairMid * 0.8; // 保守折扣
    const fairHigh = fairMid * 1.2; // 樂觀溢價

    assumptions.push(
      `FCF=${fcf.toFixed(2)}, growth=${(growth * 100).toFixed(1)}%, discount=${(discount * 100).toFixed(1)}%, terminal=${(terminalGrowth * 100).toFixed(1)}%, years=${years}`
    );

    const confidence = this.estimateConfidence(input, fcf, growth, discount, terminalGrowth);

    return { method: 'DCF', fairLow, fairMid, fairHigh, confidence, assumptions, limitations };
  }

  private pickFcfPerShare(input: ValuationInput): number | null {
    if (typeof input.financials?.fcfPerShare === 'number') return input.financials.fcfPerShare as number;
    // 若無 FCF，嘗試以 EPS 近似（保守，EPS*0.7）
    if (typeof input.financials?.epsTtm === 'number') return (input.financials.epsTtm as number) * 0.7;
    return null;
  }

  private estimateConfidence(
    input: ValuationInput,
    fcf: number,
    growth: number,
    discount: number,
    terminalGrowth: number
  ): number {
    let score = 0.6;
    if (fcf > 0) score += 0.1;
    if (growth >= 0 && growth <= 0.25) score += 0.1;
    if (discount >= 0.08 && discount <= 0.15) score += 0.1;
    if (terminalGrowth >= 0 && terminalGrowth <= 0.03) score += 0.05;
    if (typeof input.fcfCagr === 'number') score += 0.05;
    return Math.max(0, Math.min(1, score));
  }
}
