// PublicInfoSource 測試
import { PublicInfoSource } from '../../services/sources/PublicInfoSource';
import { DataSourceStatus } from '../../types/data-source';

describe('PublicInfoSource', () => {
  let publicInfoSource: PublicInfoSource;

  beforeEach(() => {
    publicInfoSource = new PublicInfoSource();
  });

  test('應該能正確建立實例', () => {
    expect(publicInfoSource).toBeInstanceOf(PublicInfoSource);
  });

  test('應該能取得資料來源資訊', () => {
    const dataSource = publicInfoSource.getDataSource();
    
    expect(dataSource.id).toBe('public_info');
    expect(dataSource.name).toBe('公開資訊觀測站');
    expect(dataSource.type).toBe('public_info');
    expect(dataSource.priority).toBe(2);
    expect(dataSource.reliability).toBe(0.98);
    expect(dataSource.supportedMarkets).toContain('TW_STOCK');
  });

  test('應該能檢查資料來源狀態', () => {
    const status = publicInfoSource.getStatus();
    expect(status).toBe(DataSourceStatus.ACTIVE);
  });

  test('應該能取得財務資料', async () => {
    const result = await publicInfoSource.fetchFinancialData('2330', 2024, 1);
    
    expect(result.data).toBeDefined();
    expect(result.data.symbol).toBe('2330');
    expect(result.data.period).toBe('2024Q1');
    expect(result.data.eps).toBeGreaterThan(0);
    expect(result.data.revenue).toBeGreaterThan(0);
    expect(result.data.netIncome).toBeGreaterThan(0);
    expect(result.source.id).toBe('public_info');
    expect(result.quality).toBe(0.98);
    expect(result.confidence).toBe(0.95);
  });

  test('應該能取得全年財務資料', async () => {
    const result = await publicInfoSource.fetchFinancialData('2330', 2023, 0);
    
    expect(result.data).toBeDefined();
    expect(result.data.symbol).toBe('2330');
    expect(result.data.period).toBe('2023全年');
    expect(result.data.eps).toBeGreaterThan(0);
  });

  test('應該能取得股利資料', async () => {
    const result = await publicInfoSource.fetchDividendData('2330', 2023);
    
    expect(result.data).toBeDefined();
    expect(result.data.symbol).toBe('2330');
    expect(result.data.year).toBe(2023);
    expect(result.data.cashDividend).toBeGreaterThan(0);
    expect(result.data.totalDividend).toBeGreaterThan(0);
    expect(result.data.dividendYield).toBeGreaterThan(0);
    expect(result.data.payoutRatio).toBeGreaterThan(0);
  });

  test('應該能取得最新年度財務資料', async () => {
    const result = await publicInfoSource.fetchLatestFinancialData('2330');
    
    expect(result.data).toBeDefined();
    expect(result.data.symbol).toBe('2330');
    expect(result.data.eps).toBeGreaterThan(0);
    expect(result.data.revenue).toBeGreaterThan(0);
  });

  test('應該能處理快取機制', async () => {
    // 第一次呼叫
    const result1 = await publicInfoSource.fetchFinancialData('2330', 2024, 1);
    expect(result1.data).toBeDefined();
    
    // 第二次呼叫應該使用快取
    const result2 = await publicInfoSource.fetchFinancialData('2330', 2024, 1);
    expect(result2.data).toBeDefined();
    expect(result2.data.symbol).toBe('2330');
  });

  test('應該能強制重新取得資料', async () => {
    // 第一次呼叫
    const result1 = await publicInfoSource.fetchFinancialData('2330', 2024, 1);
    expect(result1.data).toBeDefined();
    
    // 強制重新取得
    const result2 = await publicInfoSource.fetchFinancialData('2330', 2024, 1, true);
    expect(result2.data).toBeDefined();
    expect(result2.data.symbol).toBe('2330');
  });

  test('應該能檢查速率限制', () => {
    const checkRateLimit = (publicInfoSource as any).checkRateLimit.bind(publicInfoSource);
    
    // 初始狀態應該沒有速率限制
    expect(checkRateLimit()).toBe(true);
  });

  test('應該能判斷錯誤是否可重試', () => {
    const isRetryableError = (publicInfoSource as any).isRetryableError.bind(publicInfoSource);
    
    expect(isRetryableError(new Error('timeout error'))).toBe(true);
    expect(isRetryableError(new Error('network error'))).toBe(true);
    expect(isRetryableError(new Error('rate limit exceeded'))).toBe(true);
    expect(isRetryableError(new Error('service unavailable'))).toBe(true);
    expect(isRetryableError(new Error('not found'))).toBe(false);
    expect(isRetryableError(new Error('validation error'))).toBe(false);
  });

  test('應該能處理多個股票代碼', async () => {
    const symbols = ['2330', '2317', '2454'];
    
    for (const symbol of symbols) {
      const result = await publicInfoSource.fetchFinancialData(symbol, 2024, 1);
      expect(result.data.symbol).toBe(symbol);
      expect(result.data.eps).toBeGreaterThan(0);
    }
  });

  test('應該能處理不同年度資料', async () => {
    const years = [2022, 2023, 2024];
    
    for (const year of years) {
      const result = await publicInfoSource.fetchFinancialData('2330', year, 1);
      expect(result.data.period).toContain(year.toString());
      expect(result.data.eps).toBeGreaterThan(0);
    }
  });
});
