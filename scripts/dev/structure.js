#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🔍 分析專案結構...');
  console.log('==============================================================');
  
  const workspacePath = path.dirname(__dirname);
  execSync(`ls -la "${workspacePath}"`, {
    stdio: 'inherit',
    cwd: workspacePath
  });
} catch (error) {
  console.error('❌ 分析失敗:', error.message);
  process.exit(1);
}
