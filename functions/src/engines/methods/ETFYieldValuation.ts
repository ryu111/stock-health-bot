// ETF 殖利率估值方法
import { IValuationMethod } from '../ValuationEngine';
import { ETFValuationInput, MethodFair, ValuationInput } from '../../types/valuation';

export class ETFYieldValuation implements IValuationMethod {
  getName(): 'PE' | 'DCF' | 'DDM' {
    // 對 ValuationEngine 的方法名稱集合做兼容，這個方法將以 DDM 名稱掛入（殖利率法近似收益折現觀點）
    return 'DDM';
  }

  calculate(input: ValuationInput): MethodFair {
    // 嘗試將一般估值輸入視為ETF估值輸入（此方法應只用於ETF情境）
    const etfInput = input as unknown as ETFValuationInput;

    const assumptions: string[] = [];
    const limitations: string[] = [];

    const price = etfInput.price;
    const yieldNow = etfInput.dividendYield; // 以最近12個月殖利率
    const targets = etfInput.targetYields as ETFValuationInput['targetYields'] | undefined;

    if (!(yieldNow > 0) || !targets) {
      limitations.push('缺少有效殖利率或目標殖利率區間，無法進行殖利率估值');
      return { method: 'DDM', confidence: 0, assumptions, limitations };
    }

    const { high, mid, low } = targets;

    if (!(high > 0 && mid > 0 && low > 0)) {
      limitations.push('目標殖利率區間無效');
      return { method: 'DDM', confidence: 0, assumptions, limitations };
    }

    // 以現價與殖利率推估近12個月配息 D = price * yieldNow
    const D = price * yieldNow;

    const fairHigh = D / high; // 高目標殖利率 → 價格較低
    const fairMid = D / mid;
    const fairLow = D / low; // 低目標殖利率 → 價格較高

    assumptions.push(
      `以近12M配息 D=${D.toFixed(2)}；目標殖利率區間 high/mid/low=${(high * 100).toFixed(1)}%/${(mid * 100).toFixed(1)}%/${(low * 100).toFixed(1)}%`
    );

    const confidence = this.estimateConfidence(yieldNow, etfInput.expenseRatio, etfInput.trackingError);

    return {
      method: 'DDM',
      fairLow,
      fairMid,
      fairHigh,
      confidence,
      assumptions,
      limitations,
    };
  }

  private estimateConfidence(yieldNow: number, expenseRatio?: number, trackingError?: number): number {
    let score = 0.65;
    if (yieldNow > 0.04 && yieldNow < 0.12) score += 0.1; // 合理區間
    if (typeof expenseRatio === 'number' && expenseRatio <= 0.01) score += 0.1; // 低費率
    if (typeof trackingError === 'number' && trackingError <= 0.02) score += 0.05; // 低追蹤誤差
    return Math.max(0, Math.min(1, score));
  }
}
