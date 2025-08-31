"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const types_1 = require("../types");
const StockDataAdapter_1 = require("../adapters/StockDataAdapter");
const ETFDataAdapter_1 = require("../adapters/ETFDataAdapter");
// 股票服務類別
class StockService {
    constructor() {
        this.stockAdapter = new StockDataAdapter_1.StockDataAdapter();
        this.etfAdapter = new ETFDataAdapter_1.ETFDataAdapter();
    }
    /**
     * 取得股票資料並快取
     * @param symbol - 股票代碼 (例如: '2330.TW')
     * @returns 股票資料物件
     */
    async getStockData(symbol) {
        try {
            console.log(`🔍 開始取得 ${symbol} 股票資料...`);
            // 使用新的適配器系統
            const marketType = this.detectMarketType(symbol);
            let stockData;
            if (marketType === types_1.MarketType.TW_STOCK) {
                stockData = await this.stockAdapter.fetchStockData(symbol);
            }
            else if (marketType === types_1.MarketType.ETF) {
                stockData = await this.etfAdapter.fetchStockData(symbol);
            }
            else {
                throw new Error(`Unsupported market type for symbol: ${symbol}`);
            }
            // 轉換為統一格式
            const quoteData = this.convertToQuoteData(stockData, symbol);
            // 計算額外指標
            quoteData.dailyChange = this.calculatePercentageChange(quoteData.price || 0, quoteData.previousClose || 0);
            // 確保所有欄位都有有效值
            const sanitizedData = {
                symbol: quoteData.symbol || '',
                name: quoteData.name || '',
                price: quoteData.price || null,
                previousClose: quoteData.previousClose || null,
                marketCap: quoteData.marketCap || null,
                volume: quoteData.volume || null,
                peRatio: quoteData.peRatio || null,
                eps: quoteData.eps || null,
                dividendYield: quoteData.dividendYield || null,
                fiftyTwoWeekHigh: quoteData.fiftyTwoWeekHigh || null,
                fiftyTwoWeekLow: quoteData.fiftyTwoWeekLow || null,
                currency: quoteData.currency || 'TWD',
                exchange: quoteData.exchange || '',
                dailyChange: quoteData.dailyChange || 0,
                priceToBook: quoteData.priceToBook || null,
                returnOnEquity: quoteData.returnOnEquity || null,
            };
            console.log(`✅ 成功取得 ${symbol} 股票資料`);
            return sanitizedData;
        }
        catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`無法取得 ${symbol} 的股票數據`);
        }
    }
    /**
     * 基於多個指標計算健康分數
     * @param data - 股票資料物件
     * @returns 健康分數 (0-100)
     */
    calculateHealthScore(data) {
        let score = 50; // 基礎分數
        // 價格與 52 週範圍比較 (30% 權重)
        if (data.price && data.fiftyTwoWeekLow && data.fiftyTwoWeekHigh) {
            const pricePosition = (data.price - data.fiftyTwoWeekLow) / (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow);
            if (pricePosition < 0.3) {
                score += 20; // 超賣 - 良好買入機會
            }
            else if (pricePosition > 0.7) {
                score -= 15; // 超買 - 潛在疑慮
            }
        }
        // 本益比分析 (20% 權重)
        if (data.peRatio) {
            if (data.peRatio < 15) {
                score += 15; // 可能被低估
            }
            else if (data.peRatio > 30) {
                score -= 15; // 可能被高估
            }
        }
        // 日漲跌幅 (15% 權重)
        if (data.dailyChange > 3) {
            score -= 10; // 大幅正漲跌幅可能表示波動性
        }
        else if (data.dailyChange < -3) {
            score += 10; // 大幅負漲跌幅可能表示買入機會
        }
        // 成交量分析 (15% 權重)
        if (data.volume) {
            // 高成交量通常表示強烈的交易興趣
            score += 5;
        }
        // 股息率 (10% 權重)
        if (data.dividendYield) {
            if (data.dividendYield > 0.03) {
                // >3%
                score += 8; // 良好股息率
            }
        }
        // 權益報酬率 (10% 權重)
        if (data.returnOnEquity) {
            if (data.returnOnEquity > 0.1) {
                // >10%
                score += 7; // 強勁 ROE
            }
            else if (data.returnOnEquity < 0) {
                score -= 10; // 負 ROE 令人擔憂
            }
        }
        // 確保分數在範圍內
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    /**
     * 格式化市值以顯示
     * @param marketCap - 市值
     * @returns 格式化的市值
     */
    formatMarketCap(marketCap) {
        if (!marketCap)
            return 'N/A';
        if (marketCap >= 1e12) {
            return (marketCap / 1e12).toFixed(1) + ' 兆';
        }
        else if (marketCap >= 1e9) {
            return (marketCap / 1e9).toFixed(1) + ' 億';
        }
        else if (marketCap >= 1e6) {
            return (marketCap / 1e6).toFixed(1) + ' 萬';
        }
        else {
            return marketCap.toString();
        }
    }
    /**
     * 計算百分比變化
     * @param current - 當前值
     * @param previous - 先前值
     * @returns 百分比變化
     */
    calculatePercentageChange(current, previous) {
        if (!previous || previous === 0)
            return 0;
        return ((current - previous) / previous) * 100;
    }
    /**
     * 取得歷史資料以進行趨勢分析
     * @param symbol - 股票代碼
     * @param period - 期間 ('1mo', '3mo', '6mo', '1y')
     * @returns 歷史資料點
     */
    async getHistoricalData(symbol, _period = '3mo') {
        try {
            const marketType = this.detectMarketType(symbol);
            let historicalData;
            if (marketType === types_1.MarketType.TW_STOCK) {
                historicalData = (await this.stockAdapter.getHistoricalData(symbol));
            }
            else if (marketType === types_1.MarketType.ETF) {
                historicalData = (await this.etfAdapter.getHistoricalData(symbol));
            }
            else {
                throw new Error(`Unsupported market type for symbol: ${symbol}`);
            }
            return historicalData.map(item => ({
                date: new Date(item['date']),
                open: item['open'],
                high: item['high'],
                low: item['low'],
                close: item['close'],
                volume: item['volume'],
            }));
        }
        catch (error) {
            console.error(`Error fetching historical data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return [];
        }
    }
    /**
     * 取得多個股票資料
     * @param symbols - 股票代碼陣列
     * @returns 股票資料物件陣列
     */
    async getMultipleStocks(symbols) {
        const promises = symbols.map(symbol => this.getStockData(symbol).catch(error => {
            console.error(`Failed to fetch ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return null;
        }));
        const results = await Promise.all(promises);
        return results.filter((result) => result !== null);
    }
    /**
     * 分析股票趨勢
     * @param symbol - 股票代碼
     * @returns 趨勢分析
     */
    async analyzeTrend(symbol) {
        try {
            const historicalData = await this.getHistoricalData(symbol, '3mo');
            if (historicalData.length < 10) {
                return { trend: 'unknown', strength: 0 };
            }
            const prices = historicalData.map(item => item.close);
            const recentPrices = prices.slice(-10); // 最近 10 天
            const olderPrices = prices.slice(-30, -20); // 10-20 天前
            const recentAvg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
            const olderAvg = olderPrices.reduce((sum, price) => sum + price, 0) / olderPrices.length;
            const trend = recentAvg > olderAvg ? 'up' : 'down';
            const strength = Math.abs((recentAvg - olderAvg) / olderAvg) * 100;
            return { trend, strength: Math.min(100, strength) };
        }
        catch (error) {
            console.error(`Error analyzing trend for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return { trend: 'unknown', strength: 0 };
        }
    }
    /**
     * 使用統一服務取得股票資料
     * @param request - 股票查詢請求
     * @returns 股票查詢回應
     */
    getStocksByRequest(_request) {
        // 暫時返回空回應，因為 UnifiedMarketDataService 沒有 fetchData 方法
        return {
            success: false,
            data: [],
            errors: ['Service not implemented'],
            timestamp: new Date(),
        };
    }
    // 私有方法
    /**
     * 檢測市場類型
     * @param symbol - 股票代碼
     * @returns 市場類型
     */
    detectMarketType(symbol) {
        // 移除 .TW 後綴進行檢測
        const cleanSymbol = symbol.replace('.TW', '');
        if (/^\d{4}$/.test(cleanSymbol)) {
            return types_1.MarketType.TW_STOCK;
        }
        if (/^[A-Z]{2,5}$/.test(cleanSymbol)) {
            return types_1.MarketType.ETF;
        }
        if (/^[A-Z]{1,5}$/.test(cleanSymbol)) {
            return types_1.MarketType.US_STOCK;
        }
        return types_1.MarketType.TW_STOCK; // 預設
    }
    /**
     * 轉換為統一報價資料格式
     * @param stockData - 股票資料
     * @param symbol - 股票代碼
     * @returns 統一格式的報價資料
     */
    convertToQuoteData(stockData, _symbol) {
        return {
            symbol: stockData.symbol,
            name: stockData.name,
            price: stockData.price,
            previousClose: null, // 需要從歷史資料計算
            marketCap: stockData.marketCap || null,
            volume: stockData.volume,
            peRatio: stockData.peRatio || null,
            eps: null, // 需要額外取得
            dividendYield: stockData.dividendYield || null,
            fiftyTwoWeekHigh: null, // 需要從歷史資料計算
            fiftyTwoWeekLow: null, // 需要從歷史資料計算
            currency: stockData.currency,
            exchange: 'TWSE', // 預設台灣證券交易所
            dailyChange: 0, // 需要從歷史資料計算
            priceToBook: null, // 需要額外取得
            returnOnEquity: stockData.roe || null, // 需要額外取得
        };
    }
}
exports.StockService = StockService;
//# sourceMappingURL=StockService.js.map