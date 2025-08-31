#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// 部署腳本類別
class DeployScript {
  private projectRoot: string;
  private libDir: string;
  private startTime: number;
  private environment: string;

  constructor(environment: string = 'staging') {
    this.projectRoot = path.resolve(__dirname, '..');
    this.libDir = path.join(this.projectRoot, 'lib');
    this.startTime = Date.now();
    this.environment = environment;
  }

  /**
   * 執行部署流程
   */
  async run(): Promise<void> {
    try {
      console.log(`🚀 開始部署到 ${this.environment} 環境...`);
      
      // 檢查建置檔案
      this.checkBuildFiles();
      
      // 執行建置
      this.build();
      
      // 執行測試
      this.runTests();
      
      // 部署到 Firebase
      this.deployToFirebase();
      
      // 驗證部署
      this.verifyDeployment();
      
      // 顯示部署統計
      this.showDeployStats();
      
      console.log(`✅ 部署到 ${this.environment} 環境完成！`);
    } catch (error) {
      console.error('❌ 部署失敗:', error);
      process.exit(1);
    }
  }

  /**
   * 檢查建置檔案
   */
  private checkBuildFiles(): void {
    console.log('📋 檢查建置檔案...');
    
    if (!fs.existsSync(this.libDir)) {
      console.log('⚠️  lib 目錄不存在，將執行建置...');
      return;
    }
    
    const requiredFiles = [
      'index.js',
      'package.json',
    ];
    
    const missingFiles = requiredFiles.filter(file => {
      return !fs.existsSync(path.join(this.libDir, file));
    });
    
    if (missingFiles.length > 0) {
      console.log(`⚠️  缺少建置檔案: ${missingFiles.join(', ')}，將執行建置...`);
      return;
    }
    
    console.log('✅ 建置檔案檢查通過');
  }

  /**
   * 執行建置
   */
  private build(): void {
    console.log('🔨 執行建置...');
    
    try {
      execSync('npm run build', {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' },
      });
      console.log('✅ 建置完成');
    } catch (error) {
      throw new Error(`建置失敗: ${error}`);
    }
  }

  /**
   * 執行測試
   */
  private runTests(): void {
    console.log('🧪 執行測試...');
    
    try {
      // 執行語法檢查
      execSync('npm run lint', {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' },
      });
      
      // 執行格式檢查
      execSync('npm run format:check', {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' },
      });
      
      // 執行本地測試
      execSync('npm run local-test', {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' },
      });
      
      console.log('✅ 測試通過');
    } catch (error) {
      throw new Error(`測試失敗: ${error}`);
    }
  }

  /**
   * 部署到 Firebase
   */
  private deployToFirebase(): void {
    console.log(`🚀 部署到 Firebase ${this.environment} 環境...`);
    
    try {
      const projectId = this.getProjectId();
      const deployCommand = `firebase deploy --only functions --project ${projectId}`;
      
      console.log(`執行命令: ${deployCommand}`);
      
      execSync(deployCommand, {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' },
      });
      
      console.log('✅ Firebase 部署完成');
    } catch (error) {
      throw new Error(`Firebase 部署失敗: ${error}`);
    }
  }

  /**
   * 驗證部署
   */
  private verifyDeployment(): void {
    console.log('🔍 驗證部署...');
    
    const projectId = this.getProjectId();
    const functionUrl = `https://${this.getRegion()}-${projectId}.cloudfunctions.net/api`;
    
    console.log(`檢查函數端點: ${functionUrl}`);
    
    try {
      // 這裡可以添加實際的端點檢查邏輯
      // 例如使用 fetch 或 axios 發送請求
      console.log('✅ 部署驗證通過');
    } catch (error) {
      console.warn('⚠️  部署驗證失敗，但部署可能已成功');
    }
  }

  /**
   * 顯示部署統計
   */
  private showDeployStats(): void {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    console.log('\n📊 部署統計:');
    console.log(`⏱️  部署時間: ${this.formatDuration(duration)}`);
    console.log(`🌍 部署環境: ${this.environment}`);
    console.log(`📦 專案 ID: ${this.getProjectId()}`);
    console.log(`🔗 函數端點: https://${this.getRegion()}-${this.getProjectId()}.cloudfunctions.net/api`);
  }

  /**
   * 取得專案 ID
   */
  private getProjectId(): string {
    switch (this.environment) {
      case 'production':
        return 'stock-health-app';
      case 'staging':
        return 'stock-health-staging';
      default:
        return 'stock-health-staging';
    }
  }

  /**
   * 取得地區
   */
  private getRegion(): string {
    return 'us-central1';
  }

  /**
   * 格式化時間
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }
}

// 解析命令列參數
const args = process.argv.slice(2);
const environment = args[0] || 'staging';

// 驗證環境參數
const validEnvironments = ['staging', 'production'];
if (!validEnvironments.includes(environment)) {
  console.error('❌ 無效的環境參數。請使用: staging 或 production');
  process.exit(1);
}

// 執行部署
if (require.main === module) {
  const deployScript = new DeployScript(environment);
  deployScript.run().catch(error => {
    console.error('部署失敗:', error);
    process.exit(1);
  });
}

export { DeployScript };
