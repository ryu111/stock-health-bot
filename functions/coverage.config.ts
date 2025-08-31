/**
 * 測試覆蓋率配置檔案
 * 提供詳細的覆蓋率設置和報告配置
 */

export default {
  // 覆蓋率報告目錄
  coverageDirectory: 'coverage',
  
  // 覆蓋率報告格式
  coverageReporters: [
    'text',           // 控制台輸出
    'text-summary',   // 簡要摘要
    'lcov',          // LCOV 格式 (用於 CI/CD)
    'html',          // HTML 報告
    'json',          // JSON 格式
    'cobertura'      // Cobertura 格式 (用於 Jenkins)
  ],
  
  // 覆蓋率閾值配置
  coverageThreshold: {
    // 全域閾值 (較寬鬆，適合初期開發)
    global: {
      branches: 30,
      functions: 40,
      lines: 35,
      statements: 35
    },
    
    // 服務層閾值 (中等標準)
    './src/services/': {
      branches: 50,
      functions: 60,
      lines: 55,
      statements: 55
    },
    
    // 控制器層閾值 (中等標準)
    './src/controllers/': {
      branches: 50,
      functions: 60,
      lines: 55,
      statements: 55
    },
    
    // 工具函數閾值 (高標準)
    './src/utils/': {
      branches: 70,
      functions: 80,
      lines: 75,
      statements: 75
    },
    
    // 適配器層閾值 (中等標準)
    './src/adapters/': {
      branches: 40,
      functions: 50,
      lines: 45,
      statements: 45
    },
    
    // 引擎層閾值 (中等標準)
    './src/engines/': {
      branches: 45,
      functions: 55,
      lines: 50,
      statements: 50
    }
  },
  
  // 覆蓋率收集範圍
  collectCoverageFrom: [
    // 包含所有 TypeScript 檔案
    'src/**/*.{ts,js}',
    
    // 排除檔案
    '!src/**/*.d.ts',                    // TypeScript 定義檔案
    '!src/**/*.test.{ts,js}',            // 測試檔案
    '!src/**/*.spec.{ts,js}',            // 規格檔案
    '!src/**/__tests__/**',              // 測試目錄
    '!src/**/mocks/**',                  // 模擬檔案
    '!src/**/setup/**',                  // 設置檔案
    '!src/**/types/**',                  // 類型定義目錄
    '!src/index.ts',                     // 主入口檔案
    '!src/**/config/**',                 // 配置檔案
    '!src/**/*.config.{ts,js}',          // 配置檔案
    '!src/**/jest.config.{ts,js}',       // Jest 配置
    '!src/**/coverage.config.{ts,js}',   // 覆蓋率配置
  ],
  
  // 覆蓋率排除路徑
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/__tests__/',
    '/mocks/',
    '/setup/',
    '/types/',
    'jest.config.js',
    'coverage.config.js',
    'test-setup.ts',
    'testUtils.ts',
    'mockServices.ts',
    'firebase-functions.ts',
    'firebase-admin.ts',
    '*.d.ts',
    'index.ts'
  ],
  
  // 覆蓋率報告配置
  coverageReporters: [
    {
      type: 'text',
      options: {
        skipEmpty: true,
        skipFull: false
      }
    },
    {
      type: 'text-summary',
      options: {
        skipEmpty: true,
        skipFull: false
      }
    },
    {
      type: 'html',
      options: {
        dir: 'coverage/html',
        subdir: '.'
      }
    },
    {
      type: 'lcov',
      options: {
        dir: 'coverage/lcov',
        file: 'lcov.info'
      }
    },
    {
      type: 'json',
      options: {
        dir: 'coverage/json',
        file: 'coverage.json'
      }
    },
    {
      type: 'cobertura',
      options: {
        dir: 'coverage/cobertura',
        file: 'cobertura.xml'
      }
    }
  ],
  
  // 覆蓋率統計配置
  coverageProvider: 'v8',
  
  // 覆蓋率收集選項
  collectCoverage: true,
  
  // 覆蓋率報告輸出
  verbose: true,
  
  // 覆蓋率失敗閾值
  coverageFailOnError: false,
  
  // 覆蓋率警告閾值
  coverageFailOnUncovered: false
};
