import dotenv from 'dotenv';

// 載入測試環境變數
dotenv.config({ path: '.env.test' });

// 設置測試環境變數
process.env['NODE_ENV'] = 'test';

// 模擬 Firebase Functions 環境
process.env['FIREBASE_PROJECT_ID'] = 'test-project-id';
process.env['FIREBASE_PRIVATE_KEY'] = 'test-private-key';
process.env['FIREBASE_CLIENT_EMAIL'] = 'test@test.com';

// 模擬 LINE Bot 環境變數
process.env['LINE_CHANNEL_ACCESS_TOKEN'] = 'test-channel-access-token';
process.env['LINE_CHANNEL_SECRET'] = 'test-channel-secret';

// 模擬 Yahoo Finance API 環境變數
process.env['YAHOO_FINANCE_API_KEY'] = 'test-api-key';

// 設置測試超時時間
jest.setTimeout(10000);

// 全局測試設置
beforeAll(() => {
  console.log('🧪 開始測試環境設置...');
});

afterAll(() => {
  console.log('🧹 清理測試環境...');
});

// 全局模擬設置
global.console = {
  ...console,
  // 在測試中靜默某些 console 輸出
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
