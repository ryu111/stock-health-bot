#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * 中文化測試報告腳本
 * 執行 Jest 測試並提供中文輸出
 */

class ChineseTestReporter {
  private readonly functionsPath: string;

  constructor() {
    this.functionsPath = path.join(__dirname, '..', '..');
  }

  /**
   * 執行測試並生成中文報告
   */
  async run(): Promise<void> {
    try {
      console.log('🧪 開始執行測試...');
      console.log('='.repeat(50));

      // 執行 Jest 測試
      const output = execSync('npm run test:ci', {
        cwd: this.functionsPath,
        encoding: 'utf8'
      });

      // 解析輸出並生成中文報告
      this.generateChineseReport(output);

    } catch (error) {
      console.error('❌ 測試執行失敗:', error);
      process.exit(1);
    }
  }

  /**
   * 生成中文報告
   */
  private generateChineseReport(output: string): void {
    console.log('\n📊 測試結果摘要 (中文版)');
    console.log('='.repeat(50));

    // 解析測試結果
    const testSuitesMatch = output.match(/Test Suites:\s+(\d+) passed,\s+(\d+) total/);
    const testsMatch = output.match(/Tests:\s+(\d+) passed,\s+(\d+) total/);
    const timeMatch = output.match(/Time:\s+([\d.]+) s/);

    if (testSuitesMatch) {
      const passed = testSuitesMatch[1];
      const total = testSuitesMatch[2];
      console.log(`📁 測試套件: ${passed}/${total} 通過`);
    }

    if (testsMatch) {
      const passed = testsMatch[1];
      const total = testsMatch[2];
      console.log(`🧪 測試案例: ${passed}/${total} 通過`);
    }

    if (timeMatch) {
      const time = timeMatch[1];
      console.log(`⏱️ 執行時間: ${time} 秒`);
    }

    // 解析覆蓋率
    const coverageMatch = output.match(/Statements\s+:\s+([\d.]+)%\s+\(([^)]+)\)/);
    const branchesMatch = output.match(/Branches\s+:\s+([\d.]+)%\s+\(([^)]+)\)/);
    const functionsMatch = output.match(/Functions\s+:\s+([\d.]+)%\s+\(([^)]+)\)/);
    const linesMatch = output.match(/Lines\s+:\s+([\d.]+)%\s+\(([^)]+)\)/);

    console.log('\n📈 覆蓋率統計 (中文版):');
    console.log('-'.repeat(40));

    if (coverageMatch) {
      console.log(`語句覆蓋率: ${coverageMatch[1]}% (${coverageMatch[2]})`);
    }
    if (branchesMatch) {
      console.log(`分支覆蓋率: ${branchesMatch[1]}% (${branchesMatch[2]})`);
    }
    if (functionsMatch) {
      console.log(`函數覆蓋率: ${functionsMatch[1]}% (${functionsMatch[2]})`);
    }
    if (linesMatch) {
      console.log(`行數覆蓋率: ${linesMatch[1]}% (${linesMatch[2]})`);
    }

    console.log('\n✅ 測試完成！');
  }
}

// 執行腳本
if (require.main === module) {
  const reporter = new ChineseTestReporter();
  reporter.run().catch(error => {
    console.error('腳本執行失敗:', error);
    process.exit(1);
  });
}

export { ChineseTestReporter };
