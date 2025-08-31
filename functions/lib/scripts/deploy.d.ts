#!/usr/bin/env ts-node
declare class DeployScript {
    private projectRoot;
    private libDir;
    private startTime;
    private environment;
    constructor(environment?: string);
    /**
     * 執行部署流程
     */
    run(): Promise<void>;
    /**
     * 檢查建置檔案
     */
    private checkBuildFiles;
    /**
     * 執行建置
     */
    private build;
    /**
     * 執行測試
     */
    private runTests;
    /**
     * 部署到 Firebase
     */
    private deployToFirebase;
    /**
     * 驗證部署
     */
    private verifyDeployment;
    /**
     * 顯示部署統計
     */
    private showDeployStats;
    /**
     * 取得專案 ID
     */
    private getProjectId;
    /**
     * 取得地區
     */
    private getRegion;
    /**
     * 格式化時間
     */
    private formatDuration;
}
export { DeployScript };
//# sourceMappingURL=deploy.d.ts.map