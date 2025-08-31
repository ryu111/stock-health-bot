#!/usr/bin/env ts-node
declare class BuildScript {
    private projectRoot;
    private srcDir;
    private libDir;
    private startTime;
    constructor();
    /**
     * 執行建置流程
     */
    run(): Promise<void>;
    /**
     * 檢查建置前置條件
     */
    private checkPrerequisites;
    /**
     * 清理舊的建置檔案
     */
    private cleanBuild;
    /**
     * 執行 TypeScript 編譯
     */
    private compileTypeScript;
    /**
     * 複製必要檔案
     */
    private copyAssets;
    /**
     * 驗證建置結果
     */
    private validateBuild;
    /**
     * 顯示建置統計
     */
    private showBuildStats;
    /**
     * 取得 TypeScript 檔案列表
     */
    private getTypeScriptFiles;
    /**
     * 取得 JavaScript 檔案列表
     */
    private getJavaScriptFiles;
    /**
     * 取得目錄大小
     */
    private getDirectorySize;
    /**
     * 格式化時間
     */
    private formatDuration;
}
export { BuildScript };
//# sourceMappingURL=build.d.ts.map