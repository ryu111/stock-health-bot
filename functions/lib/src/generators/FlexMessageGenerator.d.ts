import { FlexComponent, LocalizedFlexMessage, AnalysisResult, FlexMessage } from '../types';
import { SupportedLanguage } from '../services/LocalizationService';
export declare class FlexMessageGenerator {
    private localizationService;
    private componentFactory;
    constructor();
    generateStockAnalysisMessage(analysisResult: AnalysisResult, language?: SupportedLanguage): FlexComponent;
    generateStockListMessage(stocks: Array<{
        symbol: string;
        name: string;
        price: number;
        change: number;
    }>, language?: SupportedLanguage): FlexComponent;
    generateErrorMessage(error: string, language?: SupportedLanguage): FlexComponent;
    generateHelpMessage(language?: SupportedLanguage): FlexComponent;
    generateSettingsMessage(language?: SupportedLanguage): FlexComponent;
    generateWelcomeMessage(language?: SupportedLanguage): FlexComponent;
    generateBatchAnalysisMessage(analysisResults: AnalysisResult[], language?: SupportedLanguage): FlexComponent;
    private generateBatchSummary;
    private getLanguageDisplayName;
    generateCompleteFlexMessage(contents: FlexComponent, altText: string): FlexMessage;
    generateLocalizedFlexMessage(generator: (language: SupportedLanguage) => FlexComponent, _altTexts: Record<SupportedLanguage, string>): LocalizedFlexMessage;
}
//# sourceMappingURL=FlexMessageGenerator.d.ts.map