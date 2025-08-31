"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentFactory = void 0;
const LocalizationService_1 = require("../services/LocalizationService");
// 組件工廠類別
class ComponentFactory {
    constructor() {
        this.localizationService = LocalizationService_1.LocalizationService.getInstance();
    }
    // 創建標題組件
    createHeader(symbol, marketType, language) {
        const marketTypeText = this.getMarketTypeText(marketType, language);
        return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            contents: [
                {
                    type: 'text',
                    text: symbol,
                    size: 'xl',
                    weight: 'bold',
                    flex: 2,
                },
                {
                    type: 'text',
                    text: marketTypeText,
                    size: 'sm',
                    color: '#666666',
                    align: 'end',
                    flex: 1,
                },
            ],
        };
    }
    // 創建健康度評分卡片
    createHealthScoreCard(healthScore, language) {
        const level = this.getHealthScoreLevel(healthScore);
        const levelText = this.localizationService.getText(level.toLowerCase(), language);
        const color = this.getHealthScoreColor(healthScore);
        return {
            type: 'box',
            layout: 'vertical',
            backgroundColor: color,
            cornerRadius: 'md',
            margin: 'md',
            contents: [
                {
                    type: 'text',
                    text: this.localizationService.getText('health_score', language),
                    size: 'sm',
                    color: '#FFFFFF',
                    align: 'center',
                },
                {
                    type: 'text',
                    text: healthScore.toString(),
                    size: 'xl',
                    weight: 'bold',
                    color: '#FFFFFF',
                    align: 'center',
                },
                {
                    type: 'text',
                    text: levelText,
                    size: 'sm',
                    color: '#FFFFFF',
                    align: 'center',
                },
            ],
        };
    }
    // 創建分析卡片
    createAnalysisCards(analysisResult, language) {
        return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            contents: [
                this.createScoreCard(this.localizationService.getText('technical_analysis', language), analysisResult.technicalScore, '#4CAF50'),
                this.createScoreCard(this.localizationService.getText('fundamental_analysis', language), analysisResult.fundamentalScore, '#2196F3'),
                this.createScoreCard(this.localizationService.getText('risk_analysis', language), 100 - analysisResult.riskScore, // 轉換為正面分數
                '#FF9800'),
            ],
        };
    }
    // 創建分數卡片
    createScoreCard(title, score, color) {
        return {
            type: 'box',
            layout: 'vertical',
            backgroundColor: color,
            cornerRadius: 'sm',
            margin: 'sm',
            flex: 1,
            contents: [
                {
                    type: 'text',
                    text: title,
                    size: 'xs',
                    color: '#FFFFFF',
                    align: 'center',
                },
                {
                    type: 'text',
                    text: score.toString(),
                    size: 'lg',
                    weight: 'bold',
                    color: '#FFFFFF',
                    align: 'center',
                },
            ],
        };
    }
    // 創建建議卡片
    createRecommendationCard(recommendation, language) {
        const primaryRecommendation = recommendation;
        if (!primaryRecommendation) {
            return {
                type: 'text',
                text: this.localizationService.getText('no_recommendation', language),
                size: 'md',
                color: '#666666',
                align: 'center',
            };
        }
        const recommendationText = this.localizationService.getText(primaryRecommendation.toLowerCase(), language);
        const color = this.getRecommendationColor(primaryRecommendation);
        return {
            type: 'box',
            layout: 'vertical',
            backgroundColor: color,
            cornerRadius: 'md',
            margin: 'md',
            contents: [
                {
                    type: 'text',
                    text: this.localizationService.getText('recommendation', language),
                    size: 'sm',
                    color: '#FFFFFF',
                    align: 'center',
                },
                {
                    type: 'text',
                    text: recommendationText,
                    size: 'lg',
                    weight: 'bold',
                    color: '#FFFFFF',
                    align: 'center',
                },
                {
                    type: 'text',
                    text: this.localizationService.getText('recommendation_reason', language),
                    size: 'sm',
                    color: '#FFFFFF',
                    align: 'center',
                    wrap: true,
                },
            ],
        };
    }
    // 創建操作按鈕
    createActionButtons(symbol, language) {
        return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            contents: [
                {
                    type: 'button',
                    style: 'primary',
                    action: {
                        type: 'postback',
                        label: this.localizationService.getText('add_to_watchlist', language),
                        data: `add_watchlist:${symbol}`,
                    },
                },
                {
                    type: 'button',
                    style: 'secondary',
                    action: {
                        type: 'message',
                        label: this.localizationService.getText('detailed_analysis', language),
                        text: `詳細分析 ${symbol}`,
                    },
                },
            ],
        };
    }
    // 創建列表標題
    createListHeader(language) {
        return {
            type: 'text',
            text: this.localizationService.getText('stock_list', language),
            size: 'xl',
            weight: 'bold',
            align: 'center',
        };
    }
    // 創建股票列表項目
    createStockListItem(stock, _language) {
        const changeColor = stock.change >= 0 ? '#4CAF50' : '#F44336';
        const changeSymbol = stock.change >= 0 ? '+' : '';
        return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            margin: 'sm',
            cornerRadius: 'sm',
            contents: [
                {
                    type: 'box',
                    layout: 'vertical',
                    flex: 2,
                    contents: [
                        {
                            type: 'text',
                            text: stock.symbol,
                            size: 'md',
                            weight: 'bold',
                        },
                        {
                            type: 'text',
                            text: stock.name,
                            size: 'sm',
                            color: '#666666',
                        },
                    ],
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    align: 'end',
                    contents: [
                        {
                            type: 'text',
                            text: stock.price.toString(),
                            size: 'md',
                            weight: 'bold',
                        },
                        {
                            type: 'text',
                            text: `${changeSymbol}${stock.change.toFixed(2)}`,
                            size: 'sm',
                            color: changeColor,
                        },
                    ],
                },
            ],
        };
    }
    // 創建列表頁腳
    createListFooter(language) {
        return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            contents: [
                {
                    type: 'button',
                    style: 'secondary',
                    action: {
                        type: 'message',
                        label: this.localizationService.getText('refresh', language),
                        text: '刷新',
                    },
                },
                {
                    type: 'button',
                    style: 'primary',
                    action: {
                        type: 'message',
                        label: this.localizationService.getText('add_more', language),
                        text: '添加更多',
                    },
                },
            ],
        };
    }
    // 創建緊湊股票卡片
    createCompactStockCard(analysisResult, language) {
        const primaryRecommendation = analysisResult.recommendation;
        return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            margin: 'sm',
            cornerRadius: 'sm',
            contents: [
                {
                    type: 'box',
                    layout: 'vertical',
                    flex: 2,
                    contents: [
                        {
                            type: 'text',
                            text: analysisResult.symbol,
                            size: 'md',
                            weight: 'bold',
                        },
                        {
                            type: 'text',
                            text: `${this.localizationService.getText('health_score', language)}: ${analysisResult.healthScore}`,
                            size: 'sm',
                            color: '#666666',
                        },
                    ],
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    align: 'end',
                    contents: [
                        {
                            type: 'text',
                            text: primaryRecommendation
                                ? this.localizationService.getText(primaryRecommendation.toLowerCase(), language)
                                : this.localizationService.getText('hold', language),
                            size: 'sm',
                            weight: 'bold',
                            color: primaryRecommendation
                                ? this.getRecommendationColor(primaryRecommendation)
                                : '#666666',
                        },
                        {
                            type: 'text',
                            text: `${analysisResult.confidence * 100}%`,
                            size: 'xs',
                            color: '#666666',
                        },
                    ],
                },
            ],
        };
    }
    // 獲取市場類型文字
    getMarketTypeText(marketType, language) {
        const marketTypeKey = marketType.toLowerCase().replace('_', '');
        return this.localizationService.getText(marketTypeKey, language);
    }
    // 獲取健康度評分等級
    getHealthScoreLevel(score) {
        if (score >= 80)
            return 'excellent';
        if (score >= 60)
            return 'good';
        if (score >= 40)
            return 'average';
        if (score >= 20)
            return 'poor';
        return 'dangerous';
    }
    // 獲取健康度評分顏色
    getHealthScoreColor(score) {
        if (score >= 80)
            return '#4CAF50'; // 綠色
        if (score >= 60)
            return '#8BC34A'; // 淺綠色
        if (score >= 40)
            return '#FFC107'; // 黃色
        if (score >= 20)
            return '#FF9800'; // 橙色
        return '#F44336'; // 紅色
    }
    // 獲取建議顏色
    getRecommendationColor(type) {
        switch (type) {
            case 'BUY':
                return '#4CAF50'; // 綠色
            case 'SELL':
                return '#F44336'; // 紅色
            case 'HOLD':
                return '#FF9800'; // 橙色
            default:
                return '#666666'; // 灰色
        }
    }
    // 創建分隔線
    createSeparator() {
        return {
            type: 'separator',
            margin: 'md',
        };
    }
    // 創建間距
    createSpacing(size) {
        return {
            type: 'box',
            layout: 'vertical',
            height: size === 'xs'
                ? '4px'
                : size === 'sm'
                    ? '8px'
                    : size === 'md'
                        ? '12px'
                        : size === 'lg'
                            ? '16px'
                            : '20px',
        };
    }
    // 創建進度條
    createProgressBar(value, max = 100, color = '#4CAF50') {
        const percentage = Math.min((value / max) * 100, 100);
        return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            contents: [
                {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    backgroundColor: '#E0E0E0',
                    cornerRadius: 'sm',
                    height: '8px',
                    contents: [
                        {
                            type: 'box',
                            layout: 'vertical',
                            backgroundColor: color,
                            cornerRadius: 'sm',
                            height: '8px',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: `${Math.round(percentage)}%`,
                    size: 'xs',
                    color: '#666666',
                },
            ],
        };
    }
    // 創建圖表組件（簡單的條形圖）
    createBarChart(data, _language) {
        const bars = data.map(item => ({
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            contents: [
                {
                    type: 'text',
                    text: item.label,
                    size: 'sm',
                    flex: 1,
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    flex: 2,
                    backgroundColor: '#E0E0E0',
                    cornerRadius: 'sm',
                    height: '12px',
                    contents: [
                        {
                            type: 'box',
                            layout: 'vertical',
                            backgroundColor: item.color || '#4CAF50',
                            cornerRadius: 'sm',
                            height: '12px',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: item.value.toString(),
                    size: 'sm',
                    color: '#666666',
                },
            ],
        }));
        return {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: bars,
        };
    }
}
exports.ComponentFactory = ComponentFactory;
//# sourceMappingURL=ComponentFactory.js.map