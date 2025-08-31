export declare class LineConfig {
    readonly channelAccessToken: string;
    readonly channelSecret: string;
    readonly webhookPath: string;
    readonly apiBaseUrl: string;
    constructor();
    /**
     * 驗證配置
     * @returns 是否有效
     */
    isValid(): boolean;
    /**
     * 取得配置摘要
     * @returns 配置摘要
     */
    getSummary(): {
        hasAccessToken: boolean;
        hasChannelSecret: boolean;
        webhookPath: string;
        apiBaseUrl: string;
    };
}
export declare const defaultLineConfig: LineConfig;
//# sourceMappingURL=LineConfig.d.ts.map