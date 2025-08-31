#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * 本地開發環境啟動腳本
 */
class DevStartScript {
  private readonly projectRoot: string;
  private readonly scriptPath: string;

  constructor() {
    this.projectRoot = path.dirname(path.dirname(__dirname));
    this.scriptPath = path.join(__dirname, 'dev-start.sh');
  }

  /**
   * 啟動本地開發環境
   */
  async run(): Promise<void> {
    try {
      console.log('🚀 啟動股健檢本地開發環境...');
      console.log('==============================================================');
      
      execSync(`bash "${this.scriptPath}"`, {
        stdio: 'inherit',
        cwd: this.projectRoot
      });
    } catch (error) {
      console.error('❌ 啟動失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
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


