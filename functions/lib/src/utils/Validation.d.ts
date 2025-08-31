export declare class Validation {
    /**
     * 驗證股票代碼格式
     * @param symbol - 股票代碼
     * @returns 是否有效
     */
    static isValidStockSymbol(symbol: string): boolean;
    /**
     * 驗證 ETF 代碼格式
     * @param symbol - ETF 代碼
     * @returns 是否有效
     */
    static isValidETFSymbol(symbol: string): boolean;
    /**
     * 驗證價格是否有效
     * @param price - 價格
     * @returns 是否有效
     */
    static isValidPrice(price: number): boolean;
    /**
     * 驗證百分比是否有效
     * @param percentage - 百分比
     * @returns 是否有效
     */
    static isValidPercentage(percentage: number): boolean;
    /**
     * 驗證健康分數是否有效
     * @param score - 健康分數
     * @returns 是否有效
     */
    static isValidHealthScore(score: number): boolean;
    /**
     * 驗證電子郵件格式
     * @param email - 電子郵件
     * @returns 是否有效
     */
    static isValidEmail(email: string): boolean;
    /**
     * 驗證 URL 格式
     * @param url - URL
     * @returns 是否有效
     */
    static isValidURL(url: string): boolean;
    /**
     * 驗證日期格式
     * @param date - 日期字串或物件
     * @returns 是否有效
     */
    static isValidDate(date: string | Date): boolean;
    /**
     * 驗證語言代碼
     * @param languageCode - 語言代碼
     * @returns 是否有效
     */
    static isValidLanguageCode(languageCode: string): boolean;
    /**
     * 驗證市場類型
     * @param marketType - 市場類型
     * @returns 是否有效
     */
    static isValidMarketType(marketType: string): boolean;
    /**
     * 驗證分析類型
     * @param analysisType - 分析類型
     * @returns 是否有效
     */
    static isValidAnalysisType(analysisType: string): boolean;
    /**
     * 驗證使用者 ID 格式
     * @param userId - 使用者 ID
     * @returns 是否有效
     */
    static isValidUserId(userId: string): boolean;
    /**
     * 驗證字串長度
     * @param str - 字串
     * @param minLength - 最小長度
     * @param maxLength - 最大長度
     * @returns 是否有效
     */
    static isValidStringLength(str: string, minLength?: number, maxLength?: number): boolean;
    /**
     * 驗證數字範圍
     * @param num - 數字
     * @param min - 最小值
     * @param max - 最大值
     * @returns 是否有效
     */
    static isValidNumberRange(num: number, min: number, max: number): boolean;
    /**
     * 驗證陣列長度
     * @param arr - 陣列
     * @param minLength - 最小長度
     * @param maxLength - 最大長度
     * @returns 是否有效
     */
    static isValidArrayLength(arr: unknown[], minLength?: number, maxLength?: number): boolean;
    /**
     * 驗證物件是否包含必要屬性
     * @param obj - 物件
     * @param requiredProps - 必要屬性陣列
     * @returns 是否有效
     */
    static hasRequiredProperties(obj: unknown, requiredProps: string[]): boolean;
    /**
     * 清理和驗證股票代碼
     * @param symbol - 原始股票代碼
     * @returns 清理後的股票代碼或 null
     */
    static cleanStockSymbol(symbol: string): string | null;
    /**
     * 清理和驗證 ETF 代碼
     * @param symbol - 原始 ETF 代碼
     * @returns 清理後的 ETF 代碼或 null
     */
    static cleanETFSymbol(symbol: string): string | null;
    /**
     * 驗證批量分析請求
     * @param request - 批量分析請求
     * @returns 是否有效
     */
    static isValidBatchAnalysisRequest(request: unknown): boolean;
}
//# sourceMappingURL=Validation.d.ts.map