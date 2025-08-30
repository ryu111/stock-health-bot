#!/usr/bin/env node

// 🚀 Firebase 部署腳本
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 開始部署股健檢到 Firebase...');
console.log('==============================================================');

try {
  // 執行品質檢查
  console.log('🔍 執行品質檢查...');
  execSync('cd functions && npm run analyze', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../../')
  });

  // 部署到 Firebase
  console.log('🔥 部署到 Firebase...');
  execSync('firebase deploy --only functions', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../../')
  });

  console.log('');
  console.log('✅ 部署成功！');
  console.log('📡 生產環境 API: https://api-bhtpq7s4ka-uc.a.run.app');
  console.log('🔗 Webhook URL: https://api-bhtpq7s4ka-uc.a.run.app/webhook');
  console.log('');
  console.log('💡 記得在 LINE Developer Console 中設定 Webhook URL');

} catch (error) {
  console.error('❌ 部署失敗:', error.message);
  process.exit(1);
}
