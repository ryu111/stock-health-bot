"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTranslator = void 0;
const LocalizationService_1 = require("./LocalizationService");
// 訊息翻譯器類別
class MessageTranslator {
    constructor(translator) {
        this.localizationService = LocalizationService_1.LocalizationService.getInstance();
        this.translator = translator || new DefaultTranslator();
    }
    // 翻譯單一訊息
    async translateMessage(text, targetLanguage) {
        // 首先檢查是否有預定義的翻譯
        const predefinedTranslation = this.localizationService.getText(text, targetLanguage);
        if (predefinedTranslation !== text) {
            return predefinedTranslation;
        }
        // 如果沒有預定義翻譯，使用外部翻譯器
        try {
            return await this.translator.translate(text, targetLanguage);
        }
        catch (error) {
            console.error(`Translation failed for text: ${text}`, error);
            return text; // 回退到原文
        }
    }
    // 批量翻譯訊息
    async translateMessages(texts, targetLanguage) {
        const results = [];
        for (const text of texts) {
            const translated = await this.translateMessage(text, targetLanguage);
            results.push(translated);
        }
        return results;
    }
    // 翻譯本地化文字物件
    async translateLocalizedText(localizedText, targetLanguage) {
        const text = localizedText[targetLanguage];
        if (text) {
            return text;
        }
        // 如果目標語言沒有翻譯，使用預設語言進行翻譯
        const defaultLanguage = this.localizationService.getDefaultLanguage();
        const defaultText = localizedText[defaultLanguage];
        if (defaultText && targetLanguage !== defaultLanguage) {
            return await this.translateMessage(defaultText, targetLanguage);
        }
        // 如果都沒有，使用第一個可用的翻譯
        const availableText = Object.values(localizedText)[0];
        if (availableText) {
            return await this.translateMessage(availableText, targetLanguage);
        }
        return 'Translation not available';
    }
    // 翻譯分析結果
    async translateAnalysisResult(analysisResult, targetLanguage) {
        const translated = { ...analysisResult };
        // 翻譯建議
        if (translated['recommendations']) {
            for (const recommendation of translated['recommendations']) {
                const reason = recommendation['reason'];
                if (reason) {
                    recommendation['reason'] = await this.translateMessage(reason, targetLanguage);
                }
            }
        }
        // 翻譯分析因子
        if (translated['factors']) {
            for (const factor of translated['factors']) {
                const name = factor['name'];
                if (name) {
                    factor['name'] = await this.translateMessage(name, targetLanguage);
                }
                const description = factor['description'];
                if (description) {
                    factor['description'] = await this.translateMessage(description, targetLanguage);
                }
            }
        }
        return translated;
    }
    // 翻譯錯誤訊息
    async translateErrorMessage(error, targetLanguage) {
        if (typeof error === 'string') {
            return await this.translateMessage(error, targetLanguage);
        }
        if (error &&
            typeof error === 'object' &&
            'message' in error &&
            typeof error.message === 'string') {
            return await this.translateMessage(error.message, targetLanguage);
        }
        return this.localizationService.getText('unknown_error', targetLanguage);
    }
    // 翻譯用戶介面文字
    translateUIText(uiText, targetLanguage) {
        // 檢查是否有預定義的 UI 翻譯
        const predefinedTranslation = this.localizationService.getText(uiText, targetLanguage);
        if (predefinedTranslation !== uiText) {
            return predefinedTranslation;
        }
        // 如果沒有預定義翻譯，嘗試智能翻譯
        return this.smartTranslate(uiText, targetLanguage);
    }
    // 智能翻譯（根據上下文）
    smartTranslate(text, targetLanguage) {
        // 這裡可以實作更智能的翻譯邏輯
        // 例如：根據上下文選擇合適的翻譯
        // 簡單的關鍵字替換
        const keywordMappings = {
            stock: {
                zh_TW: '股票',
                en_US: 'stock',
                ja_JP: '株式',
            },
            price: {
                zh_TW: '價格',
                en_US: 'price',
                ja_JP: '価格',
            },
            analysis: {
                zh_TW: '分析',
                en_US: 'analysis',
                ja_JP: '分析',
            },
            buy: {
                zh_TW: '買入',
                en_US: 'buy',
                ja_JP: '買い',
            },
            sell: {
                zh_TW: '賣出',
                en_US: 'sell',
                ja_JP: '売り',
            },
            hold: {
                zh_TW: '持有',
                en_US: 'hold',
                ja_JP: '保有',
            },
        };
        let translatedText = text;
        // 替換關鍵字
        for (const [keyword, translations] of Object.entries(keywordMappings)) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            translatedText = translatedText.replace(regex, translations[targetLanguage]);
        }
        return translatedText;
    }
    // 檢測文字語言
    async detectTextLanguage(text) {
        try {
            return await this.translator.detectLanguage(text);
        }
        catch (error) {
            console.error('Language detection failed:', error);
            return this.localizationService.getDefaultLanguage();
        }
    }
    // 獲取翻譯統計
    getTranslationStats() {
        const resources = this.localizationService['resources'];
        const stats = {
            zh_TW: 0,
            en_US: 0,
            ja_JP: 0,
        };
        for (const key in resources) {
            const resource = resources[key];
            for (const lang of Object.keys(stats)) {
                if (resource && resource[lang]) {
                    stats[lang]++;
                }
            }
        }
        return {
            totalKeys: Object.keys(resources).length,
            translationsByLanguage: stats,
            coverage: {
                zh_TW: ((stats.zh_TW / Object.keys(resources).length) * 100).toFixed(1) + '%',
                en_US: ((stats.en_US / Object.keys(resources).length) * 100).toFixed(1) + '%',
                ja_JP: ((stats.ja_JP / Object.keys(resources).length) * 100).toFixed(1) + '%',
            },
        };
    }
}
exports.MessageTranslator = MessageTranslator;
// 預設翻譯器（模擬外部翻譯服務）
class DefaultTranslator {
    async translate(text, targetLanguage) {
        // 這裡可以整合 Google Translate API 或其他翻譯服務
        // 目前返回模擬翻譯
        const translations = {
            zh_TW: {
                Hello: '你好',
                Welcome: '歡迎',
                Stock: '股票',
                Analysis: '分析',
                Buy: '買入',
                Sell: '賣出',
                Hold: '持有',
            },
            en_US: {
                你好: 'Hello',
                歡迎: 'Welcome',
                股票: 'Stock',
                分析: 'Analysis',
                買入: 'Buy',
                賣出: 'Sell',
                持有: 'Hold',
            },
            ja_JP: {
                Hello: 'こんにちは',
                Welcome: 'ようこそ',
                Stock: '株式',
                Analysis: '分析',
                Buy: '買い',
                Sell: '売り',
                Hold: '保有',
            },
        };
        const targetTranslations = translations[targetLanguage];
        if (targetTranslations && targetTranslations[text]) {
            return targetTranslations[text];
        }
        // 如果沒有找到翻譯，返回原文
        return text;
    }
    async translateBatch(texts, targetLanguage) {
        const results = [];
        for (const text of texts) {
            const translated = await this.translate(text, targetLanguage);
            results.push(translated);
        }
        return results;
    }
    async detectLanguage(text) {
        // 簡單的語言檢測邏輯
        const chineseRegex = /[\u4e00-\u9fff]/;
        const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
        if (chineseRegex.test(text)) {
            return 'zh_TW';
        }
        else if (japaneseRegex.test(text)) {
            return 'ja_JP';
        }
        else {
            return 'en_US';
        }
    }
}
//# sourceMappingURL=MessageTranslator.js.map