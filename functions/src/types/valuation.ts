// 股票估值相關型別定義
import { MarketType } from './stock';

// 財務資料介面
export interface Financials {
  epsTtm?: number; // 過去12個月每股盈餘
  epsForward1y?: number; // 未來1年預估每股盈餘
  fcfPerShare?: number; // 每股自由現金流
  dividendYield?: number; // 股利殖利率
  netDebtPerShare?: number; // 每股淨負債
  bookValuePerShare?: number; // 每股帳面價值
  revenuePerShare?: number; // 每股營收
}

// 估值輸入參數介面
export interface ValuationInput {
  symbol: string; // 股票代碼
  price: number; // 現行股價
  marketType: MarketType; // 市場類型
  financials: Financials; // 財務資料
  epsCagr?: number; // EPS年複合成長率
  fcfCagr?: number; // FCF年複合成長率
  discountRate?: number; // 折現率
  terminalGrowth?: number; // 終期成長率
  peLow?: number; // 低本益比
  peHigh?: number; // 高本益比
  dividendGrowth?: number; // 股利成長率
  ddmDiscountRate?: number; // DDM折現率
  marginOfSafety?: number; // 安全邊際
  industry?: string; // 產業別
  sector?: string; // 部門別
}

// 估值方法結果介面
export interface MethodFair {
  method: 'PE' | 'DCF' | 'DDM'; // 估值方法
  fairLow?: number; // 合理價下限
  fairMid?: number; // 合理價中位數
  fairHigh?: number; // 合理價上限
  confidence: number; // 置信度 (0-1)
  assumptions: string[]; // 假設條件
  limitations: string[]; // 限制說明
}

// 估值結果介面
export interface ValuationResult {
  symbol: string; // 股票代碼
  price: number; // 現行股價
  marketType: MarketType; // 市場類型
  methods: MethodFair[]; // 各方法估值結果
  compositeFair?: {
    // 綜合合理價
    low?: number;
    mid?: number;
    high?: number;
  };
  signal: 'CHEAP' | 'FAIR' | 'EXPENSIVE'; // 投資訊號
  suggestedBuyPrice?: number; // 建議買價
  notes: string[]; // 分析筆記
  timestamp: Date; // 分析時間
  dataQuality: number; // 資料品質評分 (0-1)
  confidence: number; // 整體置信度 (0-1)
}

// ETF估值輸入參數介面
export interface ETFValuationInput {
  symbol: string; // ETF代碼
  price: number; // 現行價格
  dividendYield: number; // 股利殖利率
  targetYields: {
    // 目標殖利率
    high: number; // 高殖利率目標
    mid: number; // 中殖利率目標
    low: number; // 低殖利率目標
  };
  expenseRatio?: number; // 費用率
  trackingError?: number; // 追蹤誤差
}

// ETF估值結果介面
export interface ETFValuationResult {
  symbol: string; // ETF代碼
  price: number; // 現行價格
  dividendYield: number; // 現行股利殖利率
  fairLow: number; // 合理價下限
  fairMid: number; // 合理價中位數
  fairHigh: number; // 合理價上限
  signal: 'CHEAP' | 'FAIR' | 'EXPENSIVE'; // 投資訊號
  suggestedBuyPrice?: number; // 建議買價
  notes: string[]; // 分析筆記
  timestamp: Date; // 分析時間
  confidence: number; // 置信度 (0-1)
}

// 估值比較結果介面
export interface ValuationComparison {
  symbol: string; // 股票代碼
  currentPrice: number; // 現行價格
  fairValue: {
    // 合理價值
    low: number;
    mid: number;
    high: number;
  };
  upside: {
    // 上漲潛力
    low: number; // 相對於下限的上漲潛力
    mid: number; // 相對於中位數的上漲潛力
    high: number; // 相對於上限的上漲潛力
  };
  downside: {
    // 下跌風險
    low: number; // 相對於下限的下跌風險
    mid: number; // 相對於中位數的下跌風險
    high: number; // 相對於上限的下跌風險
  };
  riskRewardRatio: number; // 風險報酬比
}

// 估值歷史記錄介面
export interface ValuationHistory {
  symbol: string; // 股票代碼
  valuations: ValuationResult[]; // 歷史估值記錄
  lastUpdated: Date; // 最後更新時間
  trend: 'IMPROVING' | 'DETERIORATING' | 'STABLE'; // 趨勢
  volatility: number; // 估值波動性
}

// 估值設定介面
export interface ValuationSettings {
  defaultDiscountRate: number; // 預設折現率
  defaultTerminalGrowth: number; // 預設終期成長率
  defaultMarginOfSafety: number; // 預設安全邊際
  industrySpecificSettings: {
    // 產業特定設定
    [industry: string]: {
      peRange: { low: number; high: number };
      discountRate: number;
      growthRate: number;
    };
  };
  marketConditionAdjustments: {
    // 市場條件調整
    bullish: { peMultiplier: number; discountRateAdjustment: number };
    bearish: { peMultiplier: number; discountRateAdjustment: number };
    neutral: { peMultiplier: number; discountRateAdjustment: number };
  };
}
