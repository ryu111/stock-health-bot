// 資料來源相關型別定義
import { MarketType } from './stock';

// 資料來源類型
export enum DataSourceType {
  YAHOO_FINANCE = 'yahoo_finance', // Yahoo財經
  TRADING_VIEW = 'trading_view', // TradingView
  PUBLIC_INFO = 'public_info', // 公開資訊觀測站
  CMONEY = 'cmoney', // CMoney
  MONEY_DJ = 'money_dj', // MoneyDJ
  WANT_GOO = 'want_goo', // WantGoo
  COMPANY_FINANCIAL = 'company_financial', // 公司財報
  ANALYST_ESTIMATE = 'analyst_estimate', // 分析師預估
  MARKET_DATA = 'market_data', // 市場資料
}

// 資料來源狀態
export enum DataSourceStatus {
  ACTIVE = 'active', // 活躍
  INACTIVE = 'inactive', // 非活躍
  ERROR = 'error', // 錯誤
  RATE_LIMITED = 'rate_limited', // 速率限制
  MAINTENANCE = 'maintenance', // 維護中
}

// 資料來源介面
export interface DataSource {
  id: string; // 來源ID
  name: string; // 來源名稱
  type: DataSourceType; // 來源類型
  status: DataSourceStatus; // 來源狀態
  priority: number; // 優先級 (1-10, 1最高)
  reliability: number; // 可靠性評分 (0-1)
  updateFrequency: 'realtime' | 'daily' | 'quarterly' | 'monthly';
  lastUpdate: Date; // 最後更新時間
  nextUpdate: Date; // 下次更新時間
  apiEndpoint?: string; // API端點
  rateLimit?: {
    // 速率限制
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  authentication?: {
    // 認證資訊
    type: 'api_key' | 'oauth' | 'none';
    apiKey?: string;
    secret?: string;
  };
  supportedMarkets: MarketType[]; // 支援的市場類型
  supportedDataTypes: string[]; // 支援的資料類型
  cost?: {
    // 成本資訊
    free: boolean;
    pricePerRequest?: number;
    monthlyFee?: number;
  };
}

// 資料品質等級
export enum DataQualityLevel {
  EXCELLENT = 'excellent', // 優秀 (90-100)
  GOOD = 'good', // 良好 (80-89)
  AVERAGE = 'average', // 平均 (70-79)
  BELOW_AVERAGE = 'below_average', // 低於平均 (60-69)
  POOR = 'poor', // 不佳 (50-59)
  UNRELIABLE = 'unreliable', // 不可靠 (0-49)
}

// 資料品質介面
export interface DataQuality {
  overallScore: number; // 整體品質評分 (0-100)
  level: DataQualityLevel; // 品質等級
  completeness: number; // 完整性評分 (0-100)
  accuracy: number; // 準確性評分 (0-100)
  timeliness: number; // 時效性評分 (0-100)
  consistency: number; // 一致性評分 (0-100)
  validity: number; // 有效性評分 (0-100)
  factors: DataQualityFactor[]; // 品質因子
  lastValidation: Date; // 最後驗證時間
}

// 資料品質因子介面
export interface DataQualityFactor {
  name: string; // 因子名稱
  score: number; // 因子評分 (0-100)
  weight: number; // 因子權重
  description: string; // 因子描述
  issues: string[]; // 發現的問題
  recommendations: string[]; // 改善建議
}

// 資料驗證結果介面
export interface ValidationResult {
  isValid: boolean; // 是否有效
  quality: DataQuality; // 資料品質
  errors: ValidationError[]; // 驗證錯誤
  warnings: ValidationWarning[]; // 驗證警告
  suggestions: string[]; // 改善建議
  timestamp: Date; // 驗證時間
  duration: number; // 驗證耗時 (毫秒)
}

// 驗證錯誤介面
export interface ValidationError {
  code: string; // 錯誤代碼
  message: string; // 錯誤訊息
  field?: string; // 相關欄位
  severity: 'critical' | 'error' | 'warning'; // 嚴重程度
  suggestion?: string; // 改善建議
}

// 驗證警告介面
export interface ValidationWarning {
  code: string; // 警告代碼
  message: string; // 警告訊息
  field?: string; // 相關欄位
  impact: 'high' | 'medium' | 'low'; // 影響程度
  suggestion?: string; // 改善建議
}

// 資料來源配置介面
export interface DataSourceConfig {
  sources: DataSource[]; // 資料來源列表
  fallbackStrategy: 'round_robin' | 'priority' | 'random';
  retryConfig: {
    // 重試配置
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  cacheConfig: {
    // 快取配置
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  qualityThresholds: {
    // 品質門檻
    minimumScore: number;
    minimumCompleteness: number;
    maximumAge: number; // 最大資料年齡 (小時)
  };
}

// 資料來源監控介面
export interface DataSourceMonitoring {
  sourceId: string; // 來源ID
  status: DataSourceStatus; // 當前狀態
  lastCheck: Date; // 最後檢查時間
  responseTime: number; // 回應時間 (毫秒)
  successRate: number; // 成功率 (0-1)
  errorCount: number; // 錯誤次數
  lastError?: {
    // 最後錯誤
    message: string;
    timestamp: Date;
    code: string;
  };
  metrics: {
    // 效能指標
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    uptime: number; // 正常運行時間比例
  };
}

// 資料來源服務介面
export interface IDataSourceService {
  getDataSource(id: string): Promise<DataSource>;
  getAllDataSources(): Promise<DataSource[]>;
  addDataSource(source: DataSource): Promise<void>;
  updateDataSource(id: string, updates: Partial<DataSource>): Promise<void>;
  removeDataSource(id: string): Promise<void>;
  validateData(data: unknown, source: DataSource): Promise<ValidationResult>;
  getDataQuality(symbol: string, dataType: string): Promise<DataQuality>;
  monitorDataSource(id: string): Promise<DataSourceMonitoring>;
  getFallbackSource(primarySource: DataSource): Promise<DataSource>;
}
