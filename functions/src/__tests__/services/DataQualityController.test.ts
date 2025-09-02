// DataQualityController 測試
import { DataQualityController } from '../../services/DataQualityController';
import { DataSource, DataSourceStatus, DataSourceType } from '../../types/data-source';
import { MarketType, StockData } from '../../types/stock';

describe('DataQualityController', () => {
  const mockSource: DataSource = {
    id: 'mock',
    name: 'Mock Source',
    type: DataSourceType.MARKET_DATA,
    status: DataSourceStatus.ACTIVE,
    priority: 9,
    reliability: 0.9,
    updateFrequency: 'realtime',
    lastUpdate: new Date(),
    nextUpdate: new Date(),
    supportedMarkets: [MarketType.TW_STOCK],
    supportedDataTypes: ['price', 'fundamentals'],
    cost: { free: true },
  };

  const buildStock = (overrides: Partial<StockData> = {}): StockData => ({
    symbol: '2330',
    name: '台積電',
    price: 600,
    volume: 100000,
    dividendYield: 0.025,
    marketCap: 100000000000,
    currency: 'TWD',
    peRatio: 20,
    pbRatio: 5,
    eps: 30,
    roe: 0.25,
    debtToEquity: 0.3,
    currentRatio: 1.8,
    quickRatio: 1.2,
    inventoryTurnover: 6,
    assetTurnover: 0.7,
    netProfitMargin: 25,
    grossProfitMargin: 50,
    operatingMargin: 35,
    revenueGrowth: 10,
    earningsGrowth: 12,
    beta: 1,
    volatility: 10,
    sharpeRatio: 1,
    maxDrawdown: 20,
    var95: 15,
    sector: '半導體',
    industry: '晶圓代工',
    description: '測試資料',
    website: 'https://www.tsmc.com/',
    employees: 60000,
    founded: 1987,
    marketType: MarketType.TW_STOCK,
    lastUpdated: new Date(),
    ...overrides,
  });

  test('有效資料應通過驗證且有良好品質分數', async () => {
    const controller = new DataQualityController();
    const data = buildStock();
    const result = await controller.validate(data, mockSource);

    expect(result.isValid).toBe(true);
    expect(result.quality.overallScore).toBeGreaterThanOrEqual(70);
    expect(result.errors.length).toBe(0);
  });

  test('缺少必要欄位時應產生錯誤（完整性過低）', async () => {
    const controller = new DataQualityController({ requiredFields: ['symbol', 'price', 'lastUpdated', 'eps'] });
    const data = buildStock({ eps: null });
    const result = await controller.validate(data, mockSource);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'LOW_COMPLETENESS')).toBe(true);
  });

  test('資料過舊應產生時效性警告', async () => {
    const controller = new DataQualityController({ maximumAgeHours: 1 });
    const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 5); // 5 小時前
    const data = buildStock({ lastUpdated: oldDate });
    const result = await controller.validate(data, mockSource);

    expect(result.isValid).toBe(true); // 仍可能有效，但有警告
    expect(result.warnings.some(w => w.code === 'DATA_OUTDATED')).toBe(true);
  });

  test('價格不合法應產生錯誤', async () => {
    const controller = new DataQualityController();
    const data = buildStock({ price: 0 });
    const result = await controller.validate(data, mockSource);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_PRICE')).toBe(true);
  });

  test('毛利/營益/淨利率不一致應產生一致性警告', async () => {
    const controller = new DataQualityController();
    const data = buildStock({ grossProfitMargin: 20, operatingMargin: 30, netProfitMargin: 40 });
    const result = await controller.validate(data, mockSource);

    expect(result.warnings.some(w => w.code === 'INCONSISTENT_MARGINS')).toBe(true);
  });

  test('日內波動過大應產生異常警告', async () => {
    const controller = new DataQualityController();
    const data = buildStock({ volatility: 35 });
    const result = await controller.validate(data, mockSource);

    expect(result.warnings.some(w => w.code === 'HIGH_INTRADAY_VOL')).toBe(true);
  });

  test('成交量缺失或為0應產生異常警告', async () => {
    const controller = new DataQualityController();
    const data = buildStock({ volume: 0 });
    const result = await controller.validate(data, mockSource);

    expect(result.warnings.some(w => w.code === 'NO_VOLUME')).toBe(true);
  });
});
