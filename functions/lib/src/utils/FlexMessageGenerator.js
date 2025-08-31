"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlexMessageGenerator = void 0;
// Flex 訊息生成器
class FlexMessageGenerator {
    /**
     * 建立股票資訊訊息
     * @param stockData - 股票資料
     * @returns Flex 訊息
     */
    createStockInfoMessage(stockData) {
        const priceColor = stockData.price && stockData.price > 0 ? '#00B900' : '#FF0000';
        const priceText = stockData.price ? `$${stockData.price.toFixed(2)}` : 'N/A';
        return {
            type: 'flex',
            altText: `${stockData.name} (${stockData.symbol}) 股票資訊`,
            contents: {
                type: 'bubble',
                size: 'kilo',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: `${stockData.name} (${stockData.symbol})`,
                            weight: 'bold',
                            size: 'lg',
                            color: '#FFFFFF',
                            align: 'center',
                        },
                    ],
                    backgroundColor: '#27AE60',
                    paddingAll: 'md',
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'md',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '價格',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: priceText,
                                    size: 'sm',
                                    color: priceColor,
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '成交量',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: stockData.volume ? stockData.volume.toLocaleString() : 'N/A',
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '市值',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: stockData.marketCap ? this.formatMarketCap(stockData.marketCap) : 'N/A',
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '本益比',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: stockData.peRatio ? stockData.peRatio.toFixed(2) : 'N/A',
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '股息殖利率',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: stockData.dividendYield
                                        ? `${(stockData.dividendYield * 100).toFixed(2)}%`
                                        : 'N/A',
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                    ],
                    paddingAll: 'md',
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'button',
                            style: 'primary',
                            action: {
                                type: 'postback',
                                label: '詳細分析',
                                data: `action=analyze&symbol=${stockData.symbol}`,
                            },
                            color: '#27AE60',
                        },
                    ],
                    flex: 0,
                    paddingAll: 'md',
                },
            },
        };
    }
    /**
     * 建立分析結果訊息
     * @param analysisResult - 分析結果
     * @returns Flex 訊息
     */
    createAnalysisMessage(analysisResult) {
        const healthScore = analysisResult.healthScore;
        const scoreColor = this.getScoreColor(healthScore);
        const recommendation = analysisResult.recommendation;
        return {
            type: 'flex',
            altText: `${analysisResult.symbol} 分析結果`,
            contents: {
                type: 'bubble',
                size: 'kilo',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: `${analysisResult.symbol} 健康度分析`,
                            weight: 'bold',
                            size: 'lg',
                            color: '#FFFFFF',
                            align: 'center',
                        },
                    ],
                    backgroundColor: scoreColor,
                    paddingAll: 'md',
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'md',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '健康分數',
                                    size: 'lg',
                                    weight: 'bold',
                                    color: '#111111',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: `${healthScore}/100`,
                                    size: 'lg',
                                    weight: 'bold',
                                    color: scoreColor,
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '技術面',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: `${analysisResult.technicalScore}/100`,
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '基本面',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: `${analysisResult.fundamentalScore}/100`,
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '風險評分',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: `${analysisResult.riskScore}/100`,
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'separator',
                            margin: 'md',
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '投資建議',
                                    size: 'sm',
                                    weight: 'bold',
                                    color: '#111111',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: this.getRecommendationText(recommendation),
                                    size: 'sm',
                                    weight: 'bold',
                                    color: this.getRecommendationColor(recommendation),
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                    ],
                    paddingAll: 'md',
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'button',
                            style: 'primary',
                            action: {
                                type: 'postback',
                                label: '查看詳細資料',
                                data: `action=details&symbol=${analysisResult.symbol}`,
                            },
                            color: scoreColor,
                        },
                    ],
                    flex: 0,
                    paddingAll: 'md',
                },
            },
        };
    }
    /**
     * 建立 ETF 資訊訊息
     * @param etfData - ETF 資料
     * @returns Flex 訊息
     */
    createETFInfoMessage(etfData) {
        const priceColor = etfData.price && etfData.price > 0 ? '#00B900' : '#FF0000';
        const priceText = etfData.price ? `$${etfData.price.toFixed(2)}` : 'N/A';
        return {
            type: 'flex',
            altText: `${etfData.name} (${etfData.symbol}) ETF 資訊`,
            contents: {
                type: 'bubble',
                size: 'kilo',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: `${etfData.name} (${etfData.symbol})`,
                            weight: 'bold',
                            size: 'lg',
                            color: '#FFFFFF',
                            align: 'center',
                        },
                    ],
                    backgroundColor: '#3498DB',
                    paddingAll: 'md',
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'md',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '價格',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: priceText,
                                    size: 'sm',
                                    color: priceColor,
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '成交量',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: etfData.volume ? etfData.volume.toLocaleString() : 'N/A',
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '市值',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: etfData.marketCap ? this.formatMarketCap(etfData.marketCap) : 'N/A',
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '費用率',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: etfData.expenseRatio
                                        ? `${(etfData.expenseRatio * 100).toFixed(2)}%`
                                        : 'N/A',
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '股息殖利率',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0,
                                },
                                {
                                    type: 'text',
                                    text: etfData.dividendYield
                                        ? `${(etfData.dividendYield * 100).toFixed(2)}%`
                                        : 'N/A',
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 0,
                                },
                            ],
                        },
                    ],
                    paddingAll: 'md',
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'button',
                            style: 'primary',
                            action: {
                                type: 'postback',
                                label: '查看詳細資料',
                                data: `action=details&symbol=${etfData.symbol}`,
                            },
                            color: '#3498DB',
                        },
                    ],
                    flex: 0,
                    paddingAll: 'md',
                },
            },
        };
    }
    /**
     * 建立錯誤訊息
     * @param message - 錯誤訊息
     * @returns Flex 訊息
     */
    createErrorMessage(message) {
        return {
            type: 'flex',
            altText: '錯誤訊息',
            contents: {
                type: 'bubble',
                size: 'micro',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '❌ 錯誤',
                            weight: 'bold',
                            size: 'lg',
                            color: '#FF0000',
                            align: 'center',
                        },
                        {
                            type: 'text',
                            text: message,
                            size: 'sm',
                            color: '#555555',
                            align: 'center',
                            wrap: true,
                        },
                    ],
                    paddingAll: 'md',
                },
            },
        };
    }
    /**
     * 格式化市值
     * @param marketCap - 市值
     * @returns 格式化後的市值
     */
    formatMarketCap(marketCap) {
        if (marketCap >= 1e12) {
            return `${(marketCap / 1e12).toFixed(2)}T`;
        }
        else if (marketCap >= 1e9) {
            return `${(marketCap / 1e9).toFixed(2)}B`;
        }
        else if (marketCap >= 1e6) {
            return `${(marketCap / 1e6).toFixed(2)}M`;
        }
        else {
            return marketCap.toLocaleString();
        }
    }
    /**
     * 取得分數顏色
     * @param score - 分數
     * @returns 顏色代碼
     */
    getScoreColor(score) {
        if (score >= 80)
            return '#27AE60'; // 綠色
        if (score >= 60)
            return '#F39C12'; // 橙色
        if (score >= 40)
            return '#E67E22'; // 深橙色
        return '#E74C3C'; // 紅色
    }
    /**
     * 取得建議文字
     * @param recommendation - 建議類型
     * @returns 建議文字
     */
    getRecommendationText(recommendation) {
        switch (recommendation) {
            case 'BUY':
                return '買入';
            case 'HOLD':
                return '持有';
            case 'SELL':
                return '賣出';
            default:
                return '持有';
        }
    }
    /**
     * 取得建議顏色
     * @param recommendation - 建議類型
     * @returns 顏色代碼
     */
    getRecommendationColor(recommendation) {
        switch (recommendation) {
            case 'BUY':
                return '#27AE60'; // 綠色
            case 'HOLD':
                return '#F39C12'; // 橙色
            case 'SELL':
                return '#E74C3C'; // 紅色
            default:
                return '#F39C12'; // 橙色
        }
    }
}
exports.FlexMessageGenerator = FlexMessageGenerator;
//# sourceMappingURL=FlexMessageGenerator.js.map