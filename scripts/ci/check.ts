#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * CI 品質檢查腳本
 * 整合測試執行和品質檢查
 */
class CICheckScript {
  private readonly projectRoot: string;
  private readonly functionsPath: string;
  private readonly scriptPath: string;

  constructor() {
    // 從 scripts/ci/ 目錄回到專案根目錄
    this.projectRoot = path.dirname(path.dirname(__dirname));
    this.functionsPath = path.join(this.projectRoot, 'functions');
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
      
      // 檢查 functions 目錄是否存在
      if (!fs.existsSync(this.functionsPath)) {
        throw new Error('Functions directory not found!');
      }

      // 執行基礎品質檢查
      await this.runBasicChecks();
      
      // 執行測試檢查
      await this.runTestChecks();
      
      // 執行覆蓋率檢查
      await this.runCoverageChecks();
      
      console.log('✅ CI 檢查完成');
    } catch (error) {
      console.error('❌ CI 檢查失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  /**
   * 執行基礎品質檢查
   */
  private async runBasicChecks(): Promise<void> {
    console.log('🔍 執行基礎品質檢查...');
    
    try {
      // 執行 shell 腳本進行基礎檢查
      execSync(`bash "${this.scriptPath}"`, { 
        stdio: 'inherit',
        cwd: this.projectRoot
      });
      
      console.log('✅ 基礎品質檢查通過');
    } catch (error) {
      throw new Error(`基礎品質檢查失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 執行測試檢查
   */
  private async runTestChecks(): Promise<void> {
    console.log('🧪 執行測試檢查...');
    
    try {
      // 切換到 functions 目錄
      process.chdir(this.functionsPath);
      
      // 執行單元測試
      console.log('  📋 執行單元測試...');
      execSync('npm run test', { 
        stdio: 'inherit',
        cwd: this.functionsPath
      });
      
      // 執行整合測試
      console.log('  🔗 執行整合測試...');
      execSync('npm run test -- --testPathPattern="(api|controllers)"', { 
        stdio: 'inherit',
        cwd: this.functionsPath
      });
      
      // 執行端到端測試
      console.log('  🌐 執行端到端測試...');
      execSync('npm run test -- --testPathPattern="e2e"', { 
        stdio: 'inherit',
        cwd: this.functionsPath
      });
      
      console.log('✅ 測試檢查通過');
    } catch (error) {
      throw new Error(`測試檢查失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 執行覆蓋率檢查
   */
  private async runCoverageChecks(): Promise<void> {
    console.log('📊 執行覆蓋率檢查...');
    
    try {
      // 執行覆蓋率檢查
      execSync('npm run test:coverage:check', { 
        stdio: 'inherit',
        cwd: this.functionsPath
      });
      
      // 生成覆蓋率報告
      console.log('  📈 生成覆蓋率報告...');
      execSync('npm run test:coverage:full', { 
        stdio: 'inherit',
        cwd: this.functionsPath
      });
      
      console.log('✅ 覆蓋率檢查通過');
    } catch (error) {
      throw new Error(`覆蓋率檢查失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 生成測試報告摘要
   */
  private generateTestSummary(): void {
    console.log('\n📋 測試報告摘要:');
    console.log('  ✅ 單元測試: 通過');
    console.log('  ✅ 整合測試: 通過');
    console.log('  ✅ 端到端測試: 通過');
    console.log('  ✅ 覆蓋率檢查: 通過');
    console.log('  📊 覆蓋率報告: 已生成');
  }
}

// 執行檢查
if (import.meta.url === `file://${process.argv[1]}`) {
  const ciCheckScript = new CICheckScript();
  ciCheckScript.run().catch(error => {
    console.error('CI 檢查失敗:', error);
    process.exit(1);
  });
}

export { CICheckScript };

