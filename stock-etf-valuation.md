# 📄 stock-etf-valuation.md

## 目的
本文件提供 **個股 + ETF 的估值方法**，以利程式實作或交給 AI 分析使用。
涵蓋三大部分：
1. 個股估值（PE Band、DCF、DDM）
2. ETF 估值（殖利率法）
3. 使用範例與重點說明

---

# 🔹 個股估值

## 型別設計 (TypeScript)
```ts
export type Financials = {
  epsTtm?: number;
  epsForward1y?: number;
  fcfPerShare?: number;
  dividendPerShare?: number;
  netDebtPerShare?: number;
};

export type ValuationInput = {
  price: number;
  f: Financials;
  epsCagr?: number;
  fcfCagr?: number;
  discountRate?: number;
  terminalGrowth?: number;
  peLow?: number;
  peHigh?: number;
  dividendGrowth?: number;
  ddmDiscountRate?: number;
  marginOfSafety?: number;
};

export type MethodFair = {
  method: "PE" | "DCF" | "DDM";
  fairLow?: number;
  fairMid?: number;
  fairHigh?: number;
};

export type ValuationResult = {
  price: number;
  methods: MethodFair[];
  compositeFair?: { low?: number; mid?: number; high?: number };
  signal: "CHEAP" | "FAIR" | "EXPENSIVE";
  suggestedBuyPrice?: number;
  notes: string[];
};
```

---

## 方法與公式

### 1. PE Band 法
\[
P_{fair} = EPS \times PE
\]

### 2. 簡化 DCF 法
\[
PV = \sum_{t=1}^{n} \frac{FCF_t}{(1+r)^t} + \frac{FCF_n(1+g)}{(r-g)(1+r)^n}
\]

### 3. DDM 股利折現
\[
P_0 = \frac{D_1}{r-g}
\]

---

## TypeScript 實作（個股）
```ts
export function fairByPEBand(params: ValuationInput): MethodFair | undefined { ... }
export function fairByDCF(params: ValuationInput): MethodFair | undefined { ... }
export function fairByDDM(params: ValuationInput): MethodFair | undefined { ... }

export function valuateStock(params: ValuationInput): ValuationResult { ... }
```

---

# 🔹 ETF 估值

## 型別設計
```ts
export type ETFData = {
  price: number;
  dividendYearly: number;
};

export type ETFValuationInput = {
  etf: ETFData;
  targetYields: { high: number; mid: number; low: number };
};

export type ETFValuationResult = {
  yieldNow: number;
  fairLow: number;
  fairMid: number;
  fairHigh: number;
  signal: "CHEAP" | "FAIR" | "EXPENSIVE";
};
```

---

## 公式

1. **殖利率**
\[
Yield = \frac{D_y}{P}
\]

2. **目標殖利率回推合理價**
\[
P_{fair} = \frac{D_y}{targetYield}
\]

3. **合理區間**
\[
fairLow = \frac{D_y}{y_{high}},\quad fairMid = \frac{D_y}{y_{mid}},\quad fairHigh = \frac{D_y}{y_{low}}
\]

4. **進場訊號**
- CHEAP：現價 < 區間下緣
- FAIR：落在合理區間
- EXPENSIVE：現價 > 區間上緣 × 1.1

---

## TypeScript 實作（ETF）
```ts
export function valuateETF(input: ETFValuationInput): ETFValuationResult {
  const { price, dividendYearly } = input.etf;
  const { high, mid, low } = input.targetYields;

  const yieldNow = dividendYearly / price;
  const fairLow = dividendYearly / high;
  const fairMid = dividendYearly / mid;
  const fairHigh = dividendYearly / low;

  let signal: ETFValuationResult["signal"] = "FAIR";
  if (price < fairLow) signal = "CHEAP";
  else if (price > fairHigh * 1.1) signal = "EXPENSIVE";

  return { yieldNow, fairLow, fairMid, fairHigh, signal };
}
```

---

# 🔹 使用範例

### 個股：台積電
```ts
const stock = valuateStock({
  price: 1150,
  f: { epsTtm: 50, fcfPerShare: 40, dividendPerShare: 24 },
  epsCagr: 0.18,
  fcfCagr: 0.10,
  discountRate: 0.10,
  terminalGrowth: 0.03,
  peLow: 32,
  peHigh: 44,
  dividendGrowth: 0.02,
  ddmDiscountRate: 0.10,
  marginOfSafety: 0.2,
});
console.log(stock);
```

### ETF：0056
```ts
const etf = valuateETF({
  etf: { price: 34.7, dividendYearly: 4.08 },
  targetYields: { high: 0.12, mid: 0.11, low: 0.09 }
});
console.log(etf);
```

---

# 🔹 重點說明

1. **個股估值**：成長股 → PE/DCF；高息股 → PE/DDM。
2. **ETF估值**：殖利率回推合理價，配合除息日與大盤回檔觀察。
3. **安全邊際**：建議買價 = 中位數估值 × (1 - MoS)。
4. **訊號規則**：CHEAP / FAIR / EXPENSIVE。
5. **擴充**：可加 Sharpe Ratio、波動率，估算觸價機率。
