#!/usr/bin/env ts-node

import { execSync, spawn } from 'child_process';
import * as path from 'path';
import fetch from 'node-fetch';

/**
 * 啟動模擬器並執行測試的腳本
 */
class StartAndTestScript {
  private readonly projectRoot: string;
  // private readonly startScriptPath: string; // 未使用
  private readonly testScriptPath: string;
  private emulatorProcess: any;

  constructor() {
    this.projectRoot = path.dirname(path.dirname(__dirname));
    // this.startScriptPath = path.join(path.dirname(__dirname), 'dev', 'start.sh'); // 未使用
    this.testScriptPath = path.join(path.dirname(__dirname), 'test', 'local.sh');
  }

  /**
   * 執行啟動和測試流程
   */
  async run(): Promise<void> {
    try {
      console.log('🚀 啟動股健檢本地開發環境並執行測試...');
      console.log('==============================================================');
      
      // 在背景啟動 Firebase 模擬器
      await this.startEmulatorInBackground();
      
      // 等待模擬器啟動
      console.log('🧪 等待模擬器啟動完成...');
      await this.waitForServer();
      
      // 執行測試
      console.log('✅ 模擬器已啟動，開始執行功能測試...');
      console.log('==============================================================');
      await this.runTests();
      
      console.log('');
      console.log('🎉 開發環境啟動完成，功能測試通過！');
      console.log('💡 提示：');
      console.log('  - 模擬器正在背景運行中');
      console.log('  - 可以繼續進行開發和測試');
      console.log('  - 使用 Ctrl+C 停止模擬器');
      
    } catch (error) {
      console.error('❌ 啟動失敗:', error instanceof Error ? error.message : String(error));
      this.cleanup();
      process.exit(1);
    }
  }

  /**
   * 在背景啟動模擬器
   */
  private async startEmulatorInBackground(): Promise<void> {
    console.log('🔥 在背景啟動 Firebase 模擬器...');
    
    // 使用 spawn 在背景啟動模擬器
    this.emulatorProcess = spawn('firebase', ['emulators:start', '--only', 'functions'], {
      cwd: this.projectRoot,
      stdio: 'pipe',
      detached: true
    });

    // 處理模擬器輸出
    this.emulatorProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      if (output.includes('All emulators ready')) {
        console.log('✅ Firebase 模擬器已準備就緒');
      }
    });

    this.emulatorProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString();
      if (output.includes('Error')) {
        console.error('❌ 模擬器錯誤:', output);
      }
    });

    // 等待一下讓模擬器開始啟動
    await new Promise(resolve => setTimeout(resolve, 3000));
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
          console.log('✅ 伺服器已啟動並回應');
          return;
        }
      } catch (error) {
        // 忽略錯誤，繼續等待
      }
      
      console.log(`⏳ 等待伺服器啟動... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    throw new Error('伺服器啟動超時');
  }

  /**
   * 執行測試
   */
  private async runTests(): Promise<void> {
    try {
      execSync(`bash "${this.testScriptPath}"`, {
        stdio: 'inherit',
        cwd: this.projectRoot
      });
    } catch (error) {
      throw new Error(`測試執行失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 清理資源
   */
  private cleanup(): void {
    if (this.emulatorProcess) {
      this.emulatorProcess.kill();
    }
  }
}

// 處理程序退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止模擬器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在停止模擬器...');
  process.exit(0);
});

// 執行啟動和測試
if (require.main === module) {
  const startAndTestScript = new StartAndTestScript();
  startAndTestScript.run().catch(error => {
    console.error('啟動和測試失敗:', error);
    process.exit(1);
  });
}

export { StartAndTestScript };
