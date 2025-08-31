#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';
import fetch from 'node-fetch';

/**
 * 本地開發環境啟動腳本
 */
class DevStartScript {
  private readonly projectRoot: string;
  private readonly scriptPath: string;

  constructor() {
    this.projectRoot = path.dirname(path.dirname(__dirname));
    this.scriptPath = path.join(__dirname, 'start.sh');
  }

  /**
   * 啟動本地開發環境
   */
  async run(): Promise<void> {
    try {
      console.log('🚀 啟動股健檢本地開發環境...');
      console.log('==============================================================');
      
      // 啟動 Firebase 模擬器
      execSync(`bash "${this.scriptPath}"`, {
        stdio: 'inherit',
        cwd: this.projectRoot
      });

      // 如果設定了自動測試，等待模擬器啟動後執行測試
      if (process.env['AUTO_TEST'] === 'true') {
        console.log('');
        console.log('🧪 等待模擬器啟動完成...');
        await this.waitForServer();
        console.log('✅ 模擬器已啟動，開始執行功能測試...');
        console.log('==============================================================');
        
        // 執行功能測試
        const testScriptPath = path.join(path.dirname(__dirname), 'test', 'local.sh');
        execSync(`bash "${testScriptPath}"`, {
          stdio: 'inherit',
          cwd: this.projectRoot
        });
        
        console.log('');
        console.log('🎉 開發環境啟動完成，功能測試通過！');
        console.log('💡 提示：');
        console.log('  - 模擬器正在運行中');
        console.log('  - 可以繼續進行開發和測試');
        console.log('  - 使用 Ctrl+C 停止模擬器');
      }
    } catch (error) {
      console.error('❌ 啟動失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  /**
   * 等待伺服器啟動
   */
  private async waitForServer(): Promise<void> {
    const maxAttempts = 30;
    const delay = 2000; // 2 秒
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch('http://localhost:5001/stock-health-app/us-central1/stockHealthAPI/api/health');
        if (response.ok) {
          return;
        }
      } catch (error) {
        // 忽略錯誤，繼續等待
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    throw new Error('伺服器啟動超時');
  }
}

// 執行啟動
if (require.main === module) {
  const startScript = new DevStartScript();
  startScript.run().catch(error => {
    console.error('啟動失敗:', error);
    process.exit(1);
  });
}

export { DevStartScript };


