// LineBotController 測試
import { LineBotController } from '../../controllers/LineBotController';
import { MarketType } from '../../types/stock';
import { AnalysisType } from '../../types/analysis';

// Mock 資料建立函數
const buildMockStockData = () => ({
  symbol: '2330',
  marketType: MarketType.TW_STOCK,
  price: 500,
  volume: 1000000,
  marketCap: 5000000000000, // 5兆
  dividendYield: 0.02,
  epsTtm: 25,
  peLow: 15,
  peHigh: 25,
  fcf: 100000000000, // 1000億
  growthRate: 0.15,
  discountRate: 0.1,
  terminalGrowth: 0.03,
  ddmDiscountRate: 0.08,
  dividendGrowth: 0.05,
  volatility: 0.25,
  priceChange: 0.05,
  name: '台積電',
  currency: 'TWD',
  peRatio: 20,
  pbRatio: 5.0,
  eps: 25,
  roe: 0.25,
  debtToEquity: 0.1,
  currentRatio: 2.5,
  quickRatio: 2.2,
  inventoryTurnover: 10,
  assetTurnover: 0.8,
  netProfitMargin: 0.35,
  grossProfitMargin: 0.5,
  operatingMargin: 0.4,
  revenueGrowth: 0.2,
  earningsGrowth: 0.25,
  beta: 1.1,
  sharpeRatio: 1.5,
  maxDrawdown: 0.2,
  var95: 0.1,
  sector: 'Technology',
  industry: 'Semiconductor',
  description: '全球最大的晶圓代工廠',
  website: 'https://www.tsmc.com',
  employees: 65000,
  founded: 1987,
  lastUpdated: new Date(),
});

const buildMockETFData = () => ({
  symbol: '0050',
  marketType: MarketType.ETF,
  price: 100,
  volume: 500000,
  marketCap: 100000000000, // 1000億
  dividendYield: 0.03,
  targetYields: [0.025, 0.03, 0.035],
  name: '元大台灣50',
  currency: 'TWD',
  peRatio: 15,
  pbRatio: 2.5,
  eps: 6.67,
  roe: 0.15,
  debtToEquity: 0.1,
  currentRatio: 2.0,
  quickRatio: 1.8,
  inventoryTurnover: 8,
  assetTurnover: 0.8,
  netProfitMargin: 0.2,
  grossProfitMargin: 0.4,
  operatingMargin: 0.25,
  revenueGrowth: 0.1,
  earningsGrowth: 0.12,
  beta: 1.0,
  volatility: 0.2,
  sharpeRatio: 1.2,
  maxDrawdown: 0.15,
  var95: 0.08,
  sector: 'ETF',
  industry: 'Index',
  description: '追蹤台灣50指數的ETF',
  website: 'https://www.yuanta.com.tw',
  employees: 100,
  founded: 2003,
  lastUpdated: new Date(),
});

// Mock 外部依賴
jest.mock('../../services/AIAnalyzer');
jest.mock('../../adapters/StockDataAdapter');
jest.mock('../../adapters/ETFDataAdapter');
jest.mock('../../utils/FlexMessageGenerator');
jest.mock('../../engines/AnalysisEngine');
jest.mock('../../utils/Logger');
jest.mock('../../config/LineConfig');
jest.mock('../../utils/Validation');

describe('LineBotController', () => {
  let controller: LineBotController;
  let mockAIAnalyzer: jest.Mocked<any>;
  let mockStockAdapter: jest.Mocked<any>;
  let mockETFAdapter: jest.Mocked<any>;
  let mockFlexMessageGenerator: jest.Mocked<any>;
  let mockComprehensiveEngine: jest.Mocked<any>;
  let mockLogger: jest.Mocked<any>;
  let mockLineConfig: jest.Mocked<any>;
  let mockValidation: jest.Mocked<any>;

  beforeEach(() => {
    // 清理所有 mock
    jest.clearAllMocks();

    // 建立 mock 實例
    mockAIAnalyzer = {
      analyzeStock: jest.fn(),
    };

    mockStockAdapter = {
      fetchStockData: jest.fn(),
    };

    mockETFAdapter = {
      fetchStockData: jest.fn(),
    };

    mockFlexMessageGenerator = {
      createStockInfoMessage: jest.fn(),
      createETFInfoMessage: jest.fn(),
      createAnalysisMessage: jest.fn(),
      createErrorMessage: jest.fn(),
    };

    mockComprehensiveEngine = {
      performComprehensiveAnalysis: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      getInstance: jest.fn().mockReturnValue(mockLogger),
    };

    mockLineConfig = {
      isValid: jest.fn().mockReturnValue(true),
    };

    mockValidation = {
      isValidStockSymbol: jest.fn(),
      isValidETFSymbol: jest.fn(),
    };

    // 設定 mock 模組
    const { AIAnalyzer } = require('../../services/AIAnalyzer');
    const { StockDataAdapter } = require('../../adapters/StockDataAdapter');
    const { ETFDataAdapter } = require('../../adapters/ETFDataAdapter');
    const { FlexMessageGenerator } = require('../../utils/FlexMessageGenerator');
    const { ComprehensiveAnalysisEngine } = require('../../engines/AnalysisEngine');
    const { Logger } = require('../../utils/Logger');
    const { LineConfig } = require('../../config/LineConfig');
    const { Validation } = require('../../utils/Validation');

    AIAnalyzer.mockImplementation(() => mockAIAnalyzer);
    StockDataAdapter.mockImplementation(() => mockStockAdapter);
    ETFDataAdapter.mockImplementation(() => mockETFAdapter);
    FlexMessageGenerator.mockImplementation(() => mockFlexMessageGenerator);
    ComprehensiveAnalysisEngine.mockImplementation(() => mockComprehensiveEngine);
    Logger.getInstance.mockReturnValue(mockLogger);
    LineConfig.mockImplementation(() => mockLineConfig);
    Validation.isValidStockSymbol = mockValidation.isValidStockSymbol;
    Validation.isValidETFSymbol = mockValidation.isValidETFSymbol;

    controller = new LineBotController();
  });

  describe('體質分析功能', () => {
    test('應能識別體質分析請求', () => {
      const text = '2330 體質';
      const symbol = (controller as any).extractSymbolFromHealthRequest(text);
      expect(symbol).toBe('2330');
    });

    test('應能識別健康分析請求', () => {
      const text = '0050 健康';
      const symbol = (controller as any).extractSymbolFromHealthRequest(text);
      expect(symbol).toBe('0050');
    });

    test('應能識別英文體質分析請求', () => {
      const text = '2330 HEALTH';
      const symbol = (controller as any).extractSymbolFromHealthRequest(text);
      expect(symbol).toBe('2330');
    });

    test('應能識別體質關鍵字在前面的請求', () => {
      const text = '體質 2330';
      const symbol = (controller as any).extractSymbolFromHealthRequest(text);
      expect(symbol).toBe('2330');
    });

    test('應能識別健康關鍵字在前面的請求', () => {
      const text = '健康 0050';
      const symbol = (controller as any).extractSymbolFromHealthRequest(text);
      expect(symbol).toBe('0050');
    });

    test('應能處理無效的體質分析請求', () => {
      const text = '體質分析';
      const symbol = (controller as any).extractSymbolFromHealthRequest(text);
      expect(symbol).toBeNull();
    });
  });

  describe('體質分析處理', () => {
    test('應能處理股票體質分析請求', async () => {
      const stockData = buildMockStockData();
      const comprehensiveResult = {
        analysisResult: { symbol: '2330', type: AnalysisType.COMPREHENSIVE } as any,
        valuationResult: { symbol: '2330' } as any,
        healthReport: { symbol: '2330', overallScore: 85 } as any,
        investmentRecommendation: { symbol: '2330', action: 'BUY' } as any,
        entryPriceResult: { symbol: '2330', currentPrice: 500 } as any,
      };

      mockValidation.isValidStockSymbol.mockReturnValue(true);
      mockValidation.isValidETFSymbol.mockReturnValue(false);
      mockStockAdapter.fetchStockData.mockResolvedValue(stockData);
      mockComprehensiveEngine.performComprehensiveAnalysis.mockResolvedValue(comprehensiveResult);
      mockFlexMessageGenerator.createAnalysisMessage.mockReturnValue({ type: 'flex' } as any);

      await (controller as any).handleHealthAnalysisRequest('reply-token', '2330');

      expect(mockStockAdapter.fetchStockData).toHaveBeenCalledWith('2330');
      expect(mockComprehensiveEngine.performComprehensiveAnalysis).toHaveBeenCalledWith(
        '2330',
        stockData,
        'NEUTRAL',
        'Semiconductor'
      );
      expect(mockFlexMessageGenerator.createAnalysisMessage).toHaveBeenCalledWith(comprehensiveResult.analysisResult);
    });

    test('應能處理ETF體質分析請求', async () => {
      const etfData = buildMockETFData();
      const comprehensiveResult = {
        analysisResult: { symbol: '0050', type: AnalysisType.COMPREHENSIVE } as any,
        valuationResult: { symbol: '0050' } as any,
        healthReport: { symbol: '0050', overallScore: 80 } as any,
        investmentRecommendation: { symbol: '0050', action: 'HOLD' } as any,
        entryPriceResult: { symbol: '0050', currentPrice: 100 } as any,
      };

      mockValidation.isValidStockSymbol.mockReturnValue(false);
      mockValidation.isValidETFSymbol.mockReturnValue(true);
      mockETFAdapter.fetchStockData.mockResolvedValue(etfData);
      mockComprehensiveEngine.performComprehensiveAnalysis.mockResolvedValue(comprehensiveResult);
      mockFlexMessageGenerator.createAnalysisMessage.mockReturnValue({ type: 'flex' } as any);

      await (controller as any).handleHealthAnalysisRequest('reply-token', '0050');

      expect(mockETFAdapter.fetchStockData).toHaveBeenCalledWith('0050');
      expect(mockComprehensiveEngine.performComprehensiveAnalysis).toHaveBeenCalledWith(
        '0050',
        etfData,
        'NEUTRAL',
        'Index'
      );
    });

    test('應能處理無效股票代碼的體質分析請求', async () => {
      mockFlexMessageGenerator.createErrorMessage.mockReturnValue({ type: 'flex' } as any);

      await (controller as any).handleHealthAnalysisRequest('reply-token', 'INVALID');

      expect(mockFlexMessageGenerator.createErrorMessage).toHaveBeenCalledWith('無效的股票代碼: INVALID');
    });

    test('應能處理找不到股票資料的體質分析請求', async () => {
      mockValidation.isValidStockSymbol.mockReturnValue(true);
      mockValidation.isValidETFSymbol.mockReturnValue(false);
      mockStockAdapter.fetchStockData.mockResolvedValue(null);
      mockFlexMessageGenerator.createErrorMessage.mockReturnValue({ type: 'flex' } as any);

      await (controller as any).handleHealthAnalysisRequest('reply-token', '9999');

      expect(mockFlexMessageGenerator.createErrorMessage).toHaveBeenCalledWith('找不到股票資料: 9999');
    });

    test('應能處理體質分析過程中的錯誤', async () => {
      const stockData = buildMockStockData();
      mockValidation.isValidStockSymbol.mockReturnValue(true);
      mockValidation.isValidETFSymbol.mockReturnValue(false);
      mockStockAdapter.fetchStockData.mockResolvedValue(stockData);
      mockComprehensiveEngine.performComprehensiveAnalysis.mockRejectedValue(new Error('分析失敗'));
      mockFlexMessageGenerator.createErrorMessage.mockReturnValue({ type: 'flex' } as any);

      await (controller as any).handleHealthAnalysisRequest('reply-token', '2330');

      expect(mockFlexMessageGenerator.createErrorMessage).toHaveBeenCalledWith('體質分析股票 2330 時發生錯誤');
    });
  });

  describe('幫助訊息更新', () => {
    test('幫助訊息應包含體質分析說明', async () => {
      // Mock sendTextMessage 方法
      const mockSendTextMessage = jest.fn();
      (controller as any).sendTextMessage = mockSendTextMessage;
      
      await (controller as any).sendHelpMessage('reply-token');
      
      // 驗證 sendTextMessage 被調用
      expect(mockSendTextMessage).toHaveBeenCalledWith('reply-token', expect.stringContaining('體質分析'));
    });
  });

  describe('文字訊息處理', () => {
    test('應能識別並處理體質分析請求', async () => {
      const mockReplyToken = 'reply-token';
      const mockText = '2330 體質';
      
      // Mock 必要的方法
      const stockData = buildMockStockData();
      const comprehensiveResult = {
        analysisResult: { symbol: '2330', type: AnalysisType.COMPREHENSIVE } as any,
        valuationResult: { symbol: '2330' } as any,
        healthReport: { symbol: '2330', overallScore: 85 } as any,
        investmentRecommendation: { symbol: '2330', action: 'BUY' } as any,
        entryPriceResult: { symbol: '2330', currentPrice: 500 } as any,
      };

      mockValidation.isValidStockSymbol.mockReturnValue(true);
      mockValidation.isValidETFSymbol.mockReturnValue(false);
      mockStockAdapter.fetchStockData.mockResolvedValue(stockData);
      mockComprehensiveEngine.performComprehensiveAnalysis.mockResolvedValue(comprehensiveResult);
      mockFlexMessageGenerator.createAnalysisMessage.mockReturnValue({ type: 'flex' } as any);

      // 模擬文字訊息處理
      await (controller as any).handleTextMessage(mockReplyToken, mockText);

      // 驗證體質分析被調用
      expect(mockStockAdapter.fetchStockData).toHaveBeenCalledWith('2330');
      expect(mockComprehensiveEngine.performComprehensiveAnalysis).toHaveBeenCalled();
    });
  });
});

