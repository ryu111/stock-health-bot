"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
// 驗證工具類別
class Validation {
    /**
     * 驗證股票代碼格式
     * @param symbol - 股票代碼
     * @returns 是否有效
     */
    static isValidStockSymbol(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            return false;
        }
        // 台股代碼：4-6 位數字
        const twStockPattern = /^\d{4,6}$/;
        // 美股代碼：1-5 位字母
        const usStockPattern = /^[A-Z]{1,5}$/;
        // 港股代碼：4-5 位數字
        const hkStockPattern = /^\d{4,5}$/;
        return (twStockPattern.test(symbol) || usStockPattern.test(symbol) || hkStockPattern.test(symbol));
    }
    /**
     * 驗證 ETF 代碼格式
     * @param symbol - ETF 代碼
     * @returns 是否有效
     */
    static isValidETFSymbol(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            return false;
        }
        // 台股 ETF：4-6 位數字
        const twETFPattern = /^\d{4,6}$/;
        // 美股 ETF：通常以字母開頭
        const usETFPattern = /^[A-Z]{1,5}$/;
        return twETFPattern.test(symbol) || usETFPattern.test(symbol);
    }
    /**
     * 驗證價格是否有效
     * @param price - 價格
     * @returns 是否有效
     */
    static isValidPrice(price) {
        return typeof price === 'number' && !isNaN(price) && isFinite(price) && price >= 0;
    }
    /**
     * 驗證百分比是否有效
     * @param percentage - 百分比
     * @returns 是否有效
     */
    static isValidPercentage(percentage) {
        return (typeof percentage === 'number' &&
            !isNaN(percentage) &&
            isFinite(percentage) &&
            percentage >= -100 &&
            percentage <= 1000); // 允許極端情況
    }
    /**
     * 驗證健康分數是否有效
     * @param score - 健康分數
     * @returns 是否有效
     */
    static isValidHealthScore(score) {
        return (typeof score === 'number' && !isNaN(score) && isFinite(score) && score >= 0 && score <= 100);
    }
    /**
     * 驗證電子郵件格式
     * @param email - 電子郵件
     * @returns 是否有效
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }
    /**
     * 驗證 URL 格式
     * @param url - URL
     * @returns 是否有效
     */
    static isValidURL(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 驗證日期格式
     * @param date - 日期字串或物件
     * @returns 是否有效
     */
    static isValidDate(date) {
        if (!date) {
            return false;
        }
        try {
            const dateObj = new Date(date);
            return !isNaN(dateObj.getTime());
        }
        catch {
            return false;
        }
    }
    /**
     * 驗證語言代碼
     * @param languageCode - 語言代碼
     * @returns 是否有效
     */
    static isValidLanguageCode(languageCode) {
        if (!languageCode || typeof languageCode !== 'string') {
            return false;
        }
        // 支援的語言代碼
        const supportedLanguages = ['zh_TW', 'en_US', 'ja_JP', 'ko_KR'];
        return supportedLanguages.includes(languageCode);
    }
    /**
     * 驗證市場類型
     * @param marketType - 市場類型
     * @returns 是否有效
     */
    static isValidMarketType(marketType) {
        if (!marketType || typeof marketType !== 'string') {
            return false;
        }
        const validMarketTypes = ['TW_STOCK', 'US_STOCK', 'HK_STOCK', 'ETF'];
        return validMarketTypes.includes(marketType);
    }
    /**
     * 驗證分析類型
     * @param analysisType - 分析類型
     * @returns 是否有效
     */
    static isValidAnalysisType(analysisType) {
        if (!analysisType || typeof analysisType !== 'string') {
            return false;
        }
        const validAnalysisTypes = ['technical', 'fundamental', 'risk', 'sentiment', 'comprehensive'];
        return validAnalysisTypes.includes(analysisType);
    }
    /**
     * 驗證使用者 ID 格式
     * @param userId - 使用者 ID
     * @returns 是否有效
     */
    static isValidUserId(userId) {
        if (!userId || typeof userId !== 'string') {
            return false;
        }
        // LINE 使用者 ID 格式：U 開頭後接 32 位十六進位字元
        const lineUserIdPattern = /^U[0-9a-f]{32}$/;
        return lineUserIdPattern.test(userId);
    }
    /**
     * 驗證字串長度
     * @param str - 字串
     * @param minLength - 最小長度
     * @param maxLength - 最大長度
     * @returns 是否有效
     */
    static isValidStringLength(str, minLength = 1, maxLength = 1000) {
        if (typeof str !== 'string') {
            return false;
        }
        return str.length >= minLength && str.length <= maxLength;
    }
    /**
     * 驗證數字範圍
     * @param num - 數字
     * @param min - 最小值
     * @param max - 最大值
     * @returns 是否有效
     */
    static isValidNumberRange(num, min, max) {
        return typeof num === 'number' && !isNaN(num) && isFinite(num) && num >= min && num <= max;
    }
    /**
     * 驗證陣列長度
     * @param arr - 陣列
     * @param minLength - 最小長度
     * @param maxLength - 最大長度
     * @returns 是否有效
     */
    static isValidArrayLength(arr, minLength = 0, maxLength = 1000) {
        if (!Array.isArray(arr)) {
            return false;
        }
        return arr.length >= minLength && arr.length <= maxLength;
    }
    /**
     * 驗證物件是否包含必要屬性
     * @param obj - 物件
     * @param requiredProps - 必要屬性陣列
     * @returns 是否有效
     */
    static hasRequiredProperties(obj, requiredProps) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        return requiredProps.every(prop => Object.prototype.hasOwnProperty.call(obj, prop));
    }
    /**
     * 清理和驗證股票代碼
     * @param symbol - 原始股票代碼
     * @returns 清理後的股票代碼或 null
     */
    static cleanStockSymbol(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            return null;
        }
        // 移除空白和特殊字元
        const cleaned = symbol
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
        // 驗證清理後的代碼
        if (this.isValidStockSymbol(cleaned)) {
            return cleaned;
        }
        return null;
    }
    /**
     * 清理和驗證 ETF 代碼
     * @param symbol - 原始 ETF 代碼
     * @returns 清理後的 ETF 代碼或 null
     */
    static cleanETFSymbol(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            return null;
        }
        // 移除空白和特殊字元
        const cleaned = symbol
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
        // 驗證清理後的代碼
        if (this.isValidETFSymbol(cleaned)) {
            return cleaned;
        }
        return null;
    }
    /**
     * 驗證批量分析請求
     * @param request - 批量分析請求
     * @returns 是否有效
     */
    static isValidBatchAnalysisRequest(request) {
        if (!request || typeof request !== 'object') {
            return false;
        }
        const requestObj = request;
        if (!Array.isArray(requestObj['symbols'])) {
            return false;
        }
        if (requestObj['symbols'].length === 0 || requestObj['symbols'].length > 10) {
            return false;
        }
        for (const symbol of requestObj['symbols']) {
            if (!this.isValidStockSymbol(symbol) && !this.isValidETFSymbol(symbol)) {
                return false;
            }
        }
        return true;
    }
}
exports.Validation = Validation;
//# sourceMappingURL=Validation.js.map