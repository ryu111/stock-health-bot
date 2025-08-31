declare module 'yahoo-finance2' {
  export interface YahooFinanceQuote {
    symbol: string;
    longName?: string;
    shortName?: string;
    regularMarketPrice?: number;
    volume?: number;
    dividendYield?: number;
    marketCap?: number;
    currency?: string;
    trailingPE?: number;
    priceToBook?: number;
    trailingEps?: number;
    returnOnEquity?: number;
    debtToEquity?: number;
    currentRatio?: number;
    quickRatio?: number;
    profitMargins?: number;
    grossMargins?: number;
    operatingMargins?: number;
    revenueGrowth?: number;
    earningsGrowth?: number;
    beta?: number;
    regularMarketDayRange?: string;
    sector?: string;
    industry?: string;
    longBusinessSummary?: string;
    website?: string;
    fullTimeEmployees?: number;
    founded?: number;
    expenseRatio?: number;
    holdings?: number;
    assetClass?: string;
    category?: string;
    issuer?: string;
    inceptionDate?: string;
    trackingError?: number;
    previousClose?: number;
    averageVolume?: number;
    inventoryTurnover?: number;
    assetTurnover?: number;
    netIncomeToCommon?: number;
  }

  export interface YahooFinanceHistoricalData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }

  export interface YahooFinanceModule {
    quote(symbol: string): Promise<YahooFinanceQuote>;
    historical(
      symbol: string,
      options?: {
        period1?: string | Date;
        period2?: string | Date;
        interval?: string;
      }
    ): Promise<YahooFinanceHistoricalData[]>;
  }

  const yahooFinance: YahooFinanceModule;
  export default yahooFinance;
}
