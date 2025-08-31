#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🧪 開始本地功能測試...');
  console.log('==============================================================');
  
  const scriptPath = path.join(__dirname, 'local.sh');
  execSync(`bash "${scriptPath}"`, {
    stdio: 'inherit',
    cwd: path.dirname(__dirname)
  });
} catch (error) {
  console.error('❌ 測試失敗:', error.message);
  process.exit(1);
}
