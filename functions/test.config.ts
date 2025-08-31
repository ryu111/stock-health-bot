// 測試配置
export const testConfig = {
  // 測試環境變數
  env: {
    NODE_ENV: 'test',
    FIREBASE_PROJECT_ID: 'test-project-id',
    FIREBASE_PRIVATE_KEY: 'test-private-key',
    FIREBASE_CLIENT_EMAIL: 'test@test.com',
    LINE_CHANNEL_ACCESS_TOKEN: 'test-channel-access-token',
    LINE_CHANNEL_SECRET: 'test-channel-secret',
    YAHOO_FINANCE_API_KEY: 'test-api-key',
    TEST_USER_ID: 'test-user-id',
    TEST_REPLY_TOKEN: 'test-reply-token'
  },

  // 測試股票代碼
  symbols: {
    stock: '2330',
    etf: '0050'
  },

  // 測試超時時間
  timeouts: {
    short: 1000,
    medium: 5000,
    long: 10000
  },

  // 測試數據
  mockData: {
    stockSymbols: ['2330', '0050', '2317', '2454'],
    etfSymbols: ['0050', '0056', '0061', '00692']
  }
};
