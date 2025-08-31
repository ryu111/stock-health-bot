#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Firebase 部署腳本
 * 用於將股健檢應用程式部署到 Firebase Functions
 */
class DeployScript {
  private readonly projectRoot: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
  }

  /**
   * 執行部署流程
   */
  async run(): Promise<void> {
    console.log('🚀 開始部署股健檢到 Firebase...');
    console.log('==============================================================');

    try {
      // 檢查 Firebase 登入狀態
      await this.checkFirebaseLogin();

      // 執行品質檢查
      await this.runQualityChecks();

      // 部署到 Firebase
      await this.deployToFirebase();

      this.showSuccessMessage();
    } catch (error) {
      console.error('❌ 部署失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  /**
   * 檢查 Firebase 登入狀態
   */
  private async checkFirebaseLogin(): Promise<void> {
    console.log('🔑 檢查 Firebase 登入狀態...');
    try {
      execSync('firebase projects:list', { stdio: 'pipe' });
      console.log('✅ Firebase 已登入');
    } catch (firebaseError) {
      console.log('⚠️  需要 Firebase 登入');
      console.log('請執行: firebase login');
      throw new Error('Firebase 未登入');
    }
  }

  /**
   * 執行品質檢查
   */
  private async runQualityChecks(): Promise<void> {
    console.log('🔍 執行品質檢查...');
    execSync('cd functions && npm run analyze', { 
      stdio: 'inherit',
      cwd: this.projectRoot
    });
  }

  /**
   * 部署到 Firebase
   */
  private async deployToFirebase(): Promise<void> {
    console.log('🔥 部署到 Firebase...');
    execSync('firebase deploy --only functions', { 
      stdio: 'inherit',
      cwd: this.projectRoot
    });
  }

  /**
   * 顯示成功訊息
   */
  private showSuccessMessage(): void {
    console.log('');
    console.log('✅ 部署成功！');
    console.log('📡 生產環境 API: https://api-bhtpq7s4ka-uc.a.run.app');
    console.log('🔗 Webhook URL: https://api-bhtpq7s4ka-uc.a.run.app/webhook');
    console.log('');
    console.log('💡 記得在 LINE Developer Console 中設定 Webhook URL');
  }
}

// 執行部署
if (require.main === module) {
  const deployScript = new DeployScript();
  deployScript.run().catch(error => {
    console.error('部署失敗:', error);
    process.exit(1);
  });
}

export { DeployScript };


