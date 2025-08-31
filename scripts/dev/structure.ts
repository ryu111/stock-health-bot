#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * 專案結構分析腳本
 */
class StructureAnalysisScript {
  private readonly workspacePath: string;

  constructor() {
    this.workspacePath = path.dirname(path.dirname(__dirname));
  }

  /**
   * 分析專案結構
   */
  async run(): Promise<void> {
    try {
      console.log('🔍 分析專案結構...');
      console.log('==============================================================');
      
      execSync(`ls -la "${this.workspacePath}"`, {
        stdio: 'inherit',
        cwd: this.workspacePath
      });
    } catch (error) {
      console.error('❌ 分析失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}

// 執行分析
if (require.main === module) {
  const structureScript = new StructureAnalysisScript();
  structureScript.run().catch(error => {
    console.error('分析失敗:', error);
    process.exit(1);
  });
}

export { StructureAnalysisScript };


