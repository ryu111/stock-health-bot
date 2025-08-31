#!/usr/bin/env node

/**
 * 測試覆蓋率報告生成腳本
 * 用於生成詳細的覆蓋率報告和分析
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const __dirname = path.dirname(require.main?.filename || __filename);

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message: string) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSection(message: string) {
  log(`\n${'-'.repeat(40)}`, 'yellow');
  log(`  ${message}`, 'yellow');
  log(`${'-'.repeat(40)}`, 'yellow');
}

function checkCoverageDirectory() {
  const coverageDir = path.join(__dirname, '..', 'coverage');
  if (!fs.existsSync(coverageDir)) {
    log('❌ 覆蓋率目錄不存在，正在創建...', 'red');
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  return coverageDir;
}

function generateCoverageReport() {
  try {
    logHeader('開始生成測試覆蓋率報告');
    
    // 檢查覆蓋率目錄
    checkCoverageDirectory();
    
    logSection('執行測試並收集覆蓋率數據');
    
    // 執行測試並生成覆蓋率報告
    execSync('npm run test:coverage:full', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    logSection('覆蓋率報告生成完成');
    
    // 檢查生成的報告檔案
    const reportFiles = [
      'coverage/lcov/lcov.info',
      'coverage/html/index.html',
      'coverage/json/coverage.json',
      'coverage/cobertura/cobertura.xml'
    ];
    
    reportFiles.forEach(file => {
      const fullPath = path.join(__dirname, '..', file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        log(`✅ ${file} - ${(stats.size / 1024).toFixed(2)} KB`, 'green');
      } else {
        log(`❌ ${file} - 檔案不存在`, 'red');
      }
    });
    
    // 讀取並顯示覆蓋率摘要
    logSection('覆蓋率摘要');
    try {
      const coverageJsonPath = path.join(__dirname, '..', 'coverage', 'json', 'coverage.json');
      if (fs.existsSync(coverageJsonPath)) {
        const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
        
        Object.keys(coverageData).forEach(file => {
          const fileData = coverageData[file];
          const summary = fileData.summary;
          
          if (summary) {
            const { lines, functions, branches, statements } = summary;
            log(`${file}:`, 'blue');
            log(`  行覆蓋率: ${lines.pct}% (${lines.covered}/${lines.total})`, 
                lines.pct >= 80 ? 'green' : lines.pct >= 50 ? 'yellow' : 'red');
            log(`  函數覆蓋率: ${functions.pct}% (${functions.covered}/${functions.total})`,
                functions.pct >= 80 ? 'green' : functions.pct >= 50 ? 'yellow' : 'red');
            log(`  分支覆蓋率: ${branches.pct}% (${branches.covered}/${branches.total})`,
                branches.pct >= 80 ? 'green' : branches.pct >= 50 ? 'yellow' : 'red');
            log(`  語句覆蓋率: ${statements.pct}% (${statements.covered}/${statements.total})`,
                statements.pct >= 80 ? 'green' : statements.pct >= 50 ? 'yellow' : 'red');
          }
        });
      }
    } catch (error) {
      log(`❌ 讀取覆蓋率 JSON 檔案失敗: ${(error as Error).message}`, 'red');
    }
    
    // 生成覆蓋率分析報告
    generateCoverageAnalysis();
    
    logSection('報告生成完成');
    log('📊 HTML 報告位置: coverage/html/index.html', 'cyan');
    log('📈 LCOV 報告位置: coverage/lcov/lcov.info', 'cyan');
    log('📋 JSON 報告位置: coverage/json/coverage.json', 'cyan');
    log('🔍 Cobertura 報告位置: coverage/cobertura/cobertura.xml', 'cyan');
    
  } catch (error) {
    log(`❌ 生成覆蓋率報告失敗: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

function generateCoverageAnalysis() {
  logSection('生成覆蓋率分析報告');
  
  try {
    const coverageJsonPath = path.join(__dirname, '..', 'coverage', 'json', 'coverage.json');
    if (!fs.existsSync(coverageJsonPath)) {
      log('❌ 覆蓋率 JSON 檔案不存在', 'red');
      return;
    }
    
    const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
    const analysisReport = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalFiles: 0,
        totalLines: 0,
        totalFunctions: 0,
        totalBranches: 0,
        totalStatements: 0,
        coveredLines: 0,
        coveredFunctions: 0,
        coveredBranches: 0,
        coveredStatements: 0
      },
      files: [],
      modules: {
        services: { files: 0, coverage: 0 },
        controllers: { files: 0, coverage: 0 },
        utils: { files: 0, coverage: 0 },
        adapters: { files: 0, coverage: 0 },
        engines: { files: 0, coverage: 0 }
      }
    };
    
    Object.keys(coverageData).forEach(file => {
      const fileData = coverageData[file];
      const summary = fileData.summary;
      
      if (summary) {
        // 更新總計
        analysisReport.summary.totalFiles++;
        analysisReport.summary.totalLines += summary.lines.total;
        analysisReport.summary.totalFunctions += summary.functions.total;
        analysisReport.summary.totalBranches += summary.branches.total;
        analysisReport.summary.totalStatements += summary.statements.total;
        analysisReport.summary.coveredLines += summary.lines.covered;
        analysisReport.summary.coveredFunctions += summary.functions.covered;
        analysisReport.summary.coveredBranches += summary.branches.covered;
        analysisReport.summary.coveredStatements += summary.statements.covered;
        
        // 檔案詳細資訊
        const fileInfo = {
          file,
          lines: summary.lines,
          functions: summary.functions,
          branches: summary.branches,
          statements: summary.statements,
          averageCoverage: (
            summary.lines.pct + 
            summary.functions.pct + 
            summary.branches.pct + 
            summary.statements.pct
          ) / 4
        };
        
        (analysisReport.files as any[]).push(fileInfo);
        
        // 按模組分類
        if (file.includes('/services/')) {
          analysisReport.modules.services.files++;
          analysisReport.modules.services.coverage += fileInfo.averageCoverage;
        } else if (file.includes('/controllers/')) {
          analysisReport.modules.controllers.files++;
          analysisReport.modules.controllers.coverage += fileInfo.averageCoverage;
        } else if (file.includes('/utils/')) {
          analysisReport.modules.utils.files++;
          analysisReport.modules.utils.coverage += fileInfo.averageCoverage;
        } else if (file.includes('/adapters/')) {
          analysisReport.modules.adapters.files++;
          analysisReport.modules.adapters.coverage += fileInfo.averageCoverage;
        } else if (file.includes('/engines/')) {
          analysisReport.modules.engines.files++;
          analysisReport.modules.engines.coverage += fileInfo.averageCoverage;
        }
      }
    });
    
    // 計算模組平均覆蓋率
    Object.keys(analysisReport.modules).forEach(module => {
      const moduleData = (analysisReport.modules as any)[module];
      if (moduleData.files > 0) {
        moduleData.coverage = moduleData.coverage / moduleData.files;
      }
    });
    
    // 寫入分析報告
    const analysisPath = path.join(__dirname, '..', 'coverage', 'analysis-report.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysisReport, null, 2));
    
    log(`✅ 分析報告已生成: ${analysisPath}`, 'green');
    
    // 顯示模組覆蓋率摘要
    logSection('模組覆蓋率摘要');
    Object.keys(analysisReport.modules).forEach(module => {
      const moduleData = (analysisReport.modules as any)[module];
      if (moduleData.files > 0) {
        const color = moduleData.coverage >= 80 ? 'green' : 
                     moduleData.coverage >= 50 ? 'yellow' : 'red';
        log(`${module}: ${moduleData.coverage.toFixed(1)}% (${moduleData.files} 檔案)`, color);
      }
    });
    
  } catch (error) {
    log(`❌ 生成分析報告失敗: ${(error as Error).message}`, 'red');
  }
}

// 執行主函數
if (require.main === module) {
  generateCoverageReport();
}

export {
  generateCoverageReport,
  generateCoverageAnalysis
};
