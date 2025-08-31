#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * 中文化覆蓋率檢查腳本
 * 執行覆蓋率檢查並提供中文輸出
 */

class ChineseCoverageChecker {
  private readonly functionsPath: string;

  constructor() {
    this.functionsPath = path.join(__dirname, '..', '..');
  }

  /**
   * 執行覆蓋率檢查並生成中文報告
   */
  async run(): Promise<void> {
    try {
      console.log('📊 開始執行覆蓋率檢查...');
      console.log('='.repeat(50));

      // 執行 Jest 覆蓋率檢查
      const output = execSync('jest --coverage --coverageReporters=text-summary --coverageThreshold.global.branches=30 --coverageThreshold.global.functions=40 --coverageThreshold.global.lines=35 --coverageThreshold.global.statements=35', {
        cwd: this.functionsPath,
        encoding: 'utf8'
      });

      // 解析輸出並生成中文報告
      this.generateChineseCoverageReport(output);

    } catch (error) {
      console.error('❌ 覆蓋率檢查失敗:', error);
      process.exit(1);
    }
  }

  /**
   * 生成中文覆蓋率報告
   */
  private generateChineseCoverageReport(output: string): void {
    console.log('\n📈 覆蓋率檢查報告 (中文版)');
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

    console.log('\n📊 覆蓋率統計 (中文版):');
    console.log('-'.repeat(40));

    if (coverageMatch && coverageMatch[1]) {
      const percentage = coverageMatch[1];
      const details = coverageMatch[2] || '';
      console.log(`語句覆蓋率: ${percentage}% (${details})`);
      this.checkThreshold('語句覆蓋率', parseFloat(percentage), 35);
    }
    if (branchesMatch && branchesMatch[1]) {
      const percentage = branchesMatch[1];
      const details = branchesMatch[2] || '';
      console.log(`分支覆蓋率: ${percentage}% (${details})`);
      this.checkThreshold('分支覆蓋率', parseFloat(percentage), 30);
    }
    if (functionsMatch && functionsMatch[1]) {
      const percentage = functionsMatch[1];
      const details = functionsMatch[2] || '';
      console.log(`函數覆蓋率: ${percentage}% (${details})`);
      this.checkThreshold('函數覆蓋率', parseFloat(percentage), 40);
    }
    if (linesMatch && linesMatch[1]) {
      const percentage = linesMatch[1];
      const details = linesMatch[2] || '';
      console.log(`行數覆蓋率: ${percentage}% (${details})`);
      this.checkThreshold('行數覆蓋率', parseFloat(percentage), 35);
    }

    console.log('\n✅ 覆蓋率檢查完成！');
  }

  /**
   * 檢查覆蓋率閾值
   */
  private checkThreshold(type: string, actual: number, threshold: number): void {
    if (actual >= threshold) {
      console.log(`  ✅ ${type}達到閾值要求 (${threshold}%)`);
    } else {
      console.log(`  ⚠️ ${type}未達閾值要求 (${threshold}%)`);
    }
  }
}

// 執行腳本
if (require.main === module) {
  const checker = new ChineseCoverageChecker();
  checker.run().catch(error => {
    console.error('腳本執行失敗:', error);
    process.exit(1);
  });
}

export { ChineseCoverageChecker };
