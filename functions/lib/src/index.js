"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorMemory = exports.cleanupCache = exports.stockHealthAPI = void 0;
// 股健檢 LINE Bot 主入口檔案
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const LineBotController_1 = require("./controllers/LineBotController");
const StockService_1 = require("./services/StockService");
const AIAnalyzer_1 = require("./services/AIAnalyzer");
const ETFDataService_1 = require("./services/ETFDataService");
const FirebaseConfig_1 = require("./config/FirebaseConfig");
const Logger_1 = require("./utils/Logger");
const Cache_1 = require("./utils/Cache");
const Validation_1 = require("./utils/Validation");
// 初始化 Firebase
const firebaseConfig = FirebaseConfig_1.FirebaseConfig.getInstance();
firebaseConfig.initialize();
const lineBotController = new LineBotController_1.LineBotController();
const stockService = new StockService_1.StockService();
const aiAnalyzer = new AIAnalyzer_1.AIAnalyzer();
const etfDataService = new ETFDataService_1.ETFDataService();
const logger = Logger_1.Logger.getInstance();
const cache = new Cache_1.Cache({
    ttl: 300, // 5 分鐘
    maxSize: 1000,
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 請求日誌中間件
app.use((req, res, next) => {
    const startTime = Date.now();
    logger.info(`API 請求: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
    });
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.logApiRequest(req.method, req.path, res.statusCode, duration, req.get('User-Agent'));
    });
    next();
});
// LINE Bot Webhook
app.post('/webhook', async (req, res) => {
    try {
        await lineBotController.handleWebhook(req, res);
    }
    catch (error) {
        logger.error('Webhook 處理失敗', error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
});
// 股票查詢 API
app.get('/api/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        if (!symbol || !Validation_1.Validation.isValidStockSymbol(symbol)) {
            return res.status(400).json({
                success: false,
                error: '無效的股票代碼',
                message: '請提供有效的股票代碼（4-5位數字）',
            });
        }
        const stockData = await stockService.getStockData(symbol);
        if (!stockData) {
            return res.status(404).json({
                success: false,
                error: '找不到股票資料',
                message: `找不到股票 ${symbol} 的資料`,
            });
        }
        return res.json({
            success: true,
            data: stockData,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error('股票查詢失敗', error instanceof Error ? error : new Error(String(error)));
        return res.status(500).json({
            success: false,
            error: '查詢失敗',
            message: '股票查詢失敗，請稍後再試',
        });
    }
});
// ETF 查詢 API
app.get('/api/etf/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        if (!symbol || !Validation_1.Validation.isValidETFSymbol(symbol)) {
            return res.status(400).json({
                success: false,
                error: '無效的 ETF 代碼',
                message: '請提供有效的 ETF 代碼（4-5位數字）',
            });
        }
        const etfData = await etfDataService.getETFData(symbol);
        if (!etfData) {
            return res.status(404).json({
                success: false,
                error: '找不到 ETF 資料',
                message: `找不到 ETF ${symbol} 的資料`,
            });
        }
        return res.json({
            success: true,
            data: etfData,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error('ETF 查詢失敗', error instanceof Error ? error : new Error(String(error)));
        return res.status(500).json({
            success: false,
            error: '查詢失敗',
            message: 'ETF 查詢失敗，請稍後再試',
        });
    }
});
// 股票分析 API
app.post('/api/analyze', async (req, res) => {
    try {
        const { symbol } = req.body;
        if (!symbol) {
            return res.status(400).json({
                success: false,
                error: '缺少參數',
                message: '請提供股票代碼',
            });
        }
        if (!Validation_1.Validation.isValidStockSymbol(symbol)) {
            return res.status(400).json({
                success: false,
                error: '無效的股票代碼',
                message: '請提供有效的股票代碼',
            });
        }
        const stockData = await stockService.getStockData(symbol);
        if (!stockData) {
            return res.status(404).json({
                success: false,
                error: '找不到股票資料',
                message: `找不到股票 ${symbol} 的資料`,
            });
        }
        const analysisResult = await aiAnalyzer.analyzeStock(symbol);
        return res.json({
            success: true,
            data: analysisResult,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error('股票分析失敗', error instanceof Error ? error : new Error(String(error)));
        return res.status(500).json({
            success: false,
            error: '分析失敗',
            message: '股票分析失敗，請稍後再試',
        });
    }
});
// 批量分析 API
app.post('/api/analyze/batch', async (req, res) => {
    try {
        const { symbols } = req.body;
        if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
            return res.status(400).json({
                success: false,
                error: '缺少參數',
                message: '請提供股票代碼陣列',
            });
        }
        if (symbols.length > 10) {
            return res.status(400).json({
                success: false,
                error: '參數過多',
                message: '一次最多分析 10 支股票',
            });
        }
        const results = await Promise.allSettled(symbols.map(async (symbol) => {
            try {
                const analysis = await aiAnalyzer.analyzeStock(symbol);
                return { symbol, success: true, data: analysis };
            }
            catch (error) {
                return {
                    symbol,
                    success: false,
                    error: error instanceof Error ? error.message : '分析失敗'
                };
            }
        }));
        const analysisResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            return {
                symbol: symbols[index],
                success: false,
                error: '分析失敗'
            };
        });
        return res.json({
            success: true,
            data: analysisResults,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error('批量分析失敗', error instanceof Error ? error : new Error(String(error)));
        return res.status(500).json({
            success: false,
            error: '分析失敗',
            message: '批量分析失敗，請稍後再試',
        });
    }
});
// 健康檢查 API
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
        version: '1.0.0',
    });
});
// 快取狀態 API
app.get('/api/cache/status', (_req, res) => {
    const cacheStatus = cache.getStats();
    res.json({
        success: true,
        data: cacheStatus,
        timestamp: new Date().toISOString(),
    });
});
// 清除快取 API
app.post('/api/cache/clear', (_req, res) => {
    cache.clear();
    res.json({
        success: true,
        message: '快取已清除',
        timestamp: new Date().toISOString(),
    });
});
// 404 處理
app.use('*', (_req, res) => {
    res.status(404).json({
        success: false,
        error: '找不到資源',
        message: '請求的 API 端點不存在',
    });
});
// 錯誤處理中間件
app.use((error, _req, res) => {
    logger.error('未處理的錯誤', error);
    res.status(500).json({
        success: false,
        error: '內部伺服器錯誤',
        message: '發生未預期的錯誤，請稍後再試',
    });
});
// 匯出 Firebase Functions
exports.stockHealthAPI = functions.https.onRequest(app);
// 定期清理快取 (HTTP 觸發器，可以通過 Cloud Scheduler 呼叫)
exports.cleanupCache = functions.https.onRequest(async (_req, res) => {
    try {
        cache.manualCleanup();
        logger.info('定期快取清理完成');
        res.status(200).json({ success: true, message: '快取清理完成' });
    }
    catch (error) {
        logger.error('快取清理失敗', error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({ success: false, error: '快取清理失敗' });
    }
});
// 記憶體監控 (HTTP 觸發器，可以通過 Cloud Scheduler 呼叫)
exports.monitorMemory = functions.https.onRequest(async (_req, res) => {
    try {
        const used = process.memoryUsage();
        const memoryInfo = {
            rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
            heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
            heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
            external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`,
        };
        logger.info('記憶體使用狀況', memoryInfo);
        res.status(200).json({ success: true, memory: memoryInfo });
    }
    catch (error) {
        logger.error('記憶體監控失敗', error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({ success: false, error: '記憶體監控失敗' });
    }
});
//# sourceMappingURL=index.js.map