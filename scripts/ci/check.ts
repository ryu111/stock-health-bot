#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * CI 品質檢查腳本
 */
class CICheckScript {
  private readonly projectRoot: string;
  private readonly scriptPath: string;

  constructor() {
    // 從 scripts/ci/ 目錄回到專案根目錄
    this.projectRoot = path.dirname(path.dirname(path.dirname(__dirname)));
    // 使用絕對路徑指向 scripts/ci/check.sh
    this.scriptPath = path.resolve(this.projectRoot, 'scripts', 'ci', 'check.sh');
  }

  /**
   * 執行 CI 品質檢查
   */
  async run(): Promise<void> {
    try {
      console.log('🤖 開始執行股健檢 LINE Bot 品質檢查...');
      console.log('================================================================');
      
      // 執行 shell 腳本
      execSync(`bash "${this.scriptPath}"`, { 
        stdio: 'inherit',
        cwd: this.projectRoot
      });
      
      console.log('✅ CI 檢查完成');
    } catch (error) {
      console.error('❌ CI 檢查失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}

// 執行檢查
if (require.main === module) {
  const ciCheckScript = new CICheckScript();
  ciCheckScript.run().catch(error => {
    console.error('CI 檢查失敗:', error);
    process.exit(1);
  });
}

export { CICheckScript };

