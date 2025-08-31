// 格式化工具類別
export class Formatter {
  /**
   * 格式化貨幣
   * @param amount - 金額
   * @param currency - 貨幣代碼
   * @param locale - 地區設定
   * @returns 格式化的貨幣字串
   */
  static formatCurrency(
    amount: number,
    currency: string = 'TWD',
    locale: string = 'zh-TW'
  ): string {
    if (!amount || isNaN(amount)) {
      return 'N/A';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currency}`;
    }
  }

  /**
   * 格式化百分比
   * @param value - 數值
   * @param decimals - 小數位數
   * @returns 格式化的百分比字串
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    if (!value || isNaN(value)) {
      return 'N/A';
    }

    return `${value.toFixed(decimals)}%`;
  }

  /**
   * 格式化數字
   * @param num - 數字
   * @param locale - 地區設定
   * @param decimals - 小數位數
   * @returns 格式化的數字字串
   */
  static formatNumber(num: number, locale: string = 'zh-TW', decimals: number = 0): string {
    if (!num || isNaN(num)) {
      return 'N/A';
    }

    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    } catch {
      return num.toFixed(decimals);
    }
  }

  /**
   * 格式化大數字 (K, M, B)
   * @param num - 數字
   * @param decimals - 小數位數
   * @returns 格式化的數字字串
   */
  static formatLargeNumber(num: number, decimals: number = 1): string {
    if (!num || isNaN(num)) {
      return 'N/A';
    }

    if (num >= 1e12) {
      return `${(num / 1e12).toFixed(decimals)}T`;
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(decimals)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(decimals)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(decimals)}K`;
    } else {
      return num.toFixed(decimals);
    }
  }

  /**
   * 格式化市值
   * @param marketCap - 市值
   * @param locale - 地區設定
   * @returns 格式化的市值字串
   */
  static formatMarketCap(marketCap: number, locale: string = 'zh-TW'): string {
    if (!marketCap || isNaN(marketCap)) {
      return 'N/A';
    }

    if (marketCap >= 1e12) {
      return `${this.formatNumber(marketCap / 1e12, locale, 1)} 兆`;
    } else if (marketCap >= 1e8) {
      return `${this.formatNumber(marketCap / 1e8, locale, 1)} 億`;
    } else if (marketCap >= 1e4) {
      return `${this.formatNumber(marketCap / 1e4, locale, 1)} 萬`;
    } else {
      return this.formatNumber(marketCap, locale);
    }
  }

  /**
   * 格式化日期
   * @param date - 日期
   * @param format - 格式 ('short', 'long', 'time', 'datetime')
   * @param locale - 地區設定
   * @returns 格式化的日期字串
   */
  static formatDate(
    date: Date | string,
    format: string = 'short',
    locale: string = 'zh-TW'
  ): string {
    if (!date) {
      return 'N/A';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }

    try {
      switch (format) {
        case 'long':
          return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(dateObj);

        case 'time':
          return new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit',
          }).format(dateObj);

        case 'datetime':
          return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(dateObj);

        default: // short
          return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(dateObj);
      }
    } catch {
      return dateObj.toLocaleDateString();
    }
  }

  /**
   * 格式化相對時間
   * @param date - 日期
   * @param locale - 地區設定
   * @returns 相對時間字串
   */
  static formatRelativeTime(date: Date | string, locale: string = 'zh-TW'): string {
    if (!date) {
      return 'N/A';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return '剛剛';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} 分鐘前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小時前`;
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return this.formatDate(dateObj, 'short', locale);
    }
  }

  /**
   * 格式化股票代碼
   * @param symbol - 股票代碼
   * @param market - 市場類型
   * @returns 格式化的股票代碼
   */
  static formatStockSymbol(symbol: string, market: string = 'TW'): string {
    if (!symbol) {
      return 'N/A';
    }

    const cleanSymbol = symbol.trim().toUpperCase();

    switch (market.toUpperCase()) {
      case 'TW':
        return cleanSymbol.padStart(4, '0');
      case 'US':
        return cleanSymbol;
      case 'HK':
        return cleanSymbol.padStart(4, '0');
      default:
        return cleanSymbol;
    }
  }

  /**
   * 格式化價格變動
   * @param change - 變動金額
   * @param changePercent - 變動百分比
   * @param currency - 貨幣代碼
   * @returns 格式化的價格變動字串
   */
  static formatPriceChange(
    change: number,
    changePercent: number,
    currency: string = 'TWD'
  ): string {
    const changeStr = this.formatCurrency(Math.abs(change), currency);
    const percentStr = this.formatPercentage(Math.abs(changePercent));
    const direction = change >= 0 ? '+' : '-';

    return `${direction}${changeStr} (${direction}${percentStr})`;
  }

  /**
   * 格式化健康分數
   * @param score - 健康分數
   * @returns 格式化的健康分數字串
   */
  static formatHealthScore(score: number): string {
    if (!score || isNaN(score)) {
      return 'N/A';
    }

    const roundedScore = Math.round(score);

    if (roundedScore >= 80) {
      return `🟢 ${roundedScore}/100 (優秀)`;
    } else if (roundedScore >= 60) {
      return `🟡 ${roundedScore}/100 (良好)`;
    } else if (roundedScore >= 40) {
      return `🟠 ${roundedScore}/100 (一般)`;
    } else {
      return `🔴 ${roundedScore}/100 (需要關注)`;
    }
  }

  /**
   * 格式化成交量
   * @param volume - 成交量
   * @param locale - 地區設定
   * @returns 格式化的成交量字串
   */
  static formatVolume(volume: number, locale: string = 'zh-TW'): string {
    if (!volume || isNaN(volume)) {
      return 'N/A';
    }

    if (volume >= 1e9) {
      return `${this.formatNumber(volume / 1e9, locale, 1)}B 股`;
    } else if (volume >= 1e6) {
      return `${this.formatNumber(volume / 1e6, locale, 1)}M 股`;
    } else if (volume >= 1e3) {
      return `${this.formatNumber(volume / 1e3, locale, 1)}K 股`;
    } else {
      return `${this.formatNumber(volume, locale)} 股`;
    }
  }

  /**
   * 格式化 PE 比率
   * @param pe - PE 比率
   * @returns 格式化的 PE 比率字串
   */
  static formatPERatio(pe: number): string {
    if (!pe || isNaN(pe) || pe <= 0) {
      return 'N/A';
    }

    if (pe > 100) {
      return `${pe.toFixed(0)} (高)`;
    } else if (pe > 50) {
      return `${pe.toFixed(1)} (偏高)`;
    } else if (pe > 20) {
      return `${pe.toFixed(1)} (正常)`;
    } else if (pe > 10) {
      return `${pe.toFixed(1)} (偏低)`;
    } else {
      return `${pe.toFixed(1)} (低)`;
    }
  }

  /**
   * 格式化股息殖利率
   * @param dividendYield - 股息殖利率
   * @returns 格式化的股息殖利率字串
   */
  static formatDividendYield(dividendYield: number): string {
    if (!dividendYield || isNaN(dividendYield)) {
      return 'N/A';
    }

    const yieldPercent = dividendYield * 100;

    if (yieldPercent >= 8) {
      return `${yieldPercent.toFixed(2)}% (高)`;
    } else if (yieldPercent >= 5) {
      return `${yieldPercent.toFixed(2)}% (良好)`;
    } else if (yieldPercent >= 3) {
      return `${yieldPercent.toFixed(2)}% (一般)`;
    } else {
      return `${yieldPercent.toFixed(2)}% (低)`;
    }
  }

  /**
   * 格式化費用率
   * @param expenseRatio - 費用率
   * @returns 格式化的費用率字串
   */
  static formatExpenseRatio(expenseRatio: number): string {
    if (!expenseRatio || isNaN(expenseRatio)) {
      return 'N/A';
    }

    const ratioPercent = expenseRatio * 100;

    if (ratioPercent <= 0.3) {
      return `${ratioPercent.toFixed(2)}% (低)`;
    } else if (ratioPercent <= 0.5) {
      return `${ratioPercent.toFixed(2)}% (正常)`;
    } else {
      return `${ratioPercent.toFixed(2)}% (高)`;
    }
  }

  /**
   * 格式化檔案大小
   * @param bytes - 位元組數
   * @returns 格式化的檔案大小字串
   */
  static formatFileSize(bytes: number): string {
    if (!bytes || isNaN(bytes)) {
      return 'N/A';
    }

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    if (i === 0) {
      return `${bytes} ${sizes[i]}`;
    }

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * 格式化執行時間
   * @param milliseconds - 毫秒數
   * @returns 格式化的執行時間字串
   */
  static formatExecutionTime(milliseconds: number): string {
    if (!milliseconds || isNaN(milliseconds)) {
      return 'N/A';
    }

    if (milliseconds < 1000) {
      return `${milliseconds.toFixed(0)}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }
}
