#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🤖 開始執行股健檢 LINE Bot 品質檢查...');
  console.log('================================================================');
  
  // 執行 shell 腳本
  const scriptPath = path.join(__dirname, 'check.sh');
  execSync(`bash "${scriptPath}"`, { 
    stdio: 'inherit',
    cwd: path.dirname(path.dirname(__dirname))
  });
  
  console.log('✅ CI 檢查完成');
} catch (error) {
  console.error('❌ CI 檢查失敗:', error.message);
  process.exit(1);
}
