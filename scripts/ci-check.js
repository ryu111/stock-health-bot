#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🤖 Starting CI Quality Checks for Stock Health LINE Bot...');
  console.log('================================================================');
  
  // 執行 shell 腳本
  const scriptPath = path.join(__dirname, 'ci-check.sh');
  execSync(`bash "${scriptPath}"`, { 
    stdio: 'inherit',
    cwd: path.dirname(__dirname)
  });
  
  console.log('✅ CI check completed successfully');
} catch (error) {
  console.error('❌ CI check failed:', error.message);
  process.exit(1);
}
