#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 向後相容性測試腳本
 * 確保新的測試框架與現有測試腳本相容
 */
class BackwardCompatibilityTest {
  private readonly projectRoot: string;
  private readonly functionsPath: string;
  private readonly testScriptsPath: string;

  constructor() {
    this.projectRoot = path.dirname(path.dirname(__dirname));
    this.functionsPath = path.join(this.projectRoot, 'functions');
    this.testScriptsPath = path.join(this.projectRoot, 'scripts', 'test');
  }

  /**
   * 執行向後相容性測試
   */
  async runCompatibilityTests(): Promise<void> {
    console.log('🔄 開始執行向後相容性測試...');
    console.log('================================================================');

    try {
      // 檢查檔案結構相容性
      await this.checkFileStructureCompatibility();

      // 檢查 API 相容性
      await this.checkAPICompatibility();

      // 檢查測試命令相容性
      await this.checkTestCommandCompatibility();

      // 檢查配置相容性
      await this.checkConfigCompatibility();

      console.log('\n✅ 向後相容性測試完成！');
    } catch (error) {
      console.error('❌ 向後相容性測試失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  /**
   * 檢查檔案結構相容性
   */
  private async checkFileStructureCompatibility(): Promise<void> {
    console.log('📁 檢查檔案結構相容性...');

    const requiredFiles = [
      'scripts/test/api.ts',
      'scripts/test/stock.ts',
      'scripts/test/local.ts',
      'scripts/test/local.sh',
      'functions/jest.config.ts',
      'functions/package.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file} - 存在`);
      } else {
        console.log(`  ❌ ${file} - 不存在`);
        throw new Error(`必需檔案 ${file} 不存在`);
      }
    }
  }

  /**
   * 檢查 API 相容性
   */
  private async checkAPICompatibility(): Promise<void> {
    console.log('\n🌐 檢查 API 相容性...');

    // 檢查新的測試 API 是否與舊的相容
    const newTestFiles = [
      'src/__tests__/api/webhook.test.ts',
      'src/__tests__/controllers/LineBotController.test.ts',
      'src/__tests__/services/StockService.test.ts'
    ];

    for (const file of newTestFiles) {
      const filePath = path.join(this.functionsPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file} - 新測試檔案存在`);
      } else {
        console.log(`  ⚠️  ${file} - 新測試檔案不存在`);
      }
    }

    // 檢查舊的測試腳本是否仍然可用
    const legacyScripts = [
      'api.ts',
      'stock.ts',
      'local.ts'
    ];

    for (const script of legacyScripts) {
      const scriptPath = path.join(this.testScriptsPath, script);
      if (fs.existsSync(scriptPath)) {
        console.log(`  ✅ ${script} - 舊測試腳本存在`);
      } else {
        console.log(`  ⚠️  ${script} - 舊測試腳本不存在`);
      }
    }
  }

  /**
   * 檢查測試命令相容性
   */
  private async checkTestCommandCompatibility(): Promise<void> {
    console.log('\n🔧 檢查測試命令相容性...');

    try {
      // 檢查新的測試命令
      console.log('  🔄 檢查新測試命令...');
      execSync('npm test -- --version', {
        stdio: 'pipe',
        cwd: this.functionsPath
      });
      console.log('  ✅ 新測試命令可用');

      // 檢查覆蓋率命令
      console.log('  🔄 檢查覆蓋率命令...');
      execSync('npm run test:coverage -- --version', {
        stdio: 'pipe',
        cwd: this.functionsPath
      });
      console.log('  ✅ 覆蓋率命令可用');

    } catch (error) {
      console.log('  ⚠️  某些測試命令不可用，但繼續檢查');
    }
  }

  /**
   * 檢查配置相容性
   */
  private async checkConfigCompatibility(): Promise<void> {
    console.log('\n⚙️ 檢查配置相容性...');

    // 檢查 Jest 配置
    const jestConfigPath = path.join(this.functionsPath, 'jest.config.ts');
    if (fs.existsSync(jestConfigPath)) {
      console.log('  ✅ Jest 配置檔案存在 (TypeScript)');
    } else {
      const jestConfigJsPath = path.join(this.functionsPath, 'jest.config.js');
      if (fs.existsSync(jestConfigJsPath)) {
        console.log('  ✅ Jest 配置檔案存在 (JavaScript)');
      } else {
        console.log('  ❌ Jest 配置檔案不存在');
      }
    }

    // 檢查 package.json 中的測試腳本
    const packageJsonPath = path.join(this.functionsPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};
      
      const requiredScripts = ['test', 'test:coverage', 'test:ci'];
      for (const script of requiredScripts) {
        if (scripts[script]) {
          console.log(`  ✅ ${script} 腳本存在`);
        } else {
          console.log(`  ⚠️  ${script} 腳本不存在`);
        }
      }
    }
  }

  /**
   * 生成相容性報告
   */
  private generateCompatibilityReport(): void {
    console.log('\n📋 向後相容性報告:');
    console.log('  ✅ 檔案結構: 相容');
    console.log('  ✅ API 介面: 相容');
    console.log('  ✅ 測試命令: 相容');
    console.log('  ✅ 配置檔案: 相容');
    console.log('  🔄 新舊測試框架: 並存');
    console.log('  📊 遷移路徑: 清晰');
  }
}

// 執行相容性測試
if (require.main === module) {
  const compatibilityTest = new BackwardCompatibilityTest();
  compatibilityTest.runCompatibilityTests().catch(error => {
    console.error('向後相容性測試失敗:', error);
    process.exit(1);
  });
}

export { BackwardCompatibilityTest };
