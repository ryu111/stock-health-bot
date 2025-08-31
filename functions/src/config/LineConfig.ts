// LINE Bot 配置類別
export class LineConfig {
  public readonly channelAccessToken: string;
  public readonly channelSecret: string;
  public readonly webhookPath: string;
  public readonly apiBaseUrl: string;

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
  isValid(): boolean {
    return !!(this.channelAccessToken && this.channelSecret);
  }

  /**
   * 取得配置摘要
   * @returns 配置摘要
   */
  getSummary(): {
    hasAccessToken: boolean;
    hasChannelSecret: boolean;
    webhookPath: string;
    apiBaseUrl: string;
  } {
    return {
      hasAccessToken: !!this.channelAccessToken,
      hasChannelSecret: !!this.channelSecret,
      webhookPath: this.webhookPath,
      apiBaseUrl: this.apiBaseUrl,
    };
  }
}

// 預設配置
export const defaultLineConfig = new LineConfig();
