import { FlexComponent, AnalysisResult, MarketType, Recommendation } from '../types';
import { SupportedLanguage } from '../services/LocalizationService';
export declare class ComponentFactory {
    private localizationService;
    constructor();
    createHeader(symbol: string, marketType: MarketType, language: SupportedLanguage): FlexComponent;
    createHealthScoreCard(healthScore: number, language: SupportedLanguage): FlexComponent;
    createAnalysisCards(analysisResult: AnalysisResult, language: SupportedLanguage): FlexComponent;
    private createScoreCard;
    createRecommendationCard(recommendation: Recommendation, language: SupportedLanguage): FlexComponent;
    createActionButtons(symbol: string, language: SupportedLanguage): FlexComponent;
    createListHeader(language: SupportedLanguage): FlexComponent;
    createStockListItem(stock: {
        symbol: string;
        name: string;
        price: number;
        change: number;
    }, _language: SupportedLanguage): FlexComponent;
    createListFooter(language: SupportedLanguage): FlexComponent;
    createCompactStockCard(analysisResult: AnalysisResult, language: SupportedLanguage): FlexComponent;
    private getMarketTypeText;
    private getHealthScoreLevel;
    private getHealthScoreColor;
    private getRecommendationColor;
    createSeparator(): FlexComponent;
    createSpacing(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): FlexComponent;
    createProgressBar(value: number, max?: number, color?: string): FlexComponent;
    createBarChart(data: Array<{
        label: string;
        value: number;
        color?: string;
    }>, _language: SupportedLanguage): FlexComponent;
}
//# sourceMappingURL=ComponentFactory.d.ts.map