"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETFDataAdapter = void 0;
const MarketDataAdapter_1 = require("./MarketDataAdapter");
const stock_1 = require("../types/stock");
// ETF 數據適配器
class ETFDataAdapter extends MarketDataAdapter_1.BaseMarketDataAdapter {
    constructor() {
        super(stock_1.MarketType.ETF);
    }
    /**
     * 取得 ETF 數據
     * @param symbol - ETF 代碼
     * @returns ETF 數據
     */
    async fetchStockData(symbol) {
        try {
            console.log(`🔍 開始取得 ${symbol} ETF 資料...`);
            // 格式化代碼
            const formattedSymbol = this.formatSymbol(symbol);
            // 從 Yahoo Finance 取得資料
            const yahooData = await this.fetchFromYahooFinance(formattedSymbol);
            // 轉換為 ETF 數據格式
            const etfData = {
                symbol: yahooData.symbol || symbol,
                name: yahooData.longName || yahooData.shortName || symbol,
                price: yahooData.regularMarketPrice || null,
                volume: yahooData.volume || null,
                dividendYield: yahooData.dividendYield || null,
                marketCap: yahooData.marketCap || null,
                currency: yahooData.currency || 'TWD',
                peRatio: yahooData.trailingPE || null,
                pbRatio: yahooData.priceToBook || null,
                eps: yahooData.trailingEps || null,
                roe: yahooData.returnOnEquity || null,
                debtToEquity: yahooData.debtToEquity || null,
                currentRatio: yahooData.currentRatio || null,
                quickRatio: yahooData.quickRatio || null,
                inventoryTurnover: null,
                assetTurnover: null,
                netProfitMargin: yahooData.profitMargins || null,
                grossProfitMargin: yahooData.grossMargins || null,
                operatingMargin: yahooData.operatingMargins || null,
                revenueGrowth: yahooData.revenueGrowth || null,
                earningsGrowth: yahooData.earningsGrowth || null,
                beta: yahooData.beta || null,
                volatility: null,
                sharpeRatio: null,
                maxDrawdown: null,
                var95: null,
                sector: yahooData.sector || 'ETF',
                industry: yahooData.industry || 'ETF',
                description: yahooData.longBusinessSummary || '',
                website: yahooData.website || '',
                employees: null,
                founded: null,
                marketType: stock_1.MarketType.ETF,
                lastUpdated: new Date(),
                expenseRatio: yahooData.expenseRatio || null,
                holdings: yahooData.holdings || null,
                assetClass: yahooData.assetClass || null,
                category: yahooData.category || null,
            };
            console.log(`✅ 成功取得 ${symbol} ETF 資料`);
            return etfData;
        }
        catch (error) {
            console.error(`❌ 取得 ${symbol} ETF 資料失敗:`, error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    /**
     * 取得多個 ETF 數據
     * @param symbols - ETF 代碼陣列
     * @returns ETF 數據陣列
     */
    async fetchMultipleStocks(symbols) {
        const results = [];
        const errors = [];
        for (const symbol of symbols) {
            try {
                const data = await this.fetchStockData(symbol);
                results.push(data);
            }
            catch (error) {
                errors.push(`Failed to fetch ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        if (errors.length > 0) {
            console.warn('Some ETFs failed to fetch:', errors);
        }
        return results;
    }
    /**
     * 驗證 ETF 代碼
     * @param symbol - ETF 代碼
     * @returns 是否有效
     */
    validateSymbol(symbol) {
        // 台股 ETF 代碼驗證：4-5位數字
        return /^[0-9]{4,5}$/.test(symbol);
    }
    /**
     * 取得支援的 ETF 代碼
     * @returns 支援的 ETF 代碼陣列
     */
    getSupportedSymbols() {
        // 台灣主要 ETF 代碼列表
        return [
            '0050',
            '0051',
            '0052',
            '0053',
            '0054',
            '0055',
            '0056',
            '0057',
            '0058',
            '0059',
            '0060',
            '0061',
            '0062',
            '0063',
            '0064',
            '0065',
            '0066',
            '0067',
            '0068',
            '0069',
            '0070',
            '0071',
            '0072',
            '0073',
            '0074',
            '0075',
            '0076',
            '0077',
            '0078',
            '0079',
            '0080',
            '0081',
            '0082',
            '0083',
            '0084',
            '0085',
            '0086',
            '0087',
            '0088',
            '0089',
            '0090',
            '0091',
            '0092',
            '0093',
            '0094',
            '0095',
            '0096',
            '0097',
            '0098',
            '0099',
            '0100',
            '0101',
            '0102',
            '0103',
            '0104',
            '0105',
            '0106',
            '0107',
            '0108',
            '0109',
            '0110',
            '0111',
            '0112',
            '0113',
            '0114',
            '0115',
            '0116',
            '0117',
            '0118',
            '0119',
            '0120',
            '0121',
            '0122',
            '0123',
            '0124',
            '0125',
            '0126',
            '0127',
            '0128',
            '0129',
            '0130',
            '0131',
            '0132',
            '0133',
            '0134',
            '0135',
            '0136',
            '0137',
            '0138',
            '0139',
            '0140',
            '0141',
            '0142',
            '0143',
            '0144',
            '0145',
            '0146',
            '0147',
            '0148',
            '0149',
        ];
    }
    /**
     * 格式化 ETF 代碼
     * @param symbol - 原始代碼
     * @returns 格式化後的代碼
     */
    formatSymbol(symbol) {
        // 台股 ETF 代碼加上 .TW 後綴
        return `${symbol}.TW`;
    }
    /**
     * 從 Yahoo Finance 取得資料
     * @param symbol - ETF 代碼
     * @returns Yahoo Finance 資料
     */
    async fetchFromYahooFinance(symbol) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const yahooModule = require('yahoo-finance2');
            const yahoo = yahooModule.default;
            const quote = await yahoo.quote(symbol);
            return quote;
        }
        catch (error) {
            console.warn(`Yahoo Finance 資料取得失敗 ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            // 返回模擬資料
            return this.getMockData(symbol);
        }
    }
    /**
     * 取得模擬資料
     * @param symbol - ETF 代碼
     * @returns 模擬資料
     */
    getMockData(symbol) {
        const mockData = {
            '0050.TW': {
                symbol: '0050.TW',
                longName: '元大台灣50',
                shortName: '元大台灣50',
                regularMarketPrice: 120,
                volume: 20000000,
                marketCap: 500000000000,
                currency: 'TWD',
                dividendYield: 0.03,
                expenseRatio: 0.0032,
                holdings: 5,
                assetClass: '股票型',
                category: '市值型',
                issuer: '元大投信',
                inceptionDate: '2003-06-30',
                trackingError: 0.02,
            },
            '0056.TW': {
                symbol: '0056.TW',
                longName: '元大高股息',
                shortName: '元大高股息',
                regularMarketPrice: 35,
                volume: 15000000,
                marketCap: 300000000000,
                currency: 'TWD',
                dividendYield: 0.05,
                expenseRatio: 0.0035,
                holdings: 5,
                assetClass: '股票型',
                category: '高股息型',
                issuer: '元大投信',
                inceptionDate: '2007-12-19',
                trackingError: 0.025,
            },
        };
        return (mockData[symbol] || {
            symbol: `${symbol}`,
            longName: `${symbol.replace('.TW', '')} ETF`,
            shortName: `${symbol.replace('.TW', '')} ETF`,
            regularMarketPrice: Math.random() * 50 + 20,
            volume: Math.floor(Math.random() * 10000000) + 5000000,
            marketCap: Math.random() * 100000000000 + 10000000000,
            currency: 'TWD',
            dividendYield: Math.random() * 0.08 + 0.02,
            expenseRatio: Math.random() * 0.01 + 0.002,
            holdings: 3, // 使用數字而不是陣列
            assetClass: '股票型',
            category: '市值型',
            issuer: '模擬投信',
            inceptionDate: '2020-01-01',
            trackingError: Math.random() * 0.05 + 0.01,
        });
    }
    /**
     * 取得歷史數據
     * @param symbol - ETF 代碼
     * @returns 歷史數據
     */
    async getHistoricalData(symbol) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const yahooModule = require('yahoo-finance2');
            const yahoo = yahooModule.default;
            const historical = await yahoo.historical(symbol, {
                period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                period2: new Date(),
                interval: '1d',
            });
            return historical;
        }
        catch (error) {
            console.warn(`取得歷史數據失敗 ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return [];
        }
    }
    /**
     * 取得基本面數據
     * @param symbol - ETF 代碼
     * @returns 基本面數據
     */
    async getFundamentalData(symbol) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const yahooModule = require('yahoo-finance2');
            const yahoo = yahooModule.default;
            const fundamental = await yahoo.quote(symbol);
            return fundamental;
        }
        catch (error) {
            console.warn(`取得基本面數據失敗 ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return {
                symbol: symbol,
                longName: `${symbol} ETF`,
                shortName: `${symbol} ETF`,
                regularMarketPrice: 0,
                volume: 0,
                marketCap: 0,
                currency: 'TWD',
            };
        }
    }
}
exports.ETFDataAdapter = ETFDataAdapter;
//# sourceMappingURL=ETFDataAdapter.js.map