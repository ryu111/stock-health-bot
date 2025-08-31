#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * 本地功能測試腳本
 */
class LocalTestScript {
  private readonly projectRoot: string;
  private readonly scriptPath: string;

  constructor() {
    this.projectRoot = path.dirname(path.dirname(__dirname));
    this.scriptPath = path.join(__dirname, 'test-local.sh');
  }

  /**
   * 執行本地功能測試
   */
  async run(): Promise<void> {
    try {
      console.log('🧪 開始本地功能測試...');
      console.log('==============================================================');
      
      execSync(`bash "${this.scriptPath}"`, {
        stdio: 'inherit',
        cwd: this.projectRoot
      });
    } catch (error) {
      console.error('❌ 測試失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}

// 執行測試
if (require.main === module) {
  const testScript = new LocalTestScript();
  testScript.run().catch(error => {
    console.error('測試失敗:', error);
    process.exit(1);
  });
}

export { LocalTestScript };


