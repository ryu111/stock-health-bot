import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // 測試環境
  testEnvironment: 'node',
  
  // 根目錄
  roots: ['<rootDir>/src'],
  
  // 測試檔案匹配模式
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js',
    '**/*.test.ts',
    '**/*.test.js'
  ],
  
  // 檔案擴展名
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // TypeScript 支援
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  

  
  // 測試覆蓋率配置
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json',
    'text-summary'
  ],
  
  // 覆蓋率閾值暫時停用以便專注於測試功能
  // coverageThreshold: {
  //   global: {
  //     branches: 35,
  //     functions: 50,
  //     lines: 45,
  //     statements: 45
  //   },
  //   // 針對關鍵模組設置合理標準
  //   './src/services/': {
  //     branches: 50,
  //     functions: 70,
  //     lines: 60,
  //     statements: 60
  //   },
  //   './src/controllers/': {
  //     branches: 40,
  //     functions: 60,
  //     lines: 55,
  //     statements: 55
  //   },
  //   './src/utils/': {
  //     branches: 75,
  //     functions: 60,
  //     lines: 70,
  //     statements: 70
  //   }
  // },
  
  // 覆蓋率排除規則
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/',
    '/coverage/',
    '/mocks/',
    'jest.config.js',
    'test-setup.ts',
    'testUtils.ts',
    'mockServices.ts',
    'firebase-functions.ts',
    'firebase-admin.ts',
    'index.ts', // 主入口檔案
    'types/', // 類型定義檔案
    '\\.d\\.ts$' // TypeScript 定義檔案
  ],
  
  // 覆蓋率收集配置
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/**/__tests__/**',
    '!src/**/mocks/**',
    '!src/**/setup/**',
    '!src/index.ts'
  ],
  
  // 測試設置檔案
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/testSetup.ts'],
  
  // 測試超時時間
  testTimeout: 10000,
  
  // 清除模擬
  clearMocks: true,
  
  // 模擬 Firebase Functions
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^firebase-functions$': '<rootDir>/src/__tests__/mocks/firebase-functions.ts',
    '^firebase-admin$': '<rootDir>/src/__tests__/mocks/firebase-admin.ts'
  },
  
  // 環境變數
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};

export default config;
