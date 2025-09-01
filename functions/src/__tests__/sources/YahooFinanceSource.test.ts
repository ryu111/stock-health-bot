// YahooFinanceSource 測試
import { YahooFinanceSource } from '../../services/sources/YahooFinanceSource';
import { DataSourceStatus } from '../../types/data-source';

describe('YahooFinanceSource', () => {
  let yahooSource: YahooFinanceSource;

  beforeEach(() => {
    yahooSource = new YahooFinanceSource();
  });

  test('應該能正確建立實例', () => {
    expect(yahooSource).toBeInstanceOf(YahooFinanceSource);
  });

  test('應該能取得資料來源資訊', () => {
    const dataSource = yahooSource.getDataSource();
    
    expect(dataSource.id).toBe('yahoo_finance');
    expect(dataSource.name).toBe('Yahoo Finance');
    expect(dataSource.type).toBe('yahoo_finance');
    expect(dataSource.priority).toBe(1);
    expect(dataSource.reliability).toBe(0.95);
  });

  test('應該能檢查資料來源狀態', () => {
    const status = yahooSource.getStatus();
    
    // 狀態可能是 ACTIVE 或 ERROR (取決於 yahoo-finance2 模組是否載入)
    expect([DataSourceStatus.ACTIVE, DataSourceStatus.ERROR]).toContain(status);
  });

  test('應該能格式化股票代碼', () => {
    // 使用反射來測試私有方法
    const formatSymbol = (yahooSource as any).formatSymbol.bind(yahooSource);
    
    expect(formatSymbol('2330')).toBe('2330.TW');
    expect(formatSymbol('AAPL')).toBe('AAPL.TW'); // 預設加上.TW
    expect(formatSymbol('2330.TW')).toBe('2330.TW'); // 已有後綴
  });

  test('應該能計算波動率', () => {
    const calculateVolatility = (yahooSource as any).calculateVolatility.bind(yahooSource);
    
    expect(calculateVolatility('100-120')).toBeCloseTo(18.18, 1); // (120-100)/110 * 100
    expect(calculateVolatility('50-60')).toBeCloseTo(18.18, 1);   // (60-50)/55 * 100
    expect(calculateVolatility('invalid')).toBeNull();
    expect(calculateVolatility('100')).toBeNull();
  });

  test('應該能檢查速率限制', () => {
    const checkRateLimit = (yahooSource as any).checkRateLimit.bind(yahooSource);
    
    // 初始狀態應該沒有速率限制
    expect(checkRateLimit()).toBe(true);
  });

  test('應該能判斷錯誤是否可重試', () => {
    const isRetryableError = (yahooSource as any).isRetryableError.bind(yahooSource);
    
    expect(isRetryableError(new Error('timeout error'))).toBe(true);
    expect(isRetryableError(new Error('network error'))).toBe(true);
    expect(isRetryableError(new Error('rate limit exceeded'))).toBe(true);
    expect(isRetryableError(new Error('not found'))).toBe(false);
    expect(isRetryableError(new Error('validation error'))).toBe(false);
  });
});
