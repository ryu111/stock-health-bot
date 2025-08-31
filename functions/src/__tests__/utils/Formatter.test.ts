import { Formatter } from '../../utils/Formatter';

describe('Formatter', () => {
  describe('formatCurrency', () => {
    it('應該正確格式化貨幣', () => {
      expect(Formatter.formatCurrency(1234.56, 'TWD')).toContain('$');
      expect(Formatter.formatCurrency(1234.56, 'USD')).toContain('$');
      expect(Formatter.formatCurrency(1234.56, 'EUR')).toContain('€');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatCurrency(NaN)).toBe('N/A');
      expect(Formatter.formatCurrency(0)).toBe('N/A');
      expect(Formatter.formatCurrency(null as any)).toBe('N/A');
    });

    it('應該處理不同地區設定', () => {
      const result = Formatter.formatCurrency(1234.56, 'TWD', 'en-US');
      expect(result).toContain('NT$');
    });
  });

  describe('formatPercentage', () => {
    it('應該正確格式化百分比', () => {
      expect(Formatter.formatPercentage(12.345)).toBe('12.35%');
      expect(Formatter.formatPercentage(5.1, 1)).toBe('5.1%');
      expect(Formatter.formatPercentage(100)).toBe('100.00%');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatPercentage(NaN)).toBe('N/A');
      expect(Formatter.formatPercentage(0)).toBe('N/A');
      expect(Formatter.formatPercentage(null as any)).toBe('N/A');
    });
  });

  describe('formatNumber', () => {
    it('應該正確格式化數字', () => {
      expect(Formatter.formatNumber(1234.56)).toBe('1,235');
      expect(Formatter.formatNumber(1234.56, 'zh-TW', 2)).toBe('1,234.56');
      expect(Formatter.formatNumber(1000000)).toBe('1,000,000');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatNumber(NaN)).toBe('N/A');
      expect(Formatter.formatNumber(0)).toBe('N/A');
      expect(Formatter.formatNumber(null as any)).toBe('N/A');
    });
  });

  describe('formatLargeNumber', () => {
    it('應該正確格式化大數字', () => {
      expect(Formatter.formatLargeNumber(1500)).toBe('1.5K');
      expect(Formatter.formatLargeNumber(1500000)).toBe('1.5M');
      expect(Formatter.formatLargeNumber(1500000000)).toBe('1.5B');
      expect(Formatter.formatLargeNumber(1500000000000)).toBe('1.5T');
    });

    it('應該處理小數字', () => {
      expect(Formatter.formatLargeNumber(500)).toBe('500.0');
      expect(Formatter.formatLargeNumber(123.456, 2)).toBe('123.46');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatLargeNumber(NaN)).toBe('N/A');
      expect(Formatter.formatLargeNumber(0)).toBe('N/A');
    });
  });

  describe('formatMarketCap', () => {
    it('應該正確格式化市值', () => {
      expect(Formatter.formatMarketCap(1500000000000)).toContain('兆');
      expect(Formatter.formatMarketCap(15000000000)).toContain('億');
      expect(Formatter.formatMarketCap(15000000)).toContain('萬');
      expect(Formatter.formatMarketCap(15000)).toBe('1.5 萬');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatMarketCap(NaN)).toBe('N/A');
      expect(Formatter.formatMarketCap(0)).toBe('N/A');
    });
  });

  describe('formatDate', () => {
    it('應該正確格式化日期', () => {
      const testDate = new Date('2024-01-15');
      
      expect(Formatter.formatDate(testDate, 'short')).toMatch(/\d{4}\/\d{2}\/\d{2}/);
      expect(Formatter.formatDate(testDate, 'long')).toContain('2024');
      expect(Formatter.formatDate(testDate, 'time')).toMatch(/\d{2}:\d{2}/);
      expect(Formatter.formatDate(testDate, 'datetime')).toMatch(/\d{4}\/\d{2}\/\d{2}/);
    });

    it('應該處理字串日期', () => {
      expect(Formatter.formatDate('2024-01-15')).toMatch(/\d{4}\/\d{2}\/\d{2}/);
    });

    it('應該處理無效日期', () => {
      expect(Formatter.formatDate('invalid')).toBe('N/A');
      expect(Formatter.formatDate(null as any)).toBe('N/A');
    });
  });

  describe('formatRelativeTime', () => {
    it('應該正確格式化相對時間', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const oneDayAgo = new Date(now.getTime() - 86400000);

      expect(Formatter.formatRelativeTime(oneMinuteAgo)).toContain('分鐘前');
      expect(Formatter.formatRelativeTime(oneHourAgo)).toContain('小時前');
      expect(Formatter.formatRelativeTime(oneDayAgo)).toContain('天前');
    });

    it('應該處理剛剛的時間', () => {
      const now = new Date();
      expect(Formatter.formatRelativeTime(now)).toBe('剛剛');
    });

    it('應該處理無效日期', () => {
      expect(Formatter.formatRelativeTime('invalid')).toBe('N/A');
      expect(Formatter.formatRelativeTime(null as any)).toBe('N/A');
    });
  });

  describe('formatStockSymbol', () => {
    it('應該正確格式化股票代碼', () => {
      expect(Formatter.formatStockSymbol('2330', 'TW')).toBe('2330');
      expect(Formatter.formatStockSymbol('30', 'TW')).toBe('0030');
      expect(Formatter.formatStockSymbol('AAPL', 'US')).toBe('AAPL');
      expect(Formatter.formatStockSymbol('700', 'HK')).toBe('0700');
    });

    it('應該處理無效代碼', () => {
      expect(Formatter.formatStockSymbol('')).toBe('N/A');
      expect(Formatter.formatStockSymbol(null as any)).toBe('N/A');
    });
  });

  describe('formatPriceChange', () => {
    it('應該正確格式化價格變動', () => {
      expect(Formatter.formatPriceChange(5.5, 2.5)).toContain('+');
      expect(Formatter.formatPriceChange(-3.2, -1.8)).toContain('-');
      expect(Formatter.formatPriceChange(0, 0)).toContain('+');
    });

    it('應該包含貨幣和百分比', () => {
      const result = Formatter.formatPriceChange(5.5, 2.5, 'TWD');
      expect(result).toContain('$');
      expect(result).toContain('%');
    });
  });

  describe('formatHealthScore', () => {
    it('應該正確格式化健康分數', () => {
      expect(Formatter.formatHealthScore(85)).toContain('🟢');
      expect(Formatter.formatHealthScore(75)).toContain('🟡');
      expect(Formatter.formatHealthScore(45)).toContain('🟠');
      expect(Formatter.formatHealthScore(25)).toContain('🔴');
    });

    it('應該處理無效分數', () => {
      expect(Formatter.formatHealthScore(NaN)).toBe('N/A');
      expect(Formatter.formatHealthScore(0)).toBe('N/A');
    });

    it('應該四捨五入分數', () => {
      expect(Formatter.formatHealthScore(84.6)).toContain('85');
      expect(Formatter.formatHealthScore(74.4)).toContain('74');
    });
  });

  describe('formatVolume', () => {
    it('應該正確格式化成交量', () => {
      expect(Formatter.formatVolume(1500000000)).toContain('B 股');
      expect(Formatter.formatVolume(1500000)).toContain('M 股');
      expect(Formatter.formatVolume(1500)).toContain('K 股');
      expect(Formatter.formatVolume(500)).toContain('500 股');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatVolume(NaN)).toBe('N/A');
      expect(Formatter.formatVolume(0)).toBe('N/A');
    });
  });

  describe('formatPERatio', () => {
    it('應該正確格式化 PE 比率', () => {
      expect(Formatter.formatPERatio(150)).toContain('(高)');
      expect(Formatter.formatPERatio(75)).toContain('(偏高)');
      expect(Formatter.formatPERatio(25)).toContain('(正常)');
      expect(Formatter.formatPERatio(15)).toContain('(偏低)');
      expect(Formatter.formatPERatio(5)).toContain('(低)');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatPERatio(NaN)).toBe('N/A');
      expect(Formatter.formatPERatio(0)).toBe('N/A');
      expect(Formatter.formatPERatio(-5)).toBe('N/A');
    });
  });

  describe('formatDividendYield', () => {
    it('應該正確格式化股息殖利率', () => {
      expect(Formatter.formatDividendYield(0.1)).toContain('(高)');
      expect(Formatter.formatDividendYield(0.06)).toContain('(良好)');
      expect(Formatter.formatDividendYield(0.04)).toContain('(一般)');
      expect(Formatter.formatDividendYield(0.02)).toContain('(低)');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatDividendYield(NaN)).toBe('N/A');
      expect(Formatter.formatDividendYield(0)).toBe('N/A');
    });
  });

  describe('formatExpenseRatio', () => {
    it('應該正確格式化費用率', () => {
      expect(Formatter.formatExpenseRatio(0.002)).toContain('(低)');
      expect(Formatter.formatExpenseRatio(0.004)).toContain('(正常)');
      expect(Formatter.formatExpenseRatio(0.008)).toContain('(高)');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatExpenseRatio(NaN)).toBe('N/A');
      expect(Formatter.formatExpenseRatio(0)).toBe('N/A');
    });
  });

  describe('formatFileSize', () => {
    it('應該正確格式化檔案大小', () => {
      expect(Formatter.formatFileSize(1024)).toBe('1.0 KB');
      expect(Formatter.formatFileSize(1048576)).toBe('1.0 MB');
      expect(Formatter.formatFileSize(1073741824)).toBe('1.0 GB');
      expect(Formatter.formatFileSize(500)).toBe('500 B');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatFileSize(NaN)).toBe('N/A');
      expect(Formatter.formatFileSize(0)).toBe('N/A');
    });
  });

  describe('formatExecutionTime', () => {
    it('應該正確格式化執行時間', () => {
      expect(Formatter.formatExecutionTime(500)).toBe('500ms');
      expect(Formatter.formatExecutionTime(1500)).toBe('1.5s');
      expect(Formatter.formatExecutionTime(65000)).toBe('1m 5s');
    });

    it('應該處理無效數值', () => {
      expect(Formatter.formatExecutionTime(NaN)).toBe('N/A');
      expect(Formatter.formatExecutionTime(0)).toBe('N/A');
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理極端數值', () => {
      expect(Formatter.formatLargeNumber(Number.MAX_SAFE_INTEGER)).toContain('T');
      expect(Formatter.formatMarketCap(Number.MAX_SAFE_INTEGER)).toContain('兆');
      expect(Formatter.formatFileSize(1000000000000)).toContain('GB');
    });

    it('應該處理負數', () => {
      expect(Formatter.formatCurrency(-1234.56)).toContain('-');
      expect(Formatter.formatPercentage(-5.5)).toContain('-');
      expect(Formatter.formatNumber(-1000)).toContain('-');
    });

    it('應該處理零值', () => {
      expect(Formatter.formatCurrency(0)).toBe('N/A');
      expect(Formatter.formatPercentage(0)).toBe('N/A');
      expect(Formatter.formatNumber(0)).toBe('N/A');
    });
  });
});
