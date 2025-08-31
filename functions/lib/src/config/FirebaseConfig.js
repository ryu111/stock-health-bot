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
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFirebaseConfig = exports.FirebaseConfig = void 0;
const admin = __importStar(require("firebase-admin"));
const types_1 = require("../types");
const Logger_1 = require("../utils/Logger");
// Firebase 配置類別
class FirebaseConfig {
    constructor(config) {
        this.app = null;
        this.config = config;
        this.logger = Logger_1.Logger.getInstance();
    }
    /**
     * 取得單例實例
     * @param config - 應用配置
     * @returns FirebaseConfig 實例
     */
    static getInstance(config) {
        if (!FirebaseConfig.instance) {
            FirebaseConfig.instance = new FirebaseConfig(config || exports.defaultFirebaseConfig);
        }
        return FirebaseConfig.instance;
    }
    /**
     * 初始化 Firebase
     */
    initialize() {
        try {
            this.logger.info('開始初始化 Firebase...');
            // 檢查是否已經初始化
            if (admin.apps.length > 0) {
                this.logger.info('Firebase Admin SDK 已經初始化');
                return;
            }
            // 初始化 Firebase Admin SDK
            const appOptions = {
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
            }
            else {
                this.logger.info('使用預設憑證初始化 Firebase Admin SDK');
                this.app = admin.initializeApp(appOptions);
            }
            this.logger.info('Firebase Admin SDK 初始化成功');
        }
        catch (error) {
            this.logger.error('Firebase Admin SDK 初始化失敗', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    /**
     * 取得 Firestore 實例
     * @returns Firestore 實例
     */
    getFirestore() {
        if (!this.app) {
            throw new Error('Firebase 尚未初始化');
        }
        return this.app.firestore();
    }
    /**
     * 取得 Auth 實例
     * @returns Auth 實例
     */
    getAuth() {
        if (!this.app) {
            throw new Error('Firebase 尚未初始化');
        }
        return this.app.auth();
    }
    /**
     * 取得 Storage 實例
     * @returns Storage 實例
     */
    getStorage() {
        if (!this.app) {
            throw new Error('Firebase 尚未初始化');
        }
        return this.app.storage();
    }
    /**
     * 取得配置
     * @returns 應用配置
     */
    getConfig() {
        return this.config;
    }
    /**
     * 清理資源
     */
    cleanup() {
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
    async checkConnection() {
        try {
            if (!this.app) {
                return false;
            }
            const firestore = this.getFirestore();
            await firestore.collection('_health').doc('check').get();
            return true;
        }
        catch (error) {
            this.logger.error('Firebase 連接檢查失敗', error instanceof Error ? error : new Error(String(error)));
            return false;
        }
    }
    /**
     * 取得專案資訊
     * @returns 專案資訊
     */
    getProjectInfo() {
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
        }
        catch (error) {
            this.logger.error('取得專案資訊失敗', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
}
exports.FirebaseConfig = FirebaseConfig;
// 預設 Firebase 配置
exports.defaultFirebaseConfig = {
    environment: process.env['NODE_ENV'] || 'development',
    logLevel: process.env['LOG_LEVEL'] || types_1.LogLevel.INFO,
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
        defaultEngine: process.env['DEFAULT_ANALYSIS_ENGINE'] || 'fixed-formula',
        aiApiKey: process.env['AI_API_KEY'] || '',
        aiEndpoint: process.env['AI_ENDPOINT'] || '',
    },
    localization: {
        defaultLanguage: process.env['DEFAULT_LANGUAGE'] || 'zh_TW',
        supportedLanguages: ['zh_TW', 'en_US', 'ja_JP'],
    },
};
//# sourceMappingURL=FirebaseConfig.js.map