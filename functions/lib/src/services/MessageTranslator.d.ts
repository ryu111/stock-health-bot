import { SupportedLanguage } from './LocalizationService';
import { LocalizedText } from '../types';
export interface Translator {
    translate(text: string, targetLanguage: SupportedLanguage): Promise<string>;
    translateBatch(texts: string[], targetLanguage: SupportedLanguage): Promise<string[]>;
    detectLanguage(text: string): Promise<SupportedLanguage>;
}
export declare class MessageTranslator {
    private localizationService;
    private translator;
    constructor(translator?: Translator);
    translateMessage(text: string, targetLanguage: SupportedLanguage): Promise<string>;
    translateMessages(texts: string[], targetLanguage: SupportedLanguage): Promise<string[]>;
    translateLocalizedText(localizedText: LocalizedText, targetLanguage: SupportedLanguage): Promise<string>;
    translateAnalysisResult(analysisResult: Record<string, unknown>, targetLanguage: SupportedLanguage): Promise<Record<string, unknown>>;
    translateErrorMessage(error: unknown, targetLanguage: SupportedLanguage): Promise<string>;
    translateUIText(uiText: string, targetLanguage: SupportedLanguage): string;
    private smartTranslate;
    detectTextLanguage(text: string): Promise<SupportedLanguage>;
    getTranslationStats(): Record<string, unknown>;
}
//# sourceMappingURL=MessageTranslator.d.ts.map