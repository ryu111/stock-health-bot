"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAnalyzer = void 0;
const AnalysisEngine_1 = require("../engines/AnalysisEngine");
const FixedFormulaEngine_1 = require("../engines/FixedFormulaEngine");
const AIEngine_1 = require("../engines/AIEngine");
const analysis_1 = require("../types/analysis");
const stock_1 = require("../types/stock");
const Logger_1 = require("../utils/Logger");
// AI 分析器服務
class AIAnalyzer {
    constructor() {
        this.logger = Logger_1.Logger.getInstance();
        this.fixedEngine = new FixedFormulaEngine_1.FixedFormulaEngine();
        this.aiEngine = new AIEngine_1.AIEngine();
        // 註冊引擎
        AnalysisEngine_1.AnalysisEngineFactory.registerEngine(analysis_1.AnalysisType.TECHNICAL, FixedFormulaEngine_1.FixedFormulaEngine);
        AnalysisEngine_1.AnalysisEngineFactory.registerEngine(analysis_1.AnalysisType.COMPREHENSIVE, AIEngine_1.AIEngine);
    }
    /**
     * 分析股票
     * @param symbol - 股票代碼
     * @param data - 股票資料
     * @param type - 分析類型
     * @returns 分析結果
     */
    async analyzeStock(symbol, data, type = analysis_1.AnalysisType.COMPREHENSIVE) {
        try {
            this.logger.info(`開始分析股票: ${symbol}`, { symbol, type });
            // 如果沒有提供資料，使用模擬資料
            const stockData = data || this.getMockStockData(symbol);
            // 根據分析類型選擇引擎
            let result;
            switch (type) {
                case analysis_1.AnalysisType.TECHNICAL:
                    result = await this.fixedEngine.analyze(symbol, stockData);
                    break;
                case analysis_1.AnalysisType.COMPREHENSIVE:
                    result = await this.aiEngine.analyze(symbol, stockData);
                    break;
                default:
                    result = await this.aiEngine.analyze(symbol, stockData);
            }
            this.logger.info(`股票分析完成: ${symbol}`, {
                symbol,
                type,
                healthScore: result.healthScore,
                confidence: result.confidence,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`股票分析失敗: ${symbol}`, error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    /**
     * 批量分析股票
     * @param symbols - 股票代碼陣列
     * @param type - 分析類型
     * @returns 分析結果陣列
     */
    async analyzeMultipleStocks(symbols, type = analysis_1.AnalysisType.COMPREHENSIVE) {
        try {
            this.logger.info(`開始批量分析股票`, { symbols, type });
            const results = await Promise.allSettled(symbols.map(symbol => this.analyzeStock(symbol, undefined, type)));
            const analysisResults = results.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    this.logger.error(`分析失敗: ${symbols[index]}`, result.reason instanceof Error ? result.reason : new Error(String(result.reason)));
                    return this.createErrorResult(symbols[index] || 'unknown', result.reason);
                }
            });
            this.logger.info(`批量分析完成`, {
                total: symbols.length,
                success: analysisResults.filter(r => r.healthScore > 0).length,
            });
            return analysisResults;
        }
        catch (error) {
            this.logger.error('批量分析失敗', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    /**
     * 比較分析結果
     * @param results - 分析結果陣列
     * @returns 比較結果
     */
    compareAnalysisResults(results) {
        try {
            const comparison = {
                bestHealthScore: Math.max(...results.map(r => r.healthScore)),
                worstHealthScore: Math.min(...results.map(r => r.healthScore)),
                averageHealthScore: results.reduce((sum, r) => sum + r.healthScore, 0) / results.length,
                bestTechnicalScore: Math.max(...results.map(r => r.technicalScore)),
                bestFundamentalScore: Math.max(...results.map(r => r.fundamentalScore)),
                bestRiskScore: Math.max(...results.map(r => r.riskScore)),
                recommendations: {
                    buy: results.filter(r => r.recommendation === 'BUY').length,
                    hold: results.filter(r => r.recommendation === 'HOLD').length,
                    sell: results.filter(r => r.recommendation === 'SELL').length,
                },
                topPerformers: results
                    .sort((a, b) => b.healthScore - a.healthScore)
                    .slice(0, 5)
                    .map(r => ({ symbol: r.symbol, healthScore: r.healthScore })),
                riskAnalysis: results
                    .sort((a, b) => a.riskScore - b.riskScore)
                    .slice(0, 5)
                    .map(r => ({ symbol: r.symbol, riskScore: r.riskScore })),
            };
            return comparison;
        }
        catch (error) {
            this.logger.error('比較分析結果失敗', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    /**
     * 取得分析歷史
     * @param symbol - 股票代碼
     * @param limit - 限制數量
     * @returns 分析歷史
     */
    async getAnalysisHistory(symbol, limit = 10) {
        try {
            // 這裡應該從資料庫取得歷史分析記錄
            // 目前返回模擬資料
            const history = [];
            for (let i = 0; i < limit; i++) {
                const mockData = this.getMockStockData(symbol);
                const result = await this.analyzeStock(symbol, mockData);
                result.timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000); // 模擬不同時間
                history.push(result);
            }
            return history;
        }
        catch (error) {
            this.logger.error(`取得分析歷史失敗: ${symbol}`, error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    /**
     * 取得模擬股票資料
     * @param symbol - 股票代碼
     * @returns 模擬股票資料
     */
    getMockStockData(symbol) {
        const mockData = {
            '2330': {
                symbol: '2330',
                name: '台積電',
                price: 580,
                volume: 50000000,
                dividendYield: 0.02,
                marketCap: 15000000000000,
                currency: 'TWD',
                peRatio: 18.5,
                pbRatio: 6.2,
                eps: 31.35,
                roe: 0.25,
                debtToEquity: 0.15,
                currentRatio: 2.1,
                quickRatio: 1.8,
                inventoryTurnover: 8.5,
                assetTurnover: 0.6,
                netProfitMargin: 0.35,
                grossProfitMargin: 0.55,
                operatingMargin: 0.42,
                revenueGrowth: 0.15,
                earningsGrowth: 0.12,
                beta: 1.2,
                volatility: 0.25,
                sharpeRatio: 1.5,
                maxDrawdown: 0.15,
                var95: 0.08,
                sector: '科技',
                industry: '半導體',
                description: '台灣積體電路製造股份有限公司是全球最大的專業積體電路製造服務公司。',
                website: 'https://www.tsmc.com',
                employees: 65000,
                founded: 1987,
                marketType: stock_1.MarketType.TW_STOCK,
                lastUpdated: new Date(),
            },
            '2317': {
                symbol: '2317',
                name: '鴻海',
                price: 105,
                volume: 30000000,
                dividendYield: 0.03,
                marketCap: 1500000000000,
                currency: 'TWD',
                peRatio: 12.5,
                pbRatio: 1.8,
                eps: 8.4,
                roe: 0.15,
                debtToEquity: 0.25,
                currentRatio: 1.5,
                quickRatio: 1.2,
                inventoryTurnover: 6.2,
                assetTurnover: 0.8,
                netProfitMargin: 0.08,
                grossProfitMargin: 0.12,
                operatingMargin: 0.06,
                revenueGrowth: 0.08,
                earningsGrowth: 0.05,
                beta: 1.1,
                volatility: 0.22,
                sharpeRatio: 1.2,
                maxDrawdown: 0.18,
                var95: 0.09,
                sector: '科技',
                industry: '電子製造',
                description: '鴻海精密工業股份有限公司是全球最大的電子製造服務公司。',
                website: 'https://www.foxconn.com',
                employees: 800000,
                founded: 1974,
                marketType: stock_1.MarketType.TW_STOCK,
                lastUpdated: new Date(),
            },
        };
        return (mockData[symbol] || {
            symbol,
            name: `${symbol} 股票`,
            price: Math.random() * 100 + 10,
            volume: Math.floor(Math.random() * 10000000) + 1000000,
            dividendYield: Math.random() * 0.05,
            marketCap: Math.random() * 100000000000 + 10000000000,
            currency: 'TWD',
            peRatio: Math.random() * 20 + 5,
            pbRatio: Math.random() * 5 + 1,
            eps: Math.random() * 10 + 1,
            roe: Math.random() * 0.3 + 0.05,
            debtToEquity: Math.random() * 0.5 + 0.1,
            currentRatio: Math.random() * 2 + 1,
            quickRatio: Math.random() * 1.5 + 0.5,
            inventoryTurnover: Math.random() * 10 + 2,
            assetTurnover: Math.random() * 2 + 0.5,
            netProfitMargin: Math.random() * 0.2 + 0.05,
            grossProfitMargin: Math.random() * 0.4 + 0.2,
            operatingMargin: Math.random() * 0.25 + 0.1,
            revenueGrowth: Math.random() * 0.3 - 0.1,
            earningsGrowth: Math.random() * 0.4 - 0.2,
            beta: Math.random() * 2 + 0.5,
            volatility: Math.random() * 0.3 + 0.1,
            sharpeRatio: Math.random() * 2 + 0.5,
            maxDrawdown: Math.random() * 0.3 + 0.1,
            var95: Math.random() * 0.15 + 0.05,
            sector: '科技',
            industry: '電子',
            description: '模擬股票資料',
            website: 'https://example.com',
            employees: Math.floor(Math.random() * 10000) + 1000,
            founded: Math.floor(Math.random() * 50) + 1970,
            marketType: stock_1.MarketType.TW_STOCK,
            lastUpdated: new Date(),
        });
    }
    /**
     * 建立錯誤結果
     * @param symbol - 股票代碼
     * @param error - 錯誤
     * @returns 錯誤結果
     */
    createErrorResult(symbol, error) {
        return {
            symbol,
            type: analysis_1.AnalysisType.COMPREHENSIVE,
            marketType: stock_1.MarketType.TW_STOCK,
            technicalScore: 0,
            fundamentalScore: 0,
            riskScore: 0,
            healthScore: 0,
            recommendation: 'HOLD',
            confidence: 0,
            factors: [],
            timestamp: new Date(),
            dataQuality: 0,
            marketCondition: 'NEUTRAL',
            summary: `分析失敗: ${error}`,
            details: {
                technical: {},
                fundamental: {},
                risk: {},
            },
        };
    }
}
exports.AIAnalyzer = AIAnalyzer;
//# sourceMappingURL=AIAnalyzer.js.map