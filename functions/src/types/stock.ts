// 市場類型定義
export enum MarketType {
  TW_STOCK = 'TW_STOCK',
  ETF = 'ETF',
  US_STOCK = 'US_STOCK',
  CRYPTO = 'CRYPTO',
}

// 股票數據介面
export interface StockData {
  symbol: string;
  name: string;
  price: number | null;
  volume: number | null;
  dividendYield: number | null;
  marketCap: number | null;
  currency: string;
  peRatio: number | null;
  pbRatio: number | null;
  eps: number | null;
  roe: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  inventoryTurnover: number | null;
  assetTurnover: number | null;
  netProfitMargin: number | null;
  grossProfitMargin: number | null;
  operatingMargin: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  beta: number | null;
  volatility: number | null;
  sharpeRatio: number | null;
  maxDrawdown: number | null;
  var95: number | null;
  sector: string;
  industry: string;
  description: string;
  website: string;
  employees: number | null;
  founded: number | null;
  marketType: MarketType;
  lastUpdated: Date;
}

// ETF 數據介面
export interface ETFData extends StockData {
  marketType: MarketType.ETF;
  expenseRatio?: number | null;
  holdings?: number | null;
  assetClass?: string | null;
  category?: string | null;
}

// 技術指標介面
export interface TechnicalIndicators {
  rsi?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages?: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
}

// 基本面數據介面
export interface FundamentalData {
  pe: number;
  pb: number;
  roe: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  grossMargin: number;
  netMargin: number;
  revenueGrowth: number;
  earningsGrowth: number;
}

// 市場數據介面
export interface MarketData {
  type: MarketType;
  symbol: string;
  data: StockData | ETFData;
  technical?: TechnicalIndicators;
  fundamental?: FundamentalData;
}

// 多語系文字介面
export interface LocalizedText {
  zh_TW: string;
  en_US: string;
  ja_JP: string;
}

// 股票查詢請求介面
export interface StockQueryRequest {
  symbols: string[];
  marketType?: MarketType;
  includeTechnical?: boolean;
  includeFundamental?: boolean;
  language?: keyof LocalizedText;
}

// 股票查詢回應介面
export interface StockQueryResponse {
  success: boolean;
  data: MarketData[];
  errors?: string[];
  timestamp: Date;
}
