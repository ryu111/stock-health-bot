export declare class Formatter {
    /**
     * 格式化貨幣
     * @param amount - 金額
     * @param currency - 貨幣代碼
     * @param locale - 地區設定
     * @returns 格式化的貨幣字串
     */
    static formatCurrency(amount: number, currency?: string, locale?: string): string;
    /**
     * 格式化百分比
     * @param value - 數值
     * @param decimals - 小數位數
     * @returns 格式化的百分比字串
     */
    static formatPercentage(value: number, decimals?: number): string;
    /**
     * 格式化數字
     * @param num - 數字
     * @param locale - 地區設定
     * @param decimals - 小數位數
     * @returns 格式化的數字字串
     */
    static formatNumber(num: number, locale?: string, decimals?: number): string;
    /**
     * 格式化大數字 (K, M, B)
     * @param num - 數字
     * @param decimals - 小數位數
     * @returns 格式化的數字字串
     */
    static formatLargeNumber(num: number, decimals?: number): string;
    /**
     * 格式化市值
     * @param marketCap - 市值
     * @param locale - 地區設定
     * @returns 格式化的市值字串
     */
    static formatMarketCap(marketCap: number, locale?: string): string;
    /**
     * 格式化日期
     * @param date - 日期
     * @param format - 格式 ('short', 'long', 'time', 'datetime')
     * @param locale - 地區設定
     * @returns 格式化的日期字串
     */
    static formatDate(date: Date | string, format?: string, locale?: string): string;
    /**
     * 格式化相對時間
     * @param date - 日期
     * @param locale - 地區設定
     * @returns 相對時間字串
     */
    static formatRelativeTime(date: Date | string, locale?: string): string;
    /**
     * 格式化股票代碼
     * @param symbol - 股票代碼
     * @param market - 市場類型
     * @returns 格式化的股票代碼
     */
    static formatStockSymbol(symbol: string, market?: string): string;
    /**
     * 格式化價格變動
     * @param change - 變動金額
     * @param changePercent - 變動百分比
     * @param currency - 貨幣代碼
     * @returns 格式化的價格變動字串
     */
    static formatPriceChange(change: number, changePercent: number, currency?: string): string;
    /**
     * 格式化健康分數
     * @param score - 健康分數
     * @returns 格式化的健康分數字串
     */
    static formatHealthScore(score: number): string;
    /**
     * 格式化成交量
     * @param volume - 成交量
     * @param locale - 地區設定
     * @returns 格式化的成交量字串
     */
    static formatVolume(volume: number, locale?: string): string;
    /**
     * 格式化 PE 比率
     * @param pe - PE 比率
     * @returns 格式化的 PE 比率字串
     */
    static formatPERatio(pe: number): string;
    /**
     * 格式化股息殖利率
     * @param dividendYield - 股息殖利率
     * @returns 格式化的股息殖利率字串
     */
    static formatDividendYield(dividendYield: number): string;
    /**
     * 格式化費用率
     * @param expenseRatio - 費用率
     * @returns 格式化的費用率字串
     */
    static formatExpenseRatio(expenseRatio: number): string;
    /**
     * 格式化檔案大小
     * @param bytes - 位元組數
     * @returns 格式化的檔案大小字串
     */
    static formatFileSize(bytes: number): string;
    /**
     * 格式化執行時間
     * @param milliseconds - 毫秒數
     * @returns 格式化的執行時間字串
     */
    static formatExecutionTime(milliseconds: number): string;
}
//# sourceMappingURL=Formatter.d.ts.map