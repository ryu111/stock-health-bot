import { Request, Response } from 'express';
export declare class LineBotController {
    private client;
    private config;
    private logger;
    private aiAnalyzer;
    private stockAdapter;
    private etfAdapter;
    private flexMessageGenerator;
    constructor();
    /**
     * 取得或建立 LINE Client
     */
    private getClient;
    /**
     * 處理 LINE Webhook
     * @param req - Express 請求
     * @param res - Express 回應
     */
    handleWebhook(req: Request, res: Response): Promise<void>;
    /**
     * 處理單個事件
     * @param event - LINE 事件
     */
    private handleEvent;
    /**
     * 處理訊息事件
     * @param event - 訊息事件
     */
    private handleMessageEvent;
    /**
     * 處理文字訊息
     * @param replyToken - 回覆 Token
     * @param text - 訊息文字
     */
    private handleTextMessage;
    /**
     * 處理股票查詢
     * @param replyToken - 回覆 Token
     * @param symbol - 股票代碼
     */
    private handleStockQuery;
    /**
     * 處理 ETF 查詢
     * @param replyToken - 回覆 Token
     * @param symbol - ETF 代碼
     */
    private handleETFQuery;
    /**
     * 處理分析請求
     * @param replyToken - 回覆 Token
     * @param symbol - 股票代碼
     */
    private handleAnalysisRequest;
    /**
     * 處理貼圖訊息
     * @param replyToken - 回覆 Token
     * @param message - 貼圖訊息
     */
    private handleStickerMessage;
    /**
     * 處理 Postback 事件
     * @param event - Postback 事件
     */
    private handlePostbackEvent;
    /**
     * 處理追蹤事件
     * @param event - 追蹤事件
     */
    private handleFollowEvent;
    /**
     * 處理取消追蹤事件
     * @param _event - 取消追蹤事件
     */
    private handleUnfollowEvent;
    /**
     * 從分析請求中提取股票代碼
     * @param text - 分析請求文字
     * @returns 股票代碼或 null
     */
    private extractSymbolFromAnalysisRequest;
    /**
     * 發送歡迎訊息
     * @param replyToken - 回覆 Token
     */
    private sendWelcomeMessage;
    /**
     * 發送幫助訊息
     * @param replyToken - 回覆 Token
     */
    private sendHelpMessage;
    /**
     * 發送預設訊息
     * @param replyToken - 回覆 Token
     */
    private sendDefaultMessage;
    /**
     * 發送文字訊息
     * @param replyToken - 回覆 Token
     * @param text - 訊息文字
     */
    private sendTextMessage;
    /**
     * 發送 Flex 訊息
     * @param replyToken - 回覆 Token
     * @param message - Flex 訊息
     */
    private sendFlexMessage;
    /**
     * 發送錯誤訊息
     * @param replyToken - 回覆 Token
     * @param errorMessage - 錯誤訊息
     */
    private sendErrorMessage;
    /**
     * 驗證 LINE Webhook 簽名
     * @param req - Express 請求
     * @returns 是否有效
     */
    private validateSignature;
    /**
     * 取得 Express middleware
     * @returns Express middleware
     */
    getMiddleware(): import("@line/bot-sdk/dist/middleware").Middleware;
}
//# sourceMappingURL=LineBotController.d.ts.map