import * as admin from 'firebase-admin';
import { AppConfig } from '../types';
export declare class FirebaseConfig {
    private static instance;
    private app;
    private config;
    private logger;
    private constructor();
    /**
     * 取得單例實例
     * @param config - 應用配置
     * @returns FirebaseConfig 實例
     */
    static getInstance(config?: AppConfig): FirebaseConfig;
    /**
     * 初始化 Firebase
     */
    initialize(): void;
    /**
     * 取得 Firestore 實例
     * @returns Firestore 實例
     */
    getFirestore(): admin.firestore.Firestore;
    /**
     * 取得 Auth 實例
     * @returns Auth 實例
     */
    getAuth(): admin.auth.Auth;
    /**
     * 取得 Storage 實例
     * @returns Storage 實例
     */
    getStorage(): admin.storage.Storage;
    /**
     * 取得配置
     * @returns 應用配置
     */
    getConfig(): AppConfig;
    /**
     * 清理資源
     */
    cleanup(): void;
    /**
     * 檢查連接狀態
     * @returns 是否連接
     */
    checkConnection(): Promise<boolean>;
    /**
     * 取得專案資訊
     * @returns 專案資訊
     */
    getProjectInfo(): {
        projectId: string;
        region: string;
        environment: string;
        version: string;
    };
}
export declare const defaultFirebaseConfig: AppConfig;
//# sourceMappingURL=FirebaseConfig.d.ts.map