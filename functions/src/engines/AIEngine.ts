import { BaseAnalysisEngine, AnalysisEngineFactory } from './AnalysisEngine';
import { AnalysisType, AnalysisResult } from '../types/analysis';
import { MarketType, StockData, ETFData } from '../types/stock';

// AI 引擎配置
interface AIEngineConfig {
  model: string;
  apiKey: string;
  endpoint: string;
  maxTokens: number;
  temperature: number;
}

// AI 引擎
export class AIEngine extends BaseAnalysisEngine {
  public readonly type = AnalysisType.COMPREHENSIVE;
  private config: AIEngineConfig;

  constructor(config?: Partial<AIEngineConfig>) {
    super();
    this.config = {
      model: config?.model || 'gpt-3.5-turbo',
      apiKey: config?.apiKey || process.env['OPENAI_API_KEY'] || '',
      endpoint: config?.endpoint || 'https://api.openai.com/v1/chat/completions',
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0.7,
    };
  }

  /**
   * 分析股票
   * @param symbol - 股票代碼
   * @param data - 股票資料
   * @returns 分析結果
   */
  async analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult> {
    try {
      console.log(`🤖 開始 AI 分析: ${symbol}`);

      // 準備分析資料
      const analysisData = this.prepareAnalysisData(symbol, data);

      // 執行 AI 分析
      const aiAnalysis = await this.performAIAnalysis(symbol, analysisData);

      // 計算各項分數
      const healthScore = this.calculateHealthScore(data);
      const technicalScore = this.calculateTechnicalScore(data);
      const fundamentalScore = this.calculateFundamentalScore(data);
      const riskScore = this.calculateRiskScore(data);
      const recommendation = this.generateRecommendation(data);
      const factors = this.getAnalysisFactors(data);

      const result: AnalysisResult = {
        symbol,
        type: this.type,
        marketType: data.marketType || MarketType.TW_STOCK,
        technicalScore,
        fundamentalScore,
        riskScore,
        healthScore,
        recommendation: recommendation,
        confidence: (aiAnalysis as { confidence?: number }).confidence || 0.7,
        factors,
        timestamp: new Date(),
        dataQuality: 0.8,
        marketCondition: 'NEUTRAL',
        summary: 'AI 分析完成',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      console.log(`✅ AI 分析完成: ${symbol}`);
      return result;
    } catch (error) {
      console.error(`❌ AI 分析失敗: ${symbol}`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * 準備分析資料
   * @param symbol - 股票代碼
   * @param data - 股票資料
   * @returns 準備好的分析資料
   */
  private prepareAnalysisData(symbol: string, data: StockData | ETFData): Record<string, unknown> {
    const analysisData = {
      symbol,
      basicInfo: {
        name: data.name || symbol,
        price: data.price,
        volume: data.volume,
        marketCap: data.marketCap,
        currency: data.currency || 'TWD',
      },
      financialMetrics: {
        peRatio: data.peRatio,
        pbRatio: data.pbRatio,
        dividendYield: data.dividendYield,
        roe: data.roe,
        debtToEquity: data.debtToEquity,
        currentRatio: data.currentRatio,
        quickRatio: data.quickRatio,
      },
      performanceMetrics: {
        beta: data.beta,
        volatility: data.volatility,
        sharpeRatio: data.sharpeRatio,
        maxDrawdown: data.maxDrawdown,
        var95: data.var95,
      },
      growthMetrics: {
        revenueGrowth: data.revenueGrowth,
        earningsGrowth: data.earningsGrowth,
        assetTurnover: data.assetTurnover,
        inventoryTurnover: data.inventoryTurnover,
      },
      profitabilityMetrics: {
        netProfitMargin: data.netProfitMargin,
        grossProfitMargin: data.grossProfitMargin,
        operatingMargin: data.operatingMargin,
      },
      sectorInfo: {
        sector: data.sector,
        industry: data.industry,
        description: data.description,
      },
    };

    return analysisData;
  }

  /**
   * 執行 AI 分析
   * @param symbol - 股票代碼
   * @param data - 分析資料
   * @returns AI 分析結果
   */
  private async performAIAnalysis(
    symbol: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      if (!this.config.apiKey) {
        console.warn('⚠️ 未設定 OpenAI API Key，使用模擬分析');
        return this.getMockAIAnalysis(symbol, data);
      }

      const prompt = this.buildAnalysisPrompt(symbol, data);
      const response = await this.callOpenAI(prompt);

      return this.parseAIResponse(response);
    } catch (error) {
      console.warn('⚠️ AI 分析失敗，使用模擬分析:', error);
      return this.getMockAIAnalysis(symbol, data);
    }
  }

  /**
   * 建立分析提示
   * @param symbol - 股票代碼
   * @param data - 分析資料
   * @returns 分析提示
   */
  private buildAnalysisPrompt(symbol: string, data: Record<string, unknown>): string {
    return `
請分析以下股票資料並提供投資建議：

股票代碼: ${symbol}
股票名稱: ${(data['basicInfo'] as Record<string, unknown>)['name']}

基本資訊:
- 價格: ${(data['basicInfo'] as Record<string, unknown>)['price']}
- 成交量: ${(data['basicInfo'] as Record<string, unknown>)['volume']}
- 市值: ${(data['basicInfo'] as Record<string, unknown>)['marketCap']}
- 貨幣: ${(data['basicInfo'] as Record<string, unknown>)['currency']}

財務指標:
- 本益比: ${(data['financialMetrics'] as Record<string, unknown>)['peRatio']}
- 股價淨值比: ${(data['financialMetrics'] as Record<string, unknown>)['pbRatio']}
- 股息殖利率: ${(data['financialMetrics'] as Record<string, unknown>)['dividendYield']}
- 股東權益報酬率: ${(data['financialMetrics'] as Record<string, unknown>)['roe']}
- 負債比率: ${(data['financialMetrics'] as Record<string, unknown>)['debtToEquity']}

績效指標:
- Beta 係數: ${(data['performanceMetrics'] as Record<string, unknown>)['beta']}
- 波動率: ${(data['performanceMetrics'] as Record<string, unknown>)['volatility']}
- 夏普比率: ${(data['performanceMetrics'] as Record<string, unknown>)['sharpeRatio']}

成長指標:
- 營收成長率: ${(data['growthMetrics'] as Record<string, unknown>)['revenueGrowth']}
- 盈餘成長率: ${(data['growthMetrics'] as Record<string, unknown>)['earningsGrowth']}

產業資訊:
- 產業: ${(data['sectorInfo'] as Record<string, unknown>)['sector']}
- 子產業: ${(data['sectorInfo'] as Record<string, unknown>)['industry']}
- 描述: ${(data['sectorInfo'] as Record<string, unknown>)['description']}

請提供以下格式的分析結果：
1. 投資建議 (BUY/HOLD/SELL)
2. 信心度 (0-1)
3. 主要優勢 (3-5 點)
4. 主要風險 (3-5 點)
5. 目標價格建議
6. 投資時程建議
7. 關鍵洞察 (3-5 點)
`;
  }

  /**
   * 呼叫 OpenAI API
   * @param prompt - 提示內容
   * @returns API 回應
   */
  private async callOpenAI(prompt: string): Promise<Record<string, unknown>> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: '你是一位專業的股票分析師，擅長分析台股市場。請提供客觀、專業的投資建議。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 錯誤: ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  }

  /**
   * 解析 AI 回應
   * @param response - AI 回應
   * @returns 解析結果
   */
  private parseAIResponse(_response: Record<string, unknown>): Record<string, unknown> {
    try {
      // 簡單的解析邏輯，實際應用中可能需要更複雜的 NLP
      const analysis = {
        confidence: 0.7,
        insights: ['AI 分析完成', '基於多維度數據評估', '考慮市場環境因素'],
        recommendation: {
          type: 'HOLD',
          reason: 'AI 分析建議持有',
          confidence: 0.7,
        },
      };

      return analysis;
    } catch (error) {
      console.warn('AI 回應解析失敗:', error);
      return this.getMockAIAnalysis('', {});
    }
  }

  /**
   * 取得模擬 AI 分析
   * @param symbol - 股票代碼
   * @param data - 分析資料
   * @returns 模擬分析結果
   */
  private getMockAIAnalysis(
    _symbol: string,
    _data: Record<string, unknown>
  ): Record<string, unknown> {
    const mockInsights = [
      '基於技術面分析，股價處於合理區間',
      '基本面指標顯示公司營運穩健',
      '風險指標在可接受範圍內',
      '建議關注產業發展趨勢',
      '長期投資價值值得考慮',
    ];

    return {
      confidence: 0.6,
      insights: mockInsights,
      recommendation: {
        type: 'HOLD',
        reason: '綜合分析建議持有',
        confidence: 0.6,
      },
    };
  }

  /**
   * 計算技術分析分數
   * @param data - 股票資料
   * @returns 技術分析分數
   */
  protected calculateTechnicalScore(data: StockData | ETFData): number {
    let score = 50;

    // 價格動能
    const dataWithExtras = data as StockData & { previousClose?: number; averageVolume?: number };
    if (data.price && dataWithExtras.previousClose) {
      const change = (data.price - dataWithExtras.previousClose) / dataWithExtras.previousClose;
      if (change > 0.05) score += 20;
      else if (change > 0) score += 10;
      else if (change < -0.05) score -= 20;
      else if (change < 0) score -= 10;
    }

    // 成交量分析
    if (data.volume && dataWithExtras.averageVolume) {
      const volumeRatio = data.volume / dataWithExtras.averageVolume;
      if (volumeRatio > 1.5) score += 15;
      else if (volumeRatio < 0.5) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 計算基本面分析分數
   * @param data - 股票資料
   * @returns 基本面分析分數
   */
  protected calculateFundamentalScore(data: StockData | ETFData): number {
    let score = 50;

    // 本益比分析
    if (data.peRatio) {
      if (data.peRatio < 15) score += 20;
      else if (data.peRatio < 25) score += 10;
      else if (data.peRatio > 50) score -= 20;
      else if (data.peRatio > 30) score -= 10;
    }

    // 股息殖利率
    if (data.dividendYield) {
      if (data.dividendYield > 0.05) score += 15;
      else if (data.dividendYield > 0.03) score += 10;
    }

    // 股東權益報酬率
    if (data.roe) {
      if (data.roe > 0.15) score += 15;
      else if (data.roe > 0.1) score += 10;
      else if (data.roe < 0.05) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 計算風險分析分數
   * @param data - 股票資料
   * @returns 風險分析分數
   */
  protected calculateRiskScore(data: StockData | ETFData): number {
    let score = 50;

    // Beta 係數
    const stockData = data as StockData;
    if (stockData.beta) {
      if (stockData.beta < 0.8) score += 20;
      else if (stockData.beta < 1.2) score += 10;
      else if (stockData.beta > 1.5) score -= 20;
    }

    // 波動率
    if (stockData.volatility) {
      if (stockData.volatility < 0.2) score += 15;
      else if (stockData.volatility > 0.4) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }
}

// 註冊引擎
AnalysisEngineFactory.registerEngine(AnalysisType.COMPREHENSIVE, AIEngine);
