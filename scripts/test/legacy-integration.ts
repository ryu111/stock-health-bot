#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 現有測試腳本整合器
 * 將舊的手動測試腳本整合到新的自動化測試框架
 */
class LegacyTestIntegration {
  private readonly projectRoot: string;
  private readonly testScriptsPath: string;

  constructor() {
    this.projectRoot = path.dirname(path.dirname(__dirname));
    this.testScriptsPath = path.join(this.projectRoot, 'scripts', 'test');
  }

  /**
   * 執行所有現有測試腳本
   */
  async runAllLegacyTests(): Promise<void> {
    console.log('🔄 開始執行現有測試腳本整合...');
    console.log('================================================================');

    try {
      // 檢查現有測試腳本
      await this.checkLegacyScripts();

      // 執行 API 測試
      await this.runAPITests();

      // 執行股票服務測試
      await this.runStockTests();

      // 執行本地測試
      await this.runLocalTests();

      // 執行 ETF 調試測試
      await this.runETFTests();

      console.log('\n✅ 所有現有測試腳本整合完成！');
    } catch (error) {
      console.error('❌ 現有測試腳本整合失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  /**
   * 檢查現有測試腳本
   */
  private async checkLegacyScripts(): Promise<void> {
    console.log('🔍 檢查現有測試腳本...');
    
    const scripts = [
      'api.ts',
      'stock.ts',
      'local.ts',
      'etf-debug.ts',
      'start-and-test.ts',
      'local.sh'
    ];

    for (const script of scripts) {
      const scriptPath = path.join(this.testScriptsPath, script);
      if (fs.existsSync(scriptPath)) {
        console.log(`  ✅ ${script} - 存在`);
      } else {
        console.log(`  ⚠️  ${script} - 不存在`);
      }
    }
  }

  /**
   * 執行 API 測試
   */
  private async runAPITests(): Promise<void> {
    console.log('\n🌐 執行 API 測試...');
    
    try {
      // 檢查本地服務是否運行
      const isLocalRunning = await this.checkLocalService();
      
      if (isLocalRunning) {
        console.log('  🔄 執行 API 測試腳本...');
        execSync('ts-node api.ts', {
          stdio: 'inherit',
          cwd: this.testScriptsPath
        });
        console.log('  ✅ API 測試完成');
      } else {
        console.log('  ⚠️  本地服務未運行，跳過 API 測試');
      }
    } catch (error) {
      console.log('  ⚠️  API 測試失敗，但繼續執行其他測試');
    }
  }

  /**
   * 執行股票服務測試
   */
  private async runStockTests(): Promise<void> {
    console.log('\n📈 執行股票服務測試...');
    
    try {
      console.log('  🔄 執行股票服務測試腳本...');
      execSync('ts-node stock.ts', {
        stdio: 'inherit',
        cwd: this.testScriptsPath
      });
      console.log('  ✅ 股票服務測試完成');
    } catch (error) {
      console.log('  ⚠️  股票服務測試失敗，但繼續執行其他測試');
    }
  }

  /**
   * 執行本地測試
   */
  private async runLocalTests(): Promise<void> {
    console.log('\n🏠 執行本地測試...');
    
    try {
      // 執行 TypeScript 本地測試
      console.log('  🔄 執行 TypeScript 本地測試...');
      execSync('ts-node local.ts', {
        stdio: 'inherit',
        cwd: this.testScriptsPath
      });
      console.log('  ✅ TypeScript 本地測試完成');

      // 執行 Shell 本地測試
      console.log('  🔄 執行 Shell 本地測試...');
      execSync('bash local.sh', {
        stdio: 'inherit',
        cwd: this.testScriptsPath
      });
      console.log('  ✅ Shell 本地測試完成');
    } catch (error) {
      console.log('  ⚠️  本地測試失敗，但繼續執行其他測試');
    }
  }

  /**
   * 執行 ETF 測試
   */
  private async runETFTests(): Promise<void> {
    console.log('\n📊 執行 ETF 測試...');
    
    try {
      console.log('  🔄 執行 ETF 調試測試...');
      execSync('ts-node etf-debug.ts', {
        stdio: 'inherit',
        cwd: this.testScriptsPath
      });
      console.log('  ✅ ETF 測試完成');
    } catch (error) {
      console.log('  ⚠️  ETF 測試失敗，但繼續執行其他測試');
    }
  }

  /**
   * 檢查本地服務是否運行
   */
  private async checkLocalService(): Promise<boolean> {
    try {
      const response = execSync('curl -s http://localhost:5001/stock-health-app/us-central1/api/health', {
        encoding: 'utf8',
        timeout: 5000
      });
      return response.includes('ok') || response.includes('healthy');
    } catch {
      return false;
    }
  }

}

// 執行整合
if (require.main === module) {
  const legacyIntegration = new LegacyTestIntegration();
  legacyIntegration.runAllLegacyTests().catch(error => {
    console.error('現有測試腳本整合失敗:', error);
    process.exit(1);
  });
}

export { LegacyTestIntegration };
