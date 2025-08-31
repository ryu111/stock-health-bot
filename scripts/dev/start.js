#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🚀 啟動股健檢本地開發環境...');
  console.log('==============================================================');
  
  const scriptPath = path.join(__dirname, 'start.sh');
  execSync(`bash "${scriptPath}"`, {
    stdio: 'inherit',
    cwd: path.dirname(__dirname)
  });
} catch (error) {
  console.error('❌ 啟動失敗:', error.message);
  process.exit(1);
}
