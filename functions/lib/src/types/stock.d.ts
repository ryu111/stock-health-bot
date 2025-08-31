export declare enum MarketType {
    TW_STOCK = "TW_STOCK",
    ETF = "ETF",
    US_STOCK = "US_STOCK",
    CRYPTO = "CRYPTO"
}
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
export interface ETFData extends StockData {
    marketType: MarketType.ETF;
    expenseRatio?: number | null;
    holdings?: number | null;
    assetClass?: string | null;
    category?: string | null;
}
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
export interface MarketData {
    type: MarketType;
    symbol: string;
    data: StockData | ETFData;
    technical?: TechnicalIndicators;
    fundamental?: FundamentalData;
}
export interface LocalizedText {
    zh_TW: string;
    en_US: string;
    ja_JP: string;
}
export interface StockQueryRequest {
    symbols: string[];
    marketType?: MarketType;
    includeTechnical?: boolean;
    includeFundamental?: boolean;
    language?: keyof LocalizedText;
}
export interface StockQueryResponse {
    success: boolean;
    data: MarketData[];
    errors?: string[];
    timestamp: Date;
}
//# sourceMappingURL=stock.d.ts.map