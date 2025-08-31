"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLineConfig = exports.LineConfig = void 0;
// LINE Bot 配置類別
class LineConfig {
    constructor() {
        this.channelAccessToken = process.env['LINE_CHANNEL_ACCESS_TOKEN'] || '';
        this.channelSecret = process.env['LINE_CHANNEL_SECRET'] || '';
        this.webhookPath = '/webhook';
        this.apiBaseUrl = 'https://api.line.me';
    }
    /**
     * 驗證配置
     * @returns 是否有效
     */
    isValid() {
        return !!(this.channelAccessToken && this.channelSecret);
    }
    /**
     * 取得配置摘要
     * @returns 配置摘要
     */
    getSummary() {
        return {
            hasAccessToken: !!this.channelAccessToken,
            hasChannelSecret: !!this.channelSecret,
            webhookPath: this.webhookPath,
            apiBaseUrl: this.apiBaseUrl,
        };
    }
}
exports.LineConfig = LineConfig;
// 預設配置
exports.defaultLineConfig = new LineConfig();
//# sourceMappingURL=LineConfig.js.map