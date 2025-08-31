export type SupportedLanguage = 'zh_TW' | 'en_US' | 'ja_JP' | 'ko_KR';
export interface UserPreferences {
    language: SupportedLanguage;
    timezone: string;
    notifications: {
        stockAlerts: boolean;
        marketUpdates: boolean;
        analysisReports: boolean;
    };
    analysisPreferences: AnalysisPreferences;
}
export interface AnalysisPreferences {
    defaultEngine: 'fixed-formula' | 'ai';
    riskTolerance: 'low' | 'medium' | 'high';
    investmentHorizon: 'short' | 'medium' | 'long';
    preferredMetrics: string[];
}
export interface StockQueryEvent {
    type: 'stock_query';
    symbol: string;
    userId: string;
    timestamp: Date;
    language: SupportedLanguage;
}
export interface AnalysisRequestEvent {
    type: 'analysis_request';
    symbol: string;
    analysisType: 'technical' | 'fundamental' | 'comprehensive';
    userId: string;
    timestamp: Date;
    preferences?: AnalysisPreferences;
}
export interface WatchlistEvent {
    type: 'watchlist_action';
    action: 'add' | 'remove' | 'list';
    symbol?: string;
    userId: string;
    timestamp: Date;
}
export type LineResponse = TextMessage | FlexMessage;
export interface TextMessage {
    type: 'text';
    text: string;
}
export interface FlexMessage {
    type: 'flex';
    altText: string;
    contents: FlexComponent;
}
export interface FlexComponent {
    type: 'text' | 'box' | 'image' | 'button' | 'separator';
    text?: string;
    size?: string;
    weight?: string;
    color?: string;
    align?: string;
    layout?: string;
    backgroundColor?: string;
    cornerRadius?: string;
    height?: string;
    contents?: FlexComponent[];
    action?: FlexAction;
    margin?: string;
    flex?: number;
    style?: string;
    wrap?: boolean;
    spacing?: string;
}
export interface FlexAction {
    type: 'postback' | 'message' | 'uri';
    label?: string;
    text?: string;
    data?: string;
    uri?: string;
}
export interface LocalizedFlexMessage {
    [key: string]: FlexMessage;
}
export interface LineEventHandler {
    handleWebhook(req: Record<string, unknown>, res: Record<string, unknown>): Promise<void>;
    handlePostback(event: Record<string, unknown>): Promise<LineResponse[]>;
}
export interface LineConfig {
    channelAccessToken: string;
    channelSecret: string;
    webhookPath?: string;
    replyTimeout?: number;
    pushTimeout?: number;
    multicastTimeout?: number;
}
//# sourceMappingURL=line.d.ts.map