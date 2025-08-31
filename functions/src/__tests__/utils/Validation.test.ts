import { Validation } from '../../utils/Validation';

describe('Validation', () => {
  describe('isValidStockSymbol', () => {
    it('應該驗證台股代碼', () => {
      expect(Validation.isValidStockSymbol('2330')).toBe(true);
      expect(Validation.isValidStockSymbol('2317')).toBe(true);
      expect(Validation.isValidStockSymbol('123456')).toBe(true);
    });

    it('應該驗證美股代碼', () => {
      expect(Validation.isValidStockSymbol('AAPL')).toBe(true);
      expect(Validation.isValidStockSymbol('GOOGL')).toBe(true);
      expect(Validation.isValidStockSymbol('TSLA')).toBe(true);
    });

    it('應該驗證港股代碼', () => {
      expect(Validation.isValidStockSymbol('0700')).toBe(true);
      expect(Validation.isValidStockSymbol('9988')).toBe(true);
      expect(Validation.isValidStockSymbol('12345')).toBe(true);
    });

    it('應該拒絕無效代碼', () => {
      expect(Validation.isValidStockSymbol('')).toBe(false);
      expect(Validation.isValidStockSymbol('123')).toBe(false);
      expect(Validation.isValidStockSymbol('1234567')).toBe(false);
      expect(Validation.isValidStockSymbol('ABC123')).toBe(false);
      expect(Validation.isValidStockSymbol(null as any)).toBe(false);
      expect(Validation.isValidStockSymbol(undefined as any)).toBe(false);
    });
  });

  describe('isValidETFSymbol', () => {
    it('應該驗證台股 ETF 代碼', () => {
      expect(Validation.isValidETFSymbol('0050')).toBe(true);
      expect(Validation.isValidETFSymbol('0056')).toBe(true);
      expect(Validation.isValidETFSymbol('00878')).toBe(true);
    });

    it('應該驗證美股 ETF 代碼', () => {
      expect(Validation.isValidETFSymbol('SPY')).toBe(true);
      expect(Validation.isValidETFSymbol('QQQ')).toBe(true);
      expect(Validation.isValidETFSymbol('VTI')).toBe(true);
    });

    it('應該拒絕無效代碼', () => {
      expect(Validation.isValidETFSymbol('')).toBe(false);
      expect(Validation.isValidETFSymbol('123')).toBe(false);
      expect(Validation.isValidETFSymbol('ABC123')).toBe(false);
      expect(Validation.isValidETFSymbol(null as any)).toBe(false);
    });
  });

  describe('isValidPrice', () => {
    it('應該驗證有效價格', () => {
      expect(Validation.isValidPrice(100)).toBe(true);
      expect(Validation.isValidPrice(0)).toBe(true);
      expect(Validation.isValidPrice(1234.56)).toBe(true);
    });

    it('應該拒絕無效價格', () => {
      expect(Validation.isValidPrice(-100)).toBe(false);
      expect(Validation.isValidPrice(NaN)).toBe(false);
      expect(Validation.isValidPrice(Infinity)).toBe(false);
      expect(Validation.isValidPrice(-Infinity)).toBe(false);
      expect(Validation.isValidPrice('100' as any)).toBe(false);
    });
  });

  describe('isValidPercentage', () => {
    it('應該驗證有效百分比', () => {
      expect(Validation.isValidPercentage(50)).toBe(true);
      expect(Validation.isValidPercentage(-10)).toBe(true);
      expect(Validation.isValidPercentage(0)).toBe(true);
      expect(Validation.isValidPercentage(1000)).toBe(true);
    });

    it('應該拒絕無效百分比', () => {
      expect(Validation.isValidPercentage(-101)).toBe(false);
      expect(Validation.isValidPercentage(1001)).toBe(false);
      expect(Validation.isValidPercentage(NaN)).toBe(false);
      expect(Validation.isValidPercentage(Infinity)).toBe(false);
    });
  });

  describe('isValidHealthScore', () => {
    it('應該驗證有效健康分數', () => {
      expect(Validation.isValidHealthScore(85)).toBe(true);
      expect(Validation.isValidHealthScore(0)).toBe(true);
      expect(Validation.isValidHealthScore(100)).toBe(true);
      expect(Validation.isValidHealthScore(50.5)).toBe(true);
    });

    it('應該拒絕無效健康分數', () => {
      expect(Validation.isValidHealthScore(-1)).toBe(false);
      expect(Validation.isValidHealthScore(101)).toBe(false);
      expect(Validation.isValidHealthScore(NaN)).toBe(false);
      expect(Validation.isValidHealthScore(Infinity)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('應該驗證有效電子郵件', () => {
      expect(Validation.isValidEmail('test@example.com')).toBe(true);
      expect(Validation.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(Validation.isValidEmail('test123@test.org')).toBe(true);
    });

    it('應該拒絕無效電子郵件', () => {
      expect(Validation.isValidEmail('')).toBe(false);
      expect(Validation.isValidEmail('invalid-email')).toBe(false);
      expect(Validation.isValidEmail('test@')).toBe(false);
      expect(Validation.isValidEmail('@example.com')).toBe(false);
      expect(Validation.isValidEmail(null as any)).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('應該驗證有效 URL', () => {
      expect(Validation.isValidURL('https://www.example.com')).toBe(true);
      expect(Validation.isValidURL('http://example.com')).toBe(true);
      expect(Validation.isValidURL('https://api.example.com/v1')).toBe(true);
    });

    it('應該拒絕無效 URL', () => {
      expect(Validation.isValidURL('')).toBe(false);
      expect(Validation.isValidURL('not-a-url')).toBe(false);
      expect(Validation.isValidURL('://example.com')).toBe(false);
      expect(Validation.isValidURL(null as any)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('應該驗證有效日期', () => {
      expect(Validation.isValidDate('2024-01-15')).toBe(true);
      expect(Validation.isValidDate('2024/01/15')).toBe(true);
      expect(Validation.isValidDate(new Date())).toBe(true);
    });

    it('應該拒絕無效日期', () => {
      expect(Validation.isValidDate('')).toBe(false);
      expect(Validation.isValidDate('invalid-date')).toBe(false);
      expect(Validation.isValidDate('2024-13-45')).toBe(false);
      expect(Validation.isValidDate(null as any)).toBe(false);
    });
  });

  describe('isValidLanguageCode', () => {
    it('應該驗證支援的語言代碼', () => {
      expect(Validation.isValidLanguageCode('zh_TW')).toBe(true);
      expect(Validation.isValidLanguageCode('en_US')).toBe(true);
      expect(Validation.isValidLanguageCode('ja_JP')).toBe(true);
      expect(Validation.isValidLanguageCode('ko_KR')).toBe(true);
    });

    it('應該拒絕不支援的語言代碼', () => {
      expect(Validation.isValidLanguageCode('')).toBe(false);
      expect(Validation.isValidLanguageCode('zh_CN')).toBe(false);
      expect(Validation.isValidLanguageCode('en_GB')).toBe(false);
      expect(Validation.isValidLanguageCode(null as any)).toBe(false);
    });
  });

  describe('isValidMarketType', () => {
    it('應該驗證有效市場類型', () => {
      expect(Validation.isValidMarketType('TW_STOCK')).toBe(true);
      expect(Validation.isValidMarketType('US_STOCK')).toBe(true);
      expect(Validation.isValidMarketType('HK_STOCK')).toBe(true);
      expect(Validation.isValidMarketType('ETF')).toBe(true);
    });

    it('應該拒絕無效市場類型', () => {
      expect(Validation.isValidMarketType('')).toBe(false);
      expect(Validation.isValidMarketType('CN_STOCK')).toBe(false);
      expect(Validation.isValidMarketType('STOCK')).toBe(false);
      expect(Validation.isValidMarketType(null as any)).toBe(false);
    });
  });

  describe('isValidAnalysisType', () => {
    it('應該驗證有效分析類型', () => {
      expect(Validation.isValidAnalysisType('technical')).toBe(true);
      expect(Validation.isValidAnalysisType('fundamental')).toBe(true);
      expect(Validation.isValidAnalysisType('risk')).toBe(true);
      expect(Validation.isValidAnalysisType('sentiment')).toBe(true);
      expect(Validation.isValidAnalysisType('comprehensive')).toBe(true);
    });

    it('應該拒絕無效分析類型', () => {
      expect(Validation.isValidAnalysisType('')).toBe(false);
      expect(Validation.isValidAnalysisType('basic')).toBe(false);
      expect(Validation.isValidAnalysisType('advanced')).toBe(false);
      expect(Validation.isValidAnalysisType(null as any)).toBe(false);
    });
  });

  describe('isValidUserId', () => {
    it('應該驗證有效 LINE 使用者 ID', () => {
      expect(Validation.isValidUserId('U1234567890abcdef1234567890abcdef')).toBe(true);
      expect(Validation.isValidUserId('Uabcdef1234567890abcdef1234567890')).toBe(true);
    });

    it('應該拒絕無效使用者 ID', () => {
      expect(Validation.isValidUserId('')).toBe(false);
      expect(Validation.isValidUserId('1234567890abcdef1234567890abcdef')).toBe(false);
      expect(Validation.isValidUserId('U1234567890abcdef1234567890abcde')).toBe(false);
      expect(Validation.isValidUserId('U1234567890abcdef1234567890abcdef1')).toBe(false);
      expect(Validation.isValidUserId('u1234567890abcdef1234567890abcdef')).toBe(false);
      expect(Validation.isValidUserId(null as any)).toBe(false);
    });
  });

  describe('isValidStringLength', () => {
    it('應該驗證有效字串長度', () => {
      expect(Validation.isValidStringLength('test', 1, 10)).toBe(true);
      expect(Validation.isValidStringLength('hello world', 5, 20)).toBe(true);
      expect(Validation.isValidStringLength('a', 1, 1)).toBe(true);
    });

    it('應該拒絕無效字串長度', () => {
      expect(Validation.isValidStringLength('', 1, 10)).toBe(false);
      expect(Validation.isValidStringLength('too long string', 1, 5)).toBe(false);
      expect(Validation.isValidStringLength('short', 10, 20)).toBe(false);
      expect(Validation.isValidStringLength(123 as any, 1, 10)).toBe(false);
    });
  });

  describe('isValidNumberRange', () => {
    it('應該驗證有效數字範圍', () => {
      expect(Validation.isValidNumberRange(5, 1, 10)).toBe(true);
      expect(Validation.isValidNumberRange(0, 0, 100)).toBe(true);
      expect(Validation.isValidNumberRange(100, 0, 100)).toBe(true);
    });

    it('應該拒絕無效數字範圍', () => {
      expect(Validation.isValidNumberRange(-1, 0, 10)).toBe(false);
      expect(Validation.isValidNumberRange(11, 0, 10)).toBe(false);
      expect(Validation.isValidNumberRange(NaN, 0, 10)).toBe(false);
      expect(Validation.isValidNumberRange(Infinity, 0, 10)).toBe(false);
      expect(Validation.isValidNumberRange('5' as any, 0, 10)).toBe(false);
    });
  });

  describe('isValidArrayLength', () => {
    it('應該驗證有效陣列長度', () => {
      expect(Validation.isValidArrayLength([1, 2, 3], 1, 10)).toBe(true);
      expect(Validation.isValidArrayLength([], 0, 10)).toBe(true);
      expect(Validation.isValidArrayLength(['a', 'b'], 2, 5)).toBe(true);
    });

    it('應該拒絕無效陣列長度', () => {
      expect(Validation.isValidArrayLength([1, 2, 3], 5, 10)).toBe(false);
      expect(Validation.isValidArrayLength([1, 2, 3, 4, 5], 1, 3)).toBe(false);
      expect(Validation.isValidArrayLength('not array' as any, 1, 10)).toBe(false);
    });
  });

  describe('hasRequiredProperties', () => {
    it('應該驗證物件包含必要屬性', () => {
      const obj = { name: 'test', age: 25, email: 'test@example.com' };
      expect(Validation.hasRequiredProperties(obj, ['name', 'age'])).toBe(true);
      expect(Validation.hasRequiredProperties(obj, ['name', 'age', 'email'])).toBe(true);
    });

    it('應該拒絕缺少必要屬性的物件', () => {
      const obj = { name: 'test', age: 25 };
      expect(Validation.hasRequiredProperties(obj, ['name', 'age', 'email'])).toBe(false);
      expect(Validation.hasRequiredProperties(obj, ['id'])).toBe(false);
    });

    it('應該拒絕無效物件', () => {
      expect(Validation.hasRequiredProperties(null, ['name'])).toBe(false);
      expect(Validation.hasRequiredProperties('string' as any, ['name'])).toBe(false);
      expect(Validation.hasRequiredProperties(123 as any, ['name'])).toBe(false);
    });
  });

  describe('cleanStockSymbol', () => {
    it('應該清理和驗證股票代碼', () => {
      expect(Validation.cleanStockSymbol(' 2330 ')).toBe('2330');
      expect(Validation.cleanStockSymbol('AAPL')).toBe('AAPL');
      expect(Validation.cleanStockSymbol('0700')).toBe('0700');
    });

    it('應該處理無效輸入', () => {
      expect(Validation.cleanStockSymbol('')).toBe(null);
      expect(Validation.cleanStockSymbol('invalid')).toBe(null);
      expect(Validation.cleanStockSymbol('123')).toBe(null);
      expect(Validation.cleanStockSymbol(null as any)).toBe(null);
    });
  });

  describe('cleanETFSymbol', () => {
    it('應該清理和驗證 ETF 代碼', () => {
      expect(Validation.cleanETFSymbol(' 0050 ')).toBe('0050');
      expect(Validation.cleanETFSymbol('SPY')).toBe('SPY');
      expect(Validation.cleanETFSymbol('00878')).toBe('00878');
    });

    it('應該處理無效輸入', () => {
      expect(Validation.cleanETFSymbol('')).toBe(null);
      expect(Validation.cleanETFSymbol('invalid')).toBe(null);
      expect(Validation.cleanETFSymbol('123')).toBe(null);
      expect(Validation.cleanETFSymbol(null as any)).toBe(null);
    });
  });

  describe('isValidBatchAnalysisRequest', () => {
    it('應該驗證有效批量分析請求', () => {
      const validRequest = {
        symbols: ['2330', '2317', 'AAPL'],
        marketType: 'TW_STOCK',
        analysisType: 'comprehensive'
      };
      expect(Validation.isValidBatchAnalysisRequest(validRequest)).toBe(true);
    });

    it('應該拒絕無效批量分析請求', () => {
      expect(Validation.isValidBatchAnalysisRequest(null)).toBe(false);
      expect(Validation.isValidBatchAnalysisRequest({})).toBe(false);
      expect(Validation.isValidBatchAnalysisRequest({ symbols: [] })).toBe(false);
      expect(Validation.isValidBatchAnalysisRequest({ symbols: ['invalid'] })).toBe(false);
      expect(Validation.isValidBatchAnalysisRequest({ symbols: Array(11).fill('2330') })).toBe(false);
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理極端數值', () => {
      expect(Validation.isValidPrice(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(Validation.isValidPrice(Number.MIN_SAFE_INTEGER)).toBe(false);
      expect(Validation.isValidPercentage(1000)).toBe(true);
      expect(Validation.isValidPercentage(1001)).toBe(false);
    });

    it('應該處理特殊字元', () => {
      expect(Validation.isValidStockSymbol('2330.TW')).toBe(false);
      expect(Validation.isValidStockSymbol('AAPL-')).toBe(false);
      expect(Validation.cleanStockSymbol('2330.TW')).toBe(null);
    });

    it('應該處理空值和未定義', () => {
      expect(Validation.isValidStockSymbol('')).toBe(false);
      expect(Validation.isValidStockSymbol(null as any)).toBe(false);
      expect(Validation.isValidStockSymbol(undefined as any)).toBe(false);
      expect(Validation.isValidEmail('')).toBe(false);
      expect(Validation.isValidEmail(null as any)).toBe(false);
    });
  });
});
