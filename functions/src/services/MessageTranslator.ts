import { LocalizationService, SupportedLanguage } from './LocalizationService';
import { LocalizedText } from '../types';

// 翻譯器介面
export interface Translator {
  translate(text: string, targetLanguage: SupportedLanguage): Promise<string>;
  translateBatch(texts: string[], targetLanguage: SupportedLanguage): Promise<string[]>;
  detectLanguage(text: string): Promise<SupportedLanguage>;
}

// 同步翻譯器介面
export interface SyncTranslator {
  translate(text: string, targetLanguage: SupportedLanguage): string;
  translateBatch(texts: string[], targetLanguage: SupportedLanguage): string[];
  detectLanguage(text: string): SupportedLanguage;
}

// 訊息翻譯器類別
export class MessageTranslator {
  private localizationService: LocalizationService;
  private translator: Translator;

  constructor(translator?: Translator) {
    this.localizationService = LocalizationService.getInstance();
    this.translator = translator || new SyncTranslatorAdapter(new DefaultTranslator());
  }

  // 翻譯單一訊息
  async translateMessage(text: string, targetLanguage: SupportedLanguage): Promise<string> {
    // 首先檢查是否有預定義的翻譯
    const predefinedTranslation = this.localizationService.getText(text, targetLanguage);
    if (predefinedTranslation !== text) {
      return predefinedTranslation;
    }

    // 如果沒有預定義翻譯，使用外部翻譯器
    try {
      return await this.translator.translate(text, targetLanguage);
    } catch (error) {
      console.error(`Translation failed for text: ${text}`, error);
      return text; // 回退到原文
    }
  }

  // 批量翻譯訊息
  async translateMessages(texts: string[], targetLanguage: SupportedLanguage): Promise<string[]> {
    const results: string[] = [];

    for (const text of texts) {
      const translated = await this.translateMessage(text, targetLanguage);
      results.push(translated);
    }

    return results;
  }

  // 翻譯本地化文字物件
  async translateLocalizedText(
    localizedText: LocalizedText,
    targetLanguage: SupportedLanguage
  ): Promise<string> {
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
    const availableText = Object.values(localizedText)[0] as string;
    if (availableText) {
      return await this.translateMessage(availableText, targetLanguage);
    }

    return 'Translation not available';
  }

  // 翻譯分析結果
  async translateAnalysisResult(
    analysisResult: Record<string, unknown>,
    targetLanguage: SupportedLanguage
  ): Promise<Record<string, unknown>> {
    const translated = { ...analysisResult };

    // 翻譯建議
    if (translated['recommendations']) {
      for (const recommendation of translated['recommendations'] as Array<
        Record<string, unknown>
      >) {
        const reason = recommendation['reason'] as string;
        if (reason) {
          recommendation['reason'] = await this.translateMessage(reason, targetLanguage);
        }
      }
    }

    // 翻譯分析因子
    if (translated['factors']) {
      for (const factor of translated['factors'] as Array<Record<string, unknown>>) {
        const name = factor['name'] as string;
        if (name) {
          factor['name'] = await this.translateMessage(name, targetLanguage);
        }
        const description = factor['description'] as string;
        if (description) {
          factor['description'] = await this.translateMessage(description, targetLanguage);
        }
      }
    }

    return translated;
  }

  // 翻譯錯誤訊息
  async translateErrorMessage(error: unknown, targetLanguage: SupportedLanguage): Promise<string> {
    if (typeof error === 'string') {
      return await this.translateMessage(error, targetLanguage);
    }

    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return await this.translateMessage(error.message, targetLanguage);
    }

    return this.localizationService.getText('unknown_error', targetLanguage);
  }

  // 翻譯用戶介面文字
  translateUIText(uiText: string, targetLanguage: SupportedLanguage): string {
    // 檢查是否有預定義的 UI 翻譯
    const predefinedTranslation = this.localizationService.getText(uiText, targetLanguage);
    if (predefinedTranslation !== uiText) {
      return predefinedTranslation;
    }

    // 如果沒有預定義翻譯，嘗試智能翻譯
    return this.smartTranslate(uiText, targetLanguage);
  }

  // 智能翻譯（根據上下文）
  private smartTranslate(text: string, targetLanguage: SupportedLanguage): string {
    // 這裡可以實作更智能的翻譯邏輯
    // 例如：根據上下文選擇合適的翻譯

    // 簡單的關鍵字替換
    const keywordMappings: Record<string, Record<SupportedLanguage, string>> = {
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
  async detectTextLanguage(text: string): Promise<SupportedLanguage> {
    try {
      return await this.translator.detectLanguage(text);
    } catch (error) {
      console.error('Language detection failed:', error);
      return this.localizationService.getDefaultLanguage();
    }
  }

  // 獲取翻譯統計
  getTranslationStats(): Record<string, unknown> {
    const resources = this.localizationService['resources'];
    const stats: Record<SupportedLanguage, number> = {
      zh_TW: 0,
      en_US: 0,
      ja_JP: 0,
    };

    for (const key in resources) {
      const resource = resources[key];
      for (const lang of Object.keys(stats)) {
        if (resource && resource[lang as keyof typeof resource]) {
          stats[lang as SupportedLanguage]++;
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

// 同步翻譯器適配器
class SyncTranslatorAdapter implements Translator {
  constructor(private syncTranslator: SyncTranslator) {}

  async translate(text: string, targetLanguage: SupportedLanguage): Promise<string> {
    return this.syncTranslator.translate(text, targetLanguage);
  }

  async translateBatch(texts: string[], targetLanguage: SupportedLanguage): Promise<string[]> {
    return this.syncTranslator.translateBatch(texts, targetLanguage);
  }

  async detectLanguage(text: string): Promise<SupportedLanguage> {
    return this.syncTranslator.detectLanguage(text);
  }
}

// 預設翻譯器（模擬外部翻譯服務）
class DefaultTranslator implements SyncTranslator {
  translate(text: string, targetLanguage: SupportedLanguage): string {
    // 這裡可以整合 Google Translate API 或其他翻譯服務
    // 目前返回模擬翻譯

    const translations: Record<SupportedLanguage, Record<string, string>> = {
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

  translateBatch(texts: string[], targetLanguage: SupportedLanguage): string[] {
    const results: string[] = [];

    for (const text of texts) {
      const translated = this.translate(text, targetLanguage);
      results.push(translated);
    }

    return results;
  }

  detectLanguage(text: string): SupportedLanguage {
    // 簡單的語言檢測邏輯
    const chineseRegex = /[\u4e00-\u9fff]/;
    const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;

    if (chineseRegex.test(text)) {
      return 'zh_TW';
    } else if (japaneseRegex.test(text)) {
      return 'ja_JP';
    } else {
      return 'en_US';
    }
  }
}
