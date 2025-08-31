#!/usr/bin/env ts-node
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
exports.BuildScript = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// 建置腳本類別
class BuildScript {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.srcDir = path.join(this.projectRoot, 'src');
        this.libDir = path.join(this.projectRoot, 'lib');
        this.startTime = Date.now();
    }
    /**
     * 執行建置流程
     */
    async run() {
        try {
            console.log('🚀 開始 TypeScript 建置流程...');
            // 檢查必要檔案
            this.checkPrerequisites();
            // 清理舊的建置檔案
            this.cleanBuild();
            // 執行 TypeScript 編譯
            this.compileTypeScript();
            // 複製必要檔案
            this.copyAssets();
            // 驗證建置結果
            this.validateBuild();
            // 顯示建置統計
            this.showBuildStats();
            console.log('✅ TypeScript 建置完成！');
        }
        catch (error) {
            console.error('❌ 建置失敗:', error);
            process.exit(1);
        }
    }
    /**
     * 檢查建置前置條件
     */
    checkPrerequisites() {
        console.log('📋 檢查建置前置條件...');
        // 檢查 tsconfig.json
        const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
        if (!fs.existsSync(tsconfigPath)) {
            throw new Error('tsconfig.json 不存在');
        }
        // 檢查 src 目錄
        if (!fs.existsSync(this.srcDir)) {
            throw new Error('src 目錄不存在');
        }
        // 檢查 package.json
        const packagePath = path.join(this.projectRoot, 'package.json');
        if (!fs.existsSync(packagePath)) {
            throw new Error('package.json 不存在');
        }
        console.log('✅ 前置條件檢查通過');
    }
    /**
     * 清理舊的建置檔案
     */
    cleanBuild() {
        console.log('🧹 清理舊的建置檔案...');
        if (fs.existsSync(this.libDir)) {
            fs.rmSync(this.libDir, { recursive: true, force: true });
            console.log('✅ 已清理 lib 目錄');
        }
        // 清理其他可能的建置產物
        const buildArtifacts = [
            path.join(this.projectRoot, 'dist'),
            path.join(this.projectRoot, 'build'),
        ];
        buildArtifacts.forEach(artifact => {
            if (fs.existsSync(artifact)) {
                fs.rmSync(artifact, { recursive: true, force: true });
            }
        });
    }
    /**
     * 執行 TypeScript 編譯
     */
    compileTypeScript() {
        console.log('🔨 執行 TypeScript 編譯...');
        try {
            (0, child_process_1.execSync)('npx tsc', {
                cwd: this.projectRoot,
                stdio: 'inherit',
                env: { ...process.env, FORCE_COLOR: '1' },
            });
            console.log('✅ TypeScript 編譯完成');
        }
        catch (error) {
            throw new Error(`TypeScript 編譯失敗: ${error}`);
        }
    }
    /**
     * 複製必要檔案
     */
    copyAssets() {
        console.log('📁 複製必要檔案...');
        // 複製 package.json 到 lib 目錄
        const packagePath = path.join(this.projectRoot, 'package.json');
        const libPackagePath = path.join(this.libDir, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            // 移除開發依賴和腳本
            const { devDependencies, scripts, ...productionPackage } = packageData;
            fs.writeFileSync(libPackagePath, JSON.stringify(productionPackage, null, 2));
            console.log('✅ 已複製 package.json');
        }
        // 複製其他必要檔案
        const assetsToCopy = [
            'firebase.json',
            'firestore.rules',
            'firestore.indexes.json',
        ];
        assetsToCopy.forEach(asset => {
            const sourcePath = path.join(this.projectRoot, asset);
            const targetPath = path.join(this.libDir, asset);
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, targetPath);
                console.log(`✅ 已複製 ${asset}`);
            }
        });
    }
    /**
     * 驗證建置結果
     */
    validateBuild() {
        console.log('🔍 驗證建置結果...');
        // 檢查 lib 目錄是否存在
        if (!fs.existsSync(this.libDir)) {
            throw new Error('lib 目錄未建立');
        }
        // 檢查主要檔案是否存在
        const requiredFiles = [
            'src/index.js',
            'package.json',
        ];
        requiredFiles.forEach(file => {
            const filePath = path.join(this.libDir, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`必要檔案不存在: ${file}`);
            }
        });
        // 檢查 TypeScript 檔案是否已編譯
        const libFiles = this.getJavaScriptFiles(this.libDir);
        if (libFiles.length === 0) {
            throw new Error('沒有編譯出 JavaScript 檔案');
        }
        console.log(`✅ 建置驗證通過 (${libFiles.length} 個檔案)`);
    }
    /**
     * 顯示建置統計
     */
    showBuildStats() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const srcFiles = this.getTypeScriptFiles(this.srcDir);
        const libFiles = this.getJavaScriptFiles(this.libDir);
        console.log('\n📊 建置統計:');
        console.log(`⏱️  建置時間: ${this.formatDuration(duration)}`);
        console.log(`📁 源碼檔案: ${srcFiles.length} 個 TypeScript 檔案`);
        console.log(`📦 輸出檔案: ${libFiles.length} 個 JavaScript 檔案`);
        console.log(`📏 輸出大小: ${this.getDirectorySize(this.libDir)}`);
    }
    /**
     * 取得 TypeScript 檔案列表
     */
    getTypeScriptFiles(dir) {
        const files = [];
        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walk(fullPath);
                }
                else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            });
        };
        walk(dir);
        return files;
    }
    /**
     * 取得 JavaScript 檔案列表
     */
    getJavaScriptFiles(dir) {
        const files = [];
        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walk(fullPath);
                }
                else if (item.endsWith('.js')) {
                    files.push(fullPath);
                }
            });
        };
        walk(dir);
        return files;
    }
    /**
     * 取得目錄大小
     */
    getDirectorySize(dir) {
        let totalSize = 0;
        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walk(fullPath);
                }
                else {
                    totalSize += stat.size;
                }
            });
        };
        walk(dir);
        if (totalSize < 1024) {
            return `${totalSize} B`;
        }
        else if (totalSize < 1024 * 1024) {
            return `${(totalSize / 1024).toFixed(1)} KB`;
        }
        else {
            return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
        }
    }
    /**
     * 格式化時間
     */
    formatDuration(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        else if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        }
        else {
            const minutes = Math.floor(ms / 60000);
            const seconds = ((ms % 60000) / 1000).toFixed(0);
            return `${minutes}m ${seconds}s`;
        }
    }
}
exports.BuildScript = BuildScript;
// 執行建置
if (require.main === module) {
    const buildScript = new BuildScript();
    buildScript.run().catch(error => {
        console.error('建置失敗:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=build.js.map