"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationService = void 0;
// 多語系服務類別
class LocalizationService {
    constructor() {
        this.defaultLanguage = 'zh_TW';
        this.currentLanguage = 'zh_TW';
        this.resources = this.initializeResources();
    }
    // 單例模式
    static getInstance() {
        if (!LocalizationService.instance) {
            LocalizationService.instance = new LocalizationService();
        }
        return LocalizationService.instance;
    }
    // 設定當前語言
    setLanguage(language) {
        this.currentLanguage = language;
    }
    // 獲取當前語言
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    // 獲取預設語言
    getDefaultLanguage() {
        return this.defaultLanguage;
    }
    // 獲取本地化文字
    getText(key, language) {
        const targetLanguage = language || this.currentLanguage;
        const resource = this.resources[key];
        if (!resource) {
            console.warn(`Translation key not found: ${key}`);
            return key; // 回退到鍵值本身
        }
        const text = resource[targetLanguage];
        if (!text) {
            console.warn(`Translation not found for key: ${key}, language: ${targetLanguage}`);
            return resource[this.defaultLanguage] || key; // 回退到預設語言
        }
        return text;
    }
    // 獲取本地化文字物件
    getLocalizedText(key) {
        return this.resources[key] || null;
    }
    // 檢查是否支援指定語言
    isLanguageSupported(language) {
        return ['zh_TW', 'en_US', 'ja_JP'].includes(language);
    }
    // 獲取所有支援的語言
    getSupportedLanguages() {
        return ['zh_TW', 'en_US', 'ja_JP'];
    }
    // 添加新的翻譯資源
    addResource(key, translations) {
        this.resources[key] = translations;
    }
    // 批量添加翻譯資源
    addResources(resources) {
        this.resources = { ...this.resources, ...resources };
    }
    // 初始化語言資源
    initializeResources() {
        return {
            // 通用訊息
            welcome: {
                zh_TW: '歡迎使用股健檢！',
                en_US: 'Welcome to Stock Health Check!',
                ja_JP: '株健診へようこそ！',
            },
            help: {
                zh_TW: '幫助',
                en_US: 'Help',
                ja_JP: 'ヘルプ',
            },
            error: {
                zh_TW: '錯誤',
                en_US: 'Error',
                ja_JP: 'エラー',
            },
            success: {
                zh_TW: '成功',
                en_US: 'Success',
                ja_JP: '成功',
            },
            // 股票分析相關
            stock_analysis: {
                zh_TW: '股票分析',
                en_US: 'Stock Analysis',
                ja_JP: '株式分析',
            },
            health_score: {
                zh_TW: '健康度評分',
                en_US: 'Health Score',
                ja_JP: '健康度スコア',
            },
            technical_analysis: {
                zh_TW: '技術分析',
                en_US: 'Technical Analysis',
                ja_JP: 'テクニカル分析',
            },
            fundamental_analysis: {
                zh_TW: '基本面分析',
                en_US: 'Fundamental Analysis',
                ja_JP: 'ファンダメンタル分析',
            },
            risk_analysis: {
                zh_TW: '風險分析',
                en_US: 'Risk Analysis',
                ja_JP: 'リスク分析',
            },
            // 投資建議
            buy: {
                zh_TW: '買入',
                en_US: 'Buy',
                ja_JP: '買い',
            },
            sell: {
                zh_TW: '賣出',
                en_US: 'Sell',
                ja_JP: '売り',
            },
            hold: {
                zh_TW: '持有',
                en_US: 'Hold',
                ja_JP: '保有',
            },
            strong_buy: {
                zh_TW: '強烈買入',
                en_US: 'Strong Buy',
                ja_JP: '強力買い',
            },
            strong_sell: {
                zh_TW: '強烈賣出',
                en_US: 'Strong Sell',
                ja_JP: '強力売り',
            },
            // 健康度等級
            excellent: {
                zh_TW: '優良',
                en_US: 'Excellent',
                ja_JP: '優秀',
            },
            good: {
                zh_TW: '良好',
                en_US: 'Good',
                ja_JP: '良好',
            },
            average: {
                zh_TW: '一般',
                en_US: 'Average',
                ja_JP: '普通',
            },
            poor: {
                zh_TW: '較差',
                en_US: 'Poor',
                ja_JP: '悪い',
            },
            dangerous: {
                zh_TW: '危險',
                en_US: 'Dangerous',
                ja_JP: '危険',
            },
            // 市場類型
            tw_stock: {
                zh_TW: '台股',
                en_US: 'Taiwan Stock',
                ja_JP: '台湾株',
            },
            etf: {
                zh_TW: 'ETF',
                en_US: 'ETF',
                ja_JP: 'ETF',
            },
            us_stock: {
                zh_TW: '美股',
                en_US: 'US Stock',
                ja_JP: '米国株',
            },
            crypto: {
                zh_TW: '加密貨幣',
                en_US: 'Cryptocurrency',
                ja_JP: '暗号通貨',
            },
            // 分析類型
            fixed_formula: {
                zh_TW: '固定公式',
                en_US: 'Fixed Formula',
                ja_JP: '固定公式',
            },
            ai_driven: {
                zh_TW: 'AI 驅動',
                en_US: 'AI Driven',
                ja_JP: 'AI駆動',
            },
            // 錯誤訊息
            symbol_not_found: {
                zh_TW: '找不到股票代碼',
                en_US: 'Symbol not found',
                ja_JP: 'シンボルが見つかりません',
            },
            api_error: {
                zh_TW: 'API 錯誤',
                en_US: 'API Error',
                ja_JP: 'APIエラー',
            },
            network_error: {
                zh_TW: '網路錯誤',
                en_US: 'Network Error',
                ja_JP: 'ネットワークエラー',
            },
            invalid_input: {
                zh_TW: '無效輸入',
                en_US: 'Invalid Input',
                ja_JP: '無効な入力',
            },
            // 用戶介面
            search_stock: {
                zh_TW: '搜尋股票',
                en_US: 'Search Stock',
                ja_JP: '株式検索',
            },
            add_to_watchlist: {
                zh_TW: '加入關注清單',
                en_US: 'Add to Watchlist',
                ja_JP: 'ウォッチリストに追加',
            },
            remove_from_watchlist: {
                zh_TW: '從關注清單移除',
                en_US: 'Remove from Watchlist',
                ja_JP: 'ウォッチリストから削除',
            },
            my_watchlist: {
                zh_TW: '我的關注清單',
                en_US: 'My Watchlist',
                ja_JP: 'マイウォッチリスト',
            },
            detailed_analysis: {
                zh_TW: '詳細分析',
                en_US: 'Detailed Analysis',
                ja_JP: '詳細分析',
            },
            // 分析結果
            analysis_complete: {
                zh_TW: '分析完成',
                en_US: 'Analysis Complete',
                ja_JP: '分析完了',
            },
            recommendation: {
                zh_TW: '投資建議',
                en_US: 'Recommendation',
                ja_JP: '投資推奨',
            },
            confidence: {
                zh_TW: '信心度',
                en_US: 'Confidence',
                ja_JP: '信頼度',
            },
            risk_level: {
                zh_TW: '風險等級',
                en_US: 'Risk Level',
                ja_JP: 'リスクレベル',
            },
            // 時間相關
            last_updated: {
                zh_TW: '最後更新',
                en_US: 'Last Updated',
                ja_JP: '最終更新',
            },
            real_time: {
                zh_TW: '即時',
                en_US: 'Real-time',
                ja_JP: 'リアルタイム',
            },
            // 設定相關
            settings: {
                zh_TW: '設定',
                en_US: 'Settings',
                ja_JP: '設定',
            },
            language: {
                zh_TW: '語言',
                en_US: 'Language',
                ja_JP: '言語',
            },
            notifications: {
                zh_TW: '通知',
                en_US: 'Notifications',
                ja_JP: '通知',
            },
            subscription: {
                zh_TW: '訂閱',
                en_US: 'Subscription',
                ja_JP: 'サブスクリプション',
            },
        };
    }
    // 格式化訊息（支援參數替換）
    formatMessage(key, params, language) {
        let message = this.getText(key, language);
        // 替換參數
        for (const [param, value] of Object.entries(params)) {
            const placeholder = `{${param}}`;
            message = message.replace(new RegExp(placeholder, 'g'), String(value));
        }
        return message;
    }
    // 獲取數字格式化
    formatNumber(value, language) {
        const targetLanguage = language || this.currentLanguage;
        switch (targetLanguage) {
            case 'zh_TW':
                return value.toLocaleString('zh-TW');
            case 'en_US':
                return value.toLocaleString('en-US');
            case 'ja_JP':
                return value.toLocaleString('ja-JP');
            default:
                return value.toLocaleString();
        }
    }
    // 獲取貨幣格式化
    formatCurrency(value, currency = 'TWD', language) {
        const targetLanguage = language || this.currentLanguage;
        switch (targetLanguage) {
            case 'zh_TW':
                return new Intl.NumberFormat('zh-TW', {
                    style: 'currency',
                    currency: currency,
                }).format(value);
            case 'en_US':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                }).format(value);
            case 'ja_JP':
                return new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: currency,
                }).format(value);
            default:
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                }).format(value);
        }
    }
    // 獲取日期格式化
    formatDate(date, language) {
        const targetLanguage = language || this.currentLanguage;
        switch (targetLanguage) {
            case 'zh_TW':
                return date.toLocaleDateString('zh-TW');
            case 'en_US':
                return date.toLocaleDateString('en-US');
            case 'ja_JP':
                return date.toLocaleDateString('ja-JP');
            default:
                return date.toLocaleDateString();
        }
    }
    // 獲取時間格式化
    formatTime(date, language) {
        const targetLanguage = language || this.currentLanguage;
        switch (targetLanguage) {
            case 'zh_TW':
                return date.toLocaleTimeString('zh-TW');
            case 'en_US':
                return date.toLocaleTimeString('en-US');
            case 'ja_JP':
                return date.toLocaleTimeString('ja-JP');
            default:
                return date.toLocaleTimeString();
        }
    }
    // 獲取相對時間
    getRelativeTime(date, language) {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const targetLanguage = language || this.currentLanguage;
        if (diffInSeconds < 60) {
            return this.getText('just_now', targetLanguage);
        }
        else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return this.formatMessage('minutes_ago', { minutes }, targetLanguage);
        }
        else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return this.formatMessage('hours_ago', { hours }, targetLanguage);
        }
        else {
            const days = Math.floor(diffInSeconds / 86400);
            return this.formatMessage('days_ago', { days }, targetLanguage);
        }
    }
}
exports.LocalizationService = LocalizationService;
//# sourceMappingURL=LocalizationService.js.map