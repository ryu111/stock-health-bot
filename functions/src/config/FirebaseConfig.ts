import * as admin from 'firebase-admin';
import { AppConfig, LogLevel } from '../types';
import { Logger } from '../utils/Logger';

// Firebase 配置類別
export class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: admin.app.App | null = null;
  private config: AppConfig;
  private logger: Logger;

  private constructor(config: AppConfig) {
    this.config = config;
    this.logger = Logger.getInstance();
  }

  /**
   * 取得單例實例
   * @param config - 應用配置
   * @returns FirebaseConfig 實例
   */
  static getInstance(config?: AppConfig): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig(config || defaultFirebaseConfig);
    }
    return FirebaseConfig.instance;
  }

  /**
   * 初始化 Firebase
   */
  initialize(): void {
    try {
      this.logger.info('開始初始化 Firebase...');

      // 檢查是否已經初始化
      if (admin.apps.length > 0) {
        this.logger.info('Firebase Admin SDK 已經初始化');
        return;
      }

      // 初始化 Firebase Admin SDK
      const appOptions: admin.AppOptions = {
        projectId: this.config.firebase.projectId,
      };

      // 如果有 storageBucket，則加入配置
      if (this.config.firebase.storageBucket) {
        appOptions.storageBucket = this.config.firebase.storageBucket;
      }

      // 檢查是否有服務帳號金鑰
      if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
        this.logger.info('使用服務帳號金鑰初始化 Firebase Admin SDK');
        this.app = admin.initializeApp(appOptions);
      } else {
        this.logger.info('使用預設憑證初始化 Firebase Admin SDK');
        this.app = admin.initializeApp(appOptions);
      }

      this.logger.info('Firebase Admin SDK 初始化成功');
    } catch (error) {
      this.logger.error(
        'Firebase Admin SDK 初始化失敗',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * 取得 Firestore 實例
   * @returns Firestore 實例
   */
  getFirestore(): admin.firestore.Firestore {
    if (!this.app) {
      throw new Error('Firebase 尚未初始化');
    }
    return this.app.firestore();
  }

  /**
   * 取得 Auth 實例
   * @returns Auth 實例
   */
  getAuth(): admin.auth.Auth {
    if (!this.app) {
      throw new Error('Firebase 尚未初始化');
    }
    return this.app.auth();
  }

  /**
   * 取得 Storage 實例
   * @returns Storage 實例
   */
  getStorage(): admin.storage.Storage {
    if (!this.app) {
      throw new Error('Firebase 尚未初始化');
    }
    return this.app.storage();
  }

  /**
   * 取得配置
   * @returns 應用配置
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    if (this.app) {
      void this.app.delete();
      this.app = null;
      this.logger.info('Firebase 資源已清理');
    }
  }

  /**
   * 檢查連接狀態
   * @returns 是否連接
   */
  async checkConnection(): Promise<boolean> {
    try {
      if (!this.app) {
        return false;
      }

      const firestore = this.getFirestore();
      await firestore.collection('_health').doc('check').get();
      return true;
    } catch (error) {
      this.logger.error(
        'Firebase 連接檢查失敗',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * 取得專案資訊
   * @returns 專案資訊
   */
  getProjectInfo(): { projectId: string; region: string; environment: string; version: string } {
    try {
      if (!this.app) {
        throw new Error('Firebase 尚未初始化');
      }

      const projectId = this.app.options.projectId || 'unknown';
      return {
        projectId,
        region: this.config.firebase.region,
        environment: this.config.environment,
        version: '1.0.0',
      };
    } catch (error) {
      this.logger.error(
        '取得專案資訊失敗',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
}

// 預設 Firebase 配置
export const defaultFirebaseConfig: AppConfig = {
  environment:
    (process.env['NODE_ENV'] as 'development' | 'staging' | 'production') || 'development',
  logLevel: (process.env['LOG_LEVEL'] as LogLevel) || LogLevel.INFO,
  firebase: {
    projectId: process.env['FIREBASE_PROJECT_ID'] || 'your-project-id',
    region: process.env['FIREBASE_REGION'] || 'asia-east1',
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || 'your-project-id.appspot.com',
  },
  line: {
    channelAccessToken: process.env['LINE_CHANNEL_ACCESS_TOKEN'] || '',
    channelSecret: process.env['LINE_CHANNEL_SECRET'] || '',
  },
  yahooFinance: {
    apiKey: process.env['YAHOO_FINANCE_API_KEY'] || '',
    baseUrl: 'https://query1.finance.yahoo.com',
  },
  cache: {
    ttl: parseInt(process.env['CACHE_TTL'] || '300'),
    maxSize: parseInt(process.env['CACHE_MAX_SIZE'] || '1000'),
  },
  analysis: {
    defaultEngine:
      (process.env['DEFAULT_ANALYSIS_ENGINE'] as 'fixed-formula' | 'ai') || 'fixed-formula',
    aiApiKey: process.env['AI_API_KEY'] || '',
    aiEndpoint: process.env['AI_ENDPOINT'] || '',
  },
  localization: {
    defaultLanguage: process.env['DEFAULT_LANGUAGE'] || 'zh_TW',
    supportedLanguages: ['zh_TW', 'en_US', 'ja_JP'],
  },
};
