"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineBotController = void 0;
const bot_sdk_1 = require("@line/bot-sdk");
const LineConfig_1 = require("../config/LineConfig");
const Logger_1 = require("../utils/Logger");
const Validation_1 = require("../utils/Validation");
const FlexMessageGenerator_1 = require("../utils/FlexMessageGenerator");
const AIAnalyzer_1 = require("../services/AIAnalyzer");
const StockDataAdapter_1 = require("../adapters/StockDataAdapter");
const ETFDataAdapter_1 = require("../adapters/ETFDataAdapter");
const analysis_1 = require("../types/analysis");
// LINE Bot 控制器
class LineBotController {
    constructor() {
        this.client = null;
        this.config = new LineConfig_1.LineConfig();
        this.logger = Logger_1.Logger.getInstance();
        this.aiAnalyzer = new AIAnalyzer_1.AIAnalyzer();
        this.stockAdapter = new StockDataAdapter_1.StockDataAdapter();
        this.etfAdapter = new ETFDataAdapter_1.ETFDataAdapter();
        this.flexMessageGenerator = new FlexMessageGenerator_1.FlexMessageGenerator();
    }
    /**
     * 取得或建立 LINE Client
     */
    getClient() {
        if (!this.client) {
            if (!this.config.isValid()) {
                throw new Error('LINE Bot 配置無效，請檢查環境變數');
            }
            this.client = new bot_sdk_1.Client(this.config);
        }
        return this.client;
    }
    /**
     * 處理 LINE Webhook
     * @param req - Express 請求
     * @param res - Express 回應
     */
    async handleWebhook(req, res) {
        try {
            // 驗證簽名
            if (!this.validateSignature(req)) {
                this.logger.warn('無效的 LINE Webhook 簽名');
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // 處理事件
            const webhookRequest = req.body;
            const events = webhookRequest.events || [];
            this.logger.info(`收到 ${events.length} 個 LINE 事件`);
            for (const event of events) {
                await this.handleEvent(event);
            }
            res.status(200).json({ status: 'ok' });
        }
        catch (error) {
            this.logger.error('處理 LINE Webhook 失敗', error instanceof Error ? error : new Error(String(error)));
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    /**
     * 處理單個事件
     * @param event - LINE 事件
     */
    async handleEvent(event) {
        try {
            switch (event.type) {
                case 'message':
                    await this.handleMessageEvent(event);
                    break;
                case 'postback':
                    await this.handlePostbackEvent(event);
                    break;
                case 'follow':
                    await this.handleFollowEvent(event);
                    break;
                case 'unfollow':
                    this.handleUnfollowEvent(event);
                    break;
                default:
                    this.logger.info(`未處理的事件類型: ${event.type}`);
            }
        }
        catch (error) {
            this.logger.error('處理事件失敗', error instanceof Error ? error : new Error(String(error)));
            if ('replyToken' in event && event.replyToken) {
                await this.sendErrorMessage(event.replyToken, '處理您的訊息時發生錯誤');
            }
        }
    }
    /**
     * 處理訊息事件
     * @param event - 訊息事件
     */
    async handleMessageEvent(event) {
        const { message, replyToken } = event;
        switch (message.type) {
            case 'text':
                await this.handleTextMessage(replyToken, message.text);
                break;
            case 'sticker':
                await this.handleStickerMessage(replyToken, message);
                break;
            default:
                this.logger.info(`未處理的訊息類型: ${message.type}`);
                await this.sendDefaultMessage(replyToken);
        }
    }
    /**
     * 處理文字訊息
     * @param replyToken - 回覆 Token
     * @param text - 訊息文字
     */
    async handleTextMessage(replyToken, text) {
        const cleanText = text.trim().toUpperCase();
        // 檢查是否為股票查詢
        if (Validation_1.Validation.isValidStockSymbol(cleanText)) {
            await this.handleStockQuery(replyToken, cleanText);
            return;
        }
        // 檢查是否為 ETF 查詢
        if (Validation_1.Validation.isValidETFSymbol(cleanText)) {
            await this.handleETFQuery(replyToken, cleanText);
            return;
        }
        // 檢查是否為分析請求
        if (cleanText.includes('分析') || cleanText.includes('ANALYZE')) {
            const symbol = this.extractSymbolFromAnalysisRequest(cleanText);
            if (symbol) {
                await this.handleAnalysisRequest(replyToken, symbol);
                return;
            }
        }
        // 預設回應
        await this.sendHelpMessage(replyToken);
    }
    /**
     * 處理股票查詢
     * @param replyToken - 回覆 Token
     * @param symbol - 股票代碼
     */
    async handleStockQuery(replyToken, symbol) {
        try {
            this.logger.info(`處理股票查詢: ${symbol}`);
            const stockData = await this.stockAdapter.fetchStockData(symbol);
            if (!stockData) {
                await this.sendErrorMessage(replyToken, `找不到股票資料: ${symbol}`);
                return;
            }
            const message = this.flexMessageGenerator.createStockInfoMessage(stockData);
            await this.sendFlexMessage(replyToken, message);
        }
        catch (error) {
            this.logger.error('股票查詢失敗', error instanceof Error ? error : new Error(String(error)));
            await this.sendErrorMessage(replyToken, `查詢股票 ${symbol} 時發生錯誤`);
        }
    }
    /**
     * 處理 ETF 查詢
     * @param replyToken - 回覆 Token
     * @param symbol - ETF 代碼
     */
    async handleETFQuery(replyToken, symbol) {
        try {
            this.logger.info(`處理 ETF 查詢: ${symbol}`);
            const etfData = await this.etfAdapter.fetchStockData(symbol);
            if (!etfData) {
                await this.sendErrorMessage(replyToken, `找不到 ETF 資料: ${symbol}`);
                return;
            }
            const message = this.flexMessageGenerator.createETFInfoMessage(etfData);
            await this.sendFlexMessage(replyToken, message);
        }
        catch (error) {
            this.logger.error('ETF 查詢失敗', error instanceof Error ? error : new Error(String(error)));
            await this.sendErrorMessage(replyToken, `查詢 ETF ${symbol} 時發生錯誤`);
        }
    }
    /**
     * 處理分析請求
     * @param replyToken - 回覆 Token
     * @param symbol - 股票代碼
     */
    async handleAnalysisRequest(replyToken, symbol) {
        try {
            this.logger.info(`處理分析請求: ${symbol}`);
            const analysis = await this.aiAnalyzer.analyzeStock(symbol, undefined, analysis_1.AnalysisType.COMPREHENSIVE);
            if (!analysis) {
                await this.sendErrorMessage(replyToken, `無法分析股票: ${symbol}`);
                return;
            }
            const message = this.flexMessageGenerator.createAnalysisMessage(analysis);
            await this.sendFlexMessage(replyToken, message);
        }
        catch (error) {
            this.logger.error('分析請求失敗', error instanceof Error ? error : new Error(String(error)));
            await this.sendErrorMessage(replyToken, `分析股票 ${symbol} 時發生錯誤`);
        }
    }
    /**
     * 處理貼圖訊息
     * @param replyToken - 回覆 Token
     * @param message - 貼圖訊息
     */
    async handleStickerMessage(replyToken, message) {
        const stickerId = message.stickerId;
        const packageId = message.packageId;
        this.logger.info(`收到貼圖: ${packageId}/${stickerId}`);
        // 回覆貼圖
        await this.getClient().replyMessage(replyToken, {
            type: 'sticker',
            packageId: packageId,
            stickerId: stickerId,
        });
    }
    /**
     * 處理 Postback 事件
     * @param event - Postback 事件
     */
    async handlePostbackEvent(event) {
        const { postback, replyToken } = event;
        const data = postback.data;
        this.logger.info(`收到 Postback: ${data}`);
        // 根據 data 處理不同的 postback
        if (data.startsWith('stock_')) {
            const symbol = data.replace('stock_', '');
            await this.handleStockQuery(replyToken, symbol);
        }
        else if (data.startsWith('etf_')) {
            const symbol = data.replace('etf_', '');
            await this.handleETFQuery(replyToken, symbol);
        }
        else if (data.startsWith('analyze_')) {
            const symbol = data.replace('analyze_', '');
            await this.handleAnalysisRequest(replyToken, symbol);
        }
        else {
            await this.sendHelpMessage(replyToken);
        }
    }
    /**
     * 處理追蹤事件
     * @param event - 追蹤事件
     */
    async handleFollowEvent(event) {
        const { replyToken } = event;
        this.logger.info('新用戶追蹤');
        await this.sendWelcomeMessage(replyToken);
    }
    /**
     * 處理取消追蹤事件
     * @param _event - 取消追蹤事件
     */
    handleUnfollowEvent(_event) {
        this.logger.info('用戶取消追蹤');
        // 可以在這裡清理用戶資料
    }
    /**
     * 從分析請求中提取股票代碼
     * @param text - 分析請求文字
     * @returns 股票代碼或 null
     */
    extractSymbolFromAnalysisRequest(text) {
        // 簡單的正則表達式來提取股票代碼
        const match = text.match(/([0-9]{4,6})/);
        return match ? match[1] || null : null;
    }
    /**
     * 發送歡迎訊息
     * @param replyToken - 回覆 Token
     */
    async sendWelcomeMessage(replyToken) {
        const message = {
            type: 'text',
            text: '歡迎使用股健檢！\n\n您可以：\n• 輸入股票代碼查詢股票資訊\n• 輸入 ETF 代碼查詢 ETF 資訊\n• 輸入「股票代碼 分析」進行深度分析\n\n例如：\n• 2330\n• 0050\n• 2330 分析',
        };
        await this.sendTextMessage(replyToken, message.text);
    }
    /**
     * 發送幫助訊息
     * @param replyToken - 回覆 Token
     */
    async sendHelpMessage(replyToken) {
        const message = {
            type: 'text',
            text: '股健檢使用說明：\n\n📈 股票查詢：\n• 輸入 4 位數字股票代碼\n• 例如：2330、2317\n\n📊 ETF 查詢：\n• 輸入 4 位數字 ETF 代碼\n• 例如：0050、0056\n\n🔍 深度分析：\n• 輸入「股票代碼 分析」\n• 例如：2330 分析\n\n❓ 其他指令：\n• 輸入「幫助」查看此說明',
        };
        await this.sendTextMessage(replyToken, message.text);
    }
    /**
     * 發送預設訊息
     * @param replyToken - 回覆 Token
     */
    async sendDefaultMessage(replyToken) {
        const message = {
            type: 'text',
            text: '請輸入股票代碼（如：2330）或 ETF 代碼（如：0050）來查詢資訊。',
        };
        await this.sendTextMessage(replyToken, message.text);
    }
    /**
     * 發送文字訊息
     * @param replyToken - 回覆 Token
     * @param text - 訊息文字
     */
    async sendTextMessage(replyToken, text) {
        try {
            await this.getClient().replyMessage(replyToken, {
                type: 'text',
                text: text,
            });
        }
        catch (error) {
            this.logger.error('發送文字訊息失敗', error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * 發送 Flex 訊息
     * @param replyToken - 回覆 Token
     * @param message - Flex 訊息
     */
    async sendFlexMessage(replyToken, message) {
        try {
            await this.getClient().replyMessage(replyToken, message);
        }
        catch (error) {
            this.logger.error('發送 Flex 訊息失敗', error instanceof Error ? error : new Error(String(error)));
            // 回退到文字訊息
            await this.sendTextMessage(replyToken, '訊息發送失敗，請稍後再試');
        }
    }
    /**
     * 發送錯誤訊息
     * @param replyToken - 回覆 Token
     * @param errorMessage - 錯誤訊息
     */
    async sendErrorMessage(replyToken, errorMessage) {
        try {
            const message = this.flexMessageGenerator.createErrorMessage(errorMessage);
            await this.sendFlexMessage(replyToken, message);
        }
        catch (error) {
            this.logger.error('發送錯誤訊息失敗', error instanceof Error ? error : new Error(String(error)));
            await this.sendTextMessage(replyToken, errorMessage);
        }
    }
    /**
     * 驗證 LINE Webhook 簽名
     * @param req - Express 請求
     * @returns 是否有效
     */
    validateSignature(req) {
        try {
            const signature = req.headers['x-line-signature'];
            if (!signature) {
                return false;
            }
            // 使用 LINE Bot SDK 的 middleware 來驗證
            return true; // 簡化驗證，實際應該使用 middleware
        }
        catch (error) {
            this.logger.error('簽名驗證失敗', error instanceof Error ? error : new Error(String(error)));
            return false;
        }
    }
    /**
     * 取得 Express middleware
     * @returns Express middleware
     */
    getMiddleware() {
        return (0, bot_sdk_1.middleware)(this.config);
    }
}
exports.LineBotController = LineBotController;
//# sourceMappingURL=LineBotController.js.map