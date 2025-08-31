import { LocalizedText } from '../types';
export type SupportedLanguage = 'zh_TW' | 'en_US' | 'ja_JP';
export interface LanguageResource {
    [key: string]: LocalizedText;
}
export declare class LocalizationService {
    private static instance;
    private resources;
    private defaultLanguage;
    private currentLanguage;
    private constructor();
    static getInstance(): LocalizationService;
    setLanguage(language: SupportedLanguage): void;
    getCurrentLanguage(): SupportedLanguage;
    getDefaultLanguage(): SupportedLanguage;
    getText(key: string, language?: SupportedLanguage): string;
    getLocalizedText(key: string): LocalizedText | null;
    isLanguageSupported(language: string): language is SupportedLanguage;
    getSupportedLanguages(): SupportedLanguage[];
    addResource(key: string, translations: LocalizedText): void;
    addResources(resources: LanguageResource): void;
    private initializeResources;
    formatMessage(key: string, params: Record<string, string | number>, language?: SupportedLanguage): string;
    formatNumber(value: number, language?: SupportedLanguage): string;
    formatCurrency(value: number, currency?: string, language?: SupportedLanguage): string;
    formatDate(date: Date, language?: SupportedLanguage): string;
    formatTime(date: Date, language?: SupportedLanguage): string;
    getRelativeTime(date: Date, language?: SupportedLanguage): string;
}
//# sourceMappingURL=LocalizationService.d.ts.map