import { StockData, ETFData } from '../types/stock';
import { AnalysisResult } from '../types/analysis';
import { LineFlexReplyMessage } from '../types/line-events';
import { HealthReport, ScoreCategory, ScoreGrade } from '../types/health-score';

// Flex 訊息生成器
export class FlexMessageGenerator {
  /**
   * 取得顯示名稱
   * @param name - 原始名稱
   * @param symbol - 股票代碼
   * @returns 顯示名稱
   */
  private getDisplayName(name: string, _symbol: string): string {
    // 如果有中文名稱，優先使用中文
    if (/[\u4e00-\u9fff]/.test(name)) {
      // 限制長度，避免過長
      return name.length > 20 ? name.substring(0, 20) + '...' : name;
    }

    // 如果沒有中文，使用英文名稱
    return name.length > 25 ? name.substring(0, 25) + '...' : name;
  }

  /**
   * 格式化成交量
   * @param volume - 成交量
   * @returns 格式化後的成交量
   */
  private formatVolume(volume: number): string {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  }
  /**
   * 建立股票資訊訊息
   * @param stockData - 股票資料
   * @returns Flex 訊息
   */
  createStockInfoMessage(stockData: StockData): LineFlexReplyMessage {
    const priceColor = stockData.price && stockData.price > 0 ? '#00B900' : '#FF0000';
    const priceText = stockData.price ? `$${stockData.price.toFixed(2)}` : 'N/A';
    const displayName = this.getDisplayName(stockData.name, stockData.symbol);

    return {
      type: 'flex',
      altText: `${displayName} 股票資訊`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: displayName,
              weight: 'bold',
              size: 'sm',
              color: '#FFFFFF',
              align: 'center',
              wrap: true,
            },
            {
              type: 'text',
              text: stockData.symbol,
              size: 'xs',
              color: '#E8F5E8',
              align: 'center',
              margin: 'sm',
            },
          ],
          backgroundColor: '#27AE60',
          paddingAll: 'md',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
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
                  weight: 'bold',
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
                  text: stockData.volume ? this.formatVolume(stockData.volume) : 'N/A',
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
  createAnalysisMessage(analysisResult: AnalysisResult): LineFlexReplyMessage {
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
  createETFInfoMessage(etfData: ETFData): LineFlexReplyMessage {
    const priceColor = etfData.price && etfData.price > 0 ? '#00B900' : '#FF0000';
    const priceText = etfData.price ? `$${etfData.price.toFixed(2)}` : 'N/A';
    const displayName = this.getDisplayName(etfData.name, etfData.symbol);

    return {
      type: 'flex',
      altText: `${displayName} ETF 資訊`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: displayName,
              weight: 'bold',
              size: 'sm',
              color: '#FFFFFF',
              align: 'center',
              wrap: true,
            },
            {
              type: 'text',
              text: etfData.symbol,
              size: 'xs',
              color: '#E8F5E8',
              align: 'center',
              margin: 'sm',
            },
          ],
          backgroundColor: '#3498DB',
          paddingAll: 'md',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
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
                  weight: 'bold',
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
                  text: etfData.volume ? this.formatVolume(etfData.volume) : 'N/A',
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
  createErrorMessage(message: string): LineFlexReplyMessage {
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
  private formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return marketCap.toLocaleString();
    }
  }

  /**
   * 取得分數顏色
   * @param score - 分數
   * @returns 顏色代碼
   */
  private getScoreColor(score: number): string {
    if (score >= 80) return '#27AE60'; // 綠色
    if (score >= 60) return '#F39C12'; // 橙色
    if (score >= 40) return '#E67E22'; // 深橙色
    return '#E74C3C'; // 紅色
  }

  /**
   * 取得建議文字
   * @param recommendation - 建議類型
   * @returns 建議文字
   */
  private getRecommendationText(recommendation: string): string {
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
  private getRecommendationColor(recommendation: string): string {
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

  /**
   * 建立體質分析結果訊息
   * @param healthReport - 體質分析報告
   * @returns Flex 訊息
   */
  createHealthAnalysisMessage(healthReport: HealthReport): LineFlexReplyMessage {
    const scoreColor = this.getScoreColor(healthReport.overallScore);
    const gradeText = this.getGradeText(healthReport.overallGrade);

    // 建立各類別評分條目
    const categoryScoreItems = Object.entries(healthReport.categoryScores).map(
      ([category, breakdown]) => ({
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: this.getCategoryDisplayName(category as ScoreCategory),
            size: 'sm',
            color: '#555555',
            flex: 0,
          },
          {
            type: 'text',
            text: `${breakdown.score}/100`,
            size: 'sm',
            color: this.getScoreColor(breakdown.score),
            align: 'end',
            flex: 0,
          },
        ],
      })
    );

    // 建立風險因子條目
    const riskFactorItems = healthReport.riskFactors.slice(0, 3).map(risk => ({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '⚠️',
          size: 'sm',
          color: this.getRiskColor(risk.level),
          flex: 0,
        },
        {
          type: 'text',
          text: risk.name,
          size: 'sm',
          color: '#111111',
          flex: 1,
          wrap: true,
        },
        {
          type: 'text',
          text: risk.level.toUpperCase(),
          size: 'xs',
          color: this.getRiskColor(risk.level),
          align: 'end',
          flex: 0,
        },
      ],
    }));

    // 建立優勢和弱勢條目
    const strengthItems = healthReport.strengths.slice(0, 2).map(strength => ({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '✅',
          size: 'sm',
          color: '#27AE60',
          flex: 0,
        },
        {
          type: 'text',
          text: strength,
          size: 'sm',
          color: '#111111',
          flex: 1,
          wrap: true,
        },
      ],
    }));

    const weaknessItems = healthReport.weaknesses.slice(0, 2).map(weakness => ({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '❌',
          size: 'sm',
          color: '#E74C3C',
          flex: 0,
        },
        {
          type: 'text',
          text: weakness,
          size: 'sm',
          color: '#111111',
          flex: 1,
          wrap: true,
        },
      ],
    }));

    return {
      type: 'flex',
      altText: `${healthReport.symbol} 體質分析結果`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `${healthReport.symbol} 體質分析`,
              weight: 'bold',
              size: 'lg',
              color: '#FFFFFF',
              align: 'center',
            },
            {
              type: 'text',
              text: gradeText,
              size: 'sm',
              color: '#E8F5E8',
              align: 'center',
              margin: 'sm',
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
            // 整體評分
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '整體評分',
                  size: 'lg',
                  weight: 'bold',
                  color: '#111111',
                  flex: 0,
                },
                {
                  type: 'text',
                  text: `${healthReport.overallScore}/100`,
                  size: 'lg',
                  weight: 'bold',
                  color: scoreColor,
                  align: 'end',
                  flex: 0,
                },
              ],
            },
            // 分隔線
            {
              type: 'separator',
              margin: 'md',
            },
            // 各類別評分
            {
              type: 'text',
              text: '各類別評分',
              size: 'sm',
              weight: 'bold',
              color: '#111111',
              margin: 'md',
            },
            ...categoryScoreItems,
            // 分隔線
            {
              type: 'separator',
              margin: 'md',
            },
            // 風險因子
            ...(healthReport.riskFactors.length > 0
              ? [
                  {
                    type: 'text',
                    text: '風險因子',
                    size: 'sm',
                    weight: 'bold',
                    color: '#111111',
                    margin: 'md',
                  },
                  ...riskFactorItems,
                  {
                    type: 'separator',
                    margin: 'md',
                  },
                ]
              : []),
            // 優勢項目
            ...(healthReport.strengths.length > 0
              ? [
                  {
                    type: 'text',
                    text: '優勢項目',
                    size: 'sm',
                    weight: 'bold',
                    color: '#111111',
                    margin: 'md',
                  },
                  ...strengthItems,
                  {
                    type: 'separator',
                    margin: 'md',
                  },
                ]
              : []),
            // 弱勢項目
            ...(healthReport.weaknesses.length > 0
              ? [
                  {
                    type: 'text',
                    text: '弱勢項目',
                    size: 'sm',
                    weight: 'bold',
                    color: '#111111',
                    margin: 'md',
                  },
                  ...weaknessItems,
                ]
              : []),
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `投資建議: ${healthReport.investmentAdvice.advice}`,
              size: 'sm',
              color: '#555555',
              align: 'center',
              wrap: true,
            },
            {
              type: 'text',
              text: `適合: ${this.getSuitabilityText(healthReport.investmentAdvice.suitability)} | 時間: ${this.getTimeHorizonText(healthReport.investmentAdvice.timeHorizon)}`,
              size: 'xs',
              color: '#888888',
              align: 'center',
              margin: 'sm',
            },
          ],
          flex: 0,
          paddingAll: 'md',
        },
      },
    };
  }

  /**
   * 取得評分等級顯示文字
   * @param grade - 評分等級
   * @returns 顯示文字
   */
  private getGradeText(grade: ScoreGrade): string {
    switch (grade) {
      case ScoreGrade.EXCELLENT:
        return '優秀 (90-100)';
      case ScoreGrade.GOOD:
        return '良好 (80-89)';
      case ScoreGrade.AVERAGE:
        return '平均 (70-79)';
      case ScoreGrade.BELOW_AVERAGE:
        return '低於平均 (60-69)';
      case ScoreGrade.POOR:
        return '不佳 (50-59)';
      case ScoreGrade.VERY_POOR:
        return '很差 (0-49)';
      default:
        return '未知';
    }
  }

  /**
   * 取得類別顯示名稱
   * @param category - 評分類別
   * @returns 顯示名稱
   */
  private getCategoryDisplayName(category: ScoreCategory): string {
    switch (category) {
      case ScoreCategory.VALUATION:
        return '估值評分';
      case ScoreCategory.FUNDAMENTALS:
        return '基本面評分';
      case ScoreCategory.TECHNICAL:
        return '技術面評分';
      case ScoreCategory.RISK:
        return '風險評分';
      case ScoreCategory.GROWTH:
        return '成長性評分';
      case ScoreCategory.QUALITY:
        return '品質評分';
      case ScoreCategory.LIQUIDITY:
        return '流動性評分';
      default:
        return category;
    }
  }

  /**
   * 取得風險等級顏色
   * @param level - 風險等級
   * @returns 顏色代碼
   */
  private getRiskColor(level: 'low' | 'medium' | 'high'): string {
    switch (level) {
      case 'low':
        return '#27AE60';
      case 'medium':
        return '#F39C12';
      case 'high':
        return '#E74C3C';
      default:
        return '#555555';
    }
  }

  /**
   * 取得投資適合性文字
   * @param suitability - 適合性
   * @returns 顯示文字
   */
  private getSuitabilityText(suitability: 'conservative' | 'moderate' | 'aggressive'): string {
    switch (suitability) {
      case 'conservative':
        return '保守型';
      case 'moderate':
        return '穩健型';
      case 'aggressive':
        return '積極型';
      default:
        return '未知';
    }
  }

  /**
   * 取得投資時間範圍文字
   * @param timeHorizon - 時間範圍
   * @returns 顯示文字
   */
  private getTimeHorizonText(timeHorizon: 'short' | 'medium' | 'long'): string {
    switch (timeHorizon) {
      case 'short':
        return '短期';
      case 'medium':
        return '中期';
      case 'long':
        return '長期';
      default:
        return '未知';
    }
  }
}
