import { FlexComponent, LocalizedFlexMessage, AnalysisResult, FlexMessage } from '../types';
import { LocalizationService, SupportedLanguage } from '../services/LocalizationService';
import { ComponentFactory } from './ComponentFactory';

// Flex Message 生成器類別
export class FlexMessageGenerator {
  private localizationService: LocalizationService;
  private componentFactory: ComponentFactory;

  constructor() {
    this.localizationService = LocalizationService.getInstance();
    this.componentFactory = new ComponentFactory();
  }

  // 生成股票分析結果的 Flex Message
  generateStockAnalysisMessage(
    analysisResult: AnalysisResult,
    language: SupportedLanguage = 'zh_TW'
  ): FlexComponent {
    const header = this.componentFactory.createHeader(
      analysisResult.symbol,
      analysisResult.marketType,
      language
    );

    const healthScoreCard = this.componentFactory.createHealthScoreCard(
      analysisResult.healthScore,
      language
    );

    const analysisCards = this.componentFactory.createAnalysisCards(analysisResult, language);

    const recommendationCard = this.componentFactory.createRecommendationCard(
      analysisResult.recommendation,
      language
    );

    const actionButtons = this.componentFactory.createActionButtons(
      analysisResult.symbol,
      language
    );

    return {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [header, healthScoreCard, analysisCards, recommendationCard, actionButtons],
    };
  }

  // 生成股票列表的 Flex Message
  generateStockListMessage(
    stocks: Array<{ symbol: string; name: string; price: number; change: number }>,
    language: SupportedLanguage = 'zh_TW'
  ): FlexComponent {
    const header = this.componentFactory.createListHeader(language);

    const stockItems = stocks.map(stock =>
      this.componentFactory.createStockListItem(stock, language)
    );

    const footer = this.componentFactory.createListFooter(language);

    return {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [header, ...stockItems, footer],
    };
  }

  // 生成錯誤訊息的 Flex Message
  generateErrorMessage(error: string, language: SupportedLanguage = 'zh_TW'): FlexComponent {
    const errorText = this.localizationService.getText(error, language);

    return {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        {
          type: 'text',
          text: this.localizationService.getText('error', language),
          size: 'lg',
          weight: 'bold',
          color: '#FF0000',
        },
        {
          type: 'text',
          text: errorText,
          size: 'md',
          color: '#666666',
          wrap: true,
        },
        {
          type: 'button',
          style: 'primary',
          action: {
            type: 'message',
            label: this.localizationService.getText('try_again', language),
            text: this.localizationService.getText('help', language),
          },
        },
      ],
    };
  }

  // 生成幫助訊息的 Flex Message
  generateHelpMessage(language: SupportedLanguage = 'zh_TW'): FlexComponent {
    const helpItems = [
      {
        title: this.localizationService.getText('search_stock', language),
        description: this.localizationService.getText('search_stock_desc', language),
        action: {
          type: 'message',
          label: this.localizationService.getText('search_stock', language),
          text: '搜尋 2330',
        },
      },
      {
        title: this.localizationService.getText('my_watchlist', language),
        description: this.localizationService.getText('watchlist_desc', language),
        action: {
          type: 'message',
          label: this.localizationService.getText('my_watchlist', language),
          text: '關注清單',
        },
      },
      {
        title: this.localizationService.getText('detailed_analysis', language),
        description: this.localizationService.getText('analysis_desc', language),
        action: {
          type: 'message',
          label: this.localizationService.getText('detailed_analysis', language),
          text: '詳細分析',
        },
      },
    ];

    const helpContents = helpItems.map(item => ({
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: item.title,
          size: 'md',
          weight: 'bold',
        },
        {
          type: 'text',
          text: item.description,
          size: 'sm',
          color: '#666666',
          wrap: true,
        },
        {
          type: 'button',
          style: 'link',
          action: item.action,
        },
      ],
    }));

    return {
      type: 'box',
      layout: 'vertical',
      spacing: 'lg',
      contents: [
        {
          type: 'text',
          text: this.localizationService.getText('help', language),
          size: 'xl',
          weight: 'bold',
          align: 'center',
        },
        ...(helpContents as FlexComponent[]),
      ],
    };
  }

  // 生成設定訊息的 Flex Message
  generateSettingsMessage(language: SupportedLanguage = 'zh_TW'): FlexComponent {
    const languageOptions = this.localizationService.getSupportedLanguages();

    const languageButtons = languageOptions.map(lang => ({
      type: 'button',
      style: lang === language ? 'primary' : 'secondary',
      action: {
        type: 'postback',
        label: this.getLanguageDisplayName(lang),
        data: `set_language:${lang}`,
      },
    }));

    return {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        {
          type: 'text',
          text: this.localizationService.getText('settings', language),
          size: 'xl',
          weight: 'bold',
          align: 'center',
        },
        {
          type: 'text',
          text: this.localizationService.getText('language', language),
          size: 'lg',
          weight: 'bold',
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: languageButtons as FlexComponent[],
        },
        {
          type: 'separator',
          margin: 'lg',
        },
        {
          type: 'button',
          style: 'secondary',
          action: {
            type: 'message',
            label: this.localizationService.getText('back_to_main', language),
            text: '主選單',
          },
        },
      ],
    };
  }

  // 生成歡迎訊息的 Flex Message
  generateWelcomeMessage(language: SupportedLanguage = 'zh_TW'): FlexComponent {
    return {
      type: 'box',
      layout: 'vertical',
      spacing: 'lg',
      contents: [
        {
          type: 'text',
          text: this.localizationService.getText('welcome', language),
          size: 'xl',
          weight: 'bold',
          align: 'center',
        },
        {
          type: 'text',
          text: this.localizationService.getText('welcome_desc', language),
          size: 'md',
          color: '#666666',
          align: 'center',
          wrap: true,
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'button',
              style: 'primary',
              action: {
                type: 'message',
                label: this.localizationService.getText('start_analysis', language),
                text: '開始分析',
              },
            },
            {
              type: 'button',
              style: 'secondary',
              action: {
                type: 'message',
                label: this.localizationService.getText('help', language),
                text: '幫助',
              },
            },
          ],
        },
      ],
    };
  }

  // 生成批量分析結果的 Flex Message
  generateBatchAnalysisMessage(
    analysisResults: AnalysisResult[],
    language: SupportedLanguage = 'zh_TW'
  ): FlexComponent {
    const header = {
      type: 'text',
      text: this.localizationService.getText('batch_analysis', language),
      size: 'xl',
      weight: 'bold',
      align: 'center',
    };

    const summary = this.generateBatchSummary(analysisResults, language);

    const stockCards = analysisResults.map(result =>
      this.componentFactory.createCompactStockCard(result, language)
    );

    return {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [header as FlexComponent, summary, ...stockCards],
    };
  }

  // 生成批量分析摘要
  private generateBatchSummary(
    results: AnalysisResult[],
    language: SupportedLanguage
  ): FlexComponent {
    const totalStocks = results.length;
    const avgHealthScore = Math.round(
      results.reduce((sum, r) => sum + r.healthScore, 0) / totalStocks
    );
    const buyRecommendations = results.filter(r => r.recommendation === 'BUY').length;

    return {
      type: 'box',
      layout: 'horizontal',
      spacing: 'md',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: totalStocks.toString(),
              size: 'xl',
              weight: 'bold',
              align: 'center',
            },
            {
              type: 'text',
              text: this.localizationService.getText('total_stocks', language),
              size: 'sm',
              color: '#666666',
              align: 'center',
            },
          ],
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: avgHealthScore.toString(),
              size: 'xl',
              weight: 'bold',
              align: 'center',
            },
            {
              type: 'text',
              text: this.localizationService.getText('avg_health_score', language),
              size: 'sm',
              color: '#666666',
              align: 'center',
            },
          ],
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: buyRecommendations.toString(),
              size: 'xl',
              weight: 'bold',
              align: 'center',
            },
            {
              type: 'text',
              text: this.localizationService.getText('buy_recommendations', language),
              size: 'sm',
              color: '#666666',
              align: 'center',
            },
          ],
        },
      ],
    };
  }

  // 獲取語言顯示名稱
  private getLanguageDisplayName(language: SupportedLanguage): string {
    const displayNames: Record<SupportedLanguage, string> = {
      zh_TW: '繁體中文',
      en_US: 'English',
      ja_JP: '日本語',
    };
    return displayNames[language];
  }

  // 生成完整的 Flex Message 物件
  generateCompleteFlexMessage(contents: FlexComponent, altText: string): FlexMessage {
    return {
      type: 'flex',
      altText: altText,
      contents: contents,
    };
  }

  // 生成多語系 Flex Message
  generateLocalizedFlexMessage(
    generator: (language: SupportedLanguage) => FlexComponent,
    _altTexts: Record<SupportedLanguage, string>
  ): LocalizedFlexMessage {
    const languages = this.localizationService.getSupportedLanguages();
    const result: LocalizedFlexMessage = {} as LocalizedFlexMessage;

    for (const language of languages) {
      result[language] = {
        type: 'flex',
        altText: 'Localized Message',
        contents: generator(language),
      };
    }

    return result;
  }
}
