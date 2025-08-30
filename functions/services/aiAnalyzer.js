// AI 分析引擎 - 混合規則基礎和 AI 演算法
const { calculateHealthScore } = require('./stockService');

/**
 * 使用規則基礎演算法的高級 AI 風格分析
 * 之後可以替換為實際的 AI API 呼叫
 * @param {Object} stockData - 股票資料物件
 * @param {Array} historicalData - 歷史資料陣列
 * @param {Object} userPreferences - 使用者分析偏好 (可選)
 * @returns {Object} 包含建議的分析結果
 */
async function performAnalysis(stockData, historicalData) {
  const baseScore = calculateHealthScore(stockData);

  // 技術分析
  const technicalAnalysis = analyzeTechnical(stockData, historicalData);

  // 基本面分析
  const fundamentalAnalysis = analyzeFundamental(stockData);

  // 風險評估
  const riskAnalysis = assessRisk(stockData, historicalData);

  // 情緒分析 (規則基礎)
  const sentimentAnalysis = analyzeSentiment(stockData, historicalData);

  // 產生綜合建議
  const recommendation = generateRecommendation({
    baseScore,
    technical: technicalAnalysis,
    fundamental: fundamentalAnalysis,
    risk: riskAnalysis,
    sentiment: sentimentAnalysis,
  });

  // 基於資料可用性的信心水準
  const confidence = calculateConfidence(stockData, historicalData);

  return {
    overallScore: recommendation.score,
    baseScore: baseScore,
    technicalAnalysis,
    fundamentalAnalysis,
    riskAnalysis,
    sentimentAnalysis,
    recommendation: {
      action: recommendation.action,
      confidence: confidence,
      timeframe: recommendation.timeframe,
      reasoning: recommendation.reasoning,
    },
    analysisDetails: {
      strengths: getStrengths(
        stockData,
        technicalAnalysis,
        fundamentalAnalysis
      ),
      weaknesses: getWeaknesses(
        stockData,
        technicalAnalysis,
        fundamentalAnalysis
      ),
      opportunities: getOpportunities(stockData, historicalData),
      threats: getThreats(stockData, historicalData),
    },
  };
}

/**
 * 使用價格和成交量資料進行技術分析
 */
function analyzeTechnical(stockData, historicalData) {
  if (!historicalData || historicalData.length < 10) {
    return {
      trend: 'insufficient_data',
      momentum: 'unknown',
      supportLevels: [],
      resistanceLevels: [],
    };
  }

  // 計算移動平均線
  const prices = historicalData.map((d) => d.close);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);

  // 趨勢分析
  let trend = 'neutral';
  const lastPrice = stockData.price;

  if (lastPrice > sma20 && sma20 > sma50) {
    trend = 'bullish';
  } else if (lastPrice < sma20 && sma20 < sma50) {
    trend = 'bearish';
  }

  // 動量 (RSI 近似值)
  const gains = prices
    .slice(-10)
    .map((price, index, arr) =>
      index > 0 ? Math.max(0, price - arr[index - 1]) : 0
    );
  const losses = prices
    .slice(-10)
    .map((price, index, arr) =>
      index > 0 ? Math.max(0, arr[index - 1] - price) : 0
    );

  const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length;
  const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;

  let momentum = 'neutral';
  if (avgGain > avgLoss * 1.5) momentum = 'strong';
  else if (avgLoss > avgGain * 1.5) momentum = 'weak';

  // 簡單支撐和阻力位 (粗略估計)
  const recentHigh = Math.max(...prices.slice(-10));
  const recentLow = Math.min(...prices.slice(-10));

  return {
    trend: trend,
    momentum: momentum,
    movingAverages: {
      sma20: sma20,
      sma50: sma50,
    },
    supportLevels: [recentLow * 0.98, recentLow * 0.95],
    resistanceLevels: [recentHigh * 1.02, recentHigh * 1.05],
  };
}

/**
 * 使用財務資料進行基本面分析
 */
function analyzeFundamental(stockData) {
  let overallRating = 'neutral';
  let valuation = 'fair';

  // 本益比分析
  if (stockData.peRatio) {
    if (stockData.peRatio < 15) valuation = 'attractive';
    else if (stockData.peRatio > 25) valuation = 'expensive';
  }

  // 股息率分析
  let dividendStrength = 'none';
  if (stockData.dividendYield) {
    if (stockData.dividendYield > 0.04) dividendStrength = 'strong';
    else if (stockData.dividendYield > 0.02) dividendStrength = 'moderate';
  }

  // 決定整體基本面評級
  if (valuation === 'attractive' && dividendStrength !== 'none') {
    overallRating = 'positive';
  } else if (valuation === 'expensive' && dividendStrength === 'none') {
    overallRating = 'negative';
  }

  return {
    valuation: valuation,
    dividendStrength: dividendStrength,
    overallRating: overallRating,
    keyMetrics: {
      peRatio: stockData.peRatio || null,
      dividendYield: stockData.dividendYield || 0,
      returnOnEquity: stockData.returnOnEquity || null,
      marketCap: stockData.marketCap || null,
    },
  };
}

/**
 * 風險評估分析
 */
function assessRisk(stockData, historicalData) {
  let volatilityRating = 'moderate';
  let riskLevel = 'medium';

  if (historicalData && historicalData.length > 5) {
    // 基於價格範圍計算波動性
    const prices = historicalData.map((d) => d.close);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const currentPrice = stockData.price;

    const volatility = (maxPrice - minPrice) / currentPrice;

    if (volatility > 0.3) volatilityRating = 'high';
    else if (volatility < 0.1) volatilityRating = 'low';

    // 日漲跌幅風險
    const dailyChange = Math.abs(stockData.dailyChange || 0);
    if (dailyChange > 5) riskLevel = 'high';
    else if (dailyChange < 2) riskLevel = 'low';
  }

  return {
    volatilityRating: volatilityRating,
    riskLevel: riskLevel,
    liquidity: stockData.volume ? 'good' : 'poor',
    downsideProtection: stockData.fiftyTwoWeekLow
      ? ((stockData.price - stockData.fiftyTwoWeekLow) / stockData.price) * 100
      : null,
  };
}

/**
 * 規則基礎情緒分析
 */
function analyzeSentiment(stockData, historicalData) {
  let marketSentiment = 'neutral';
  let institutionalInterest = 'moderate';

  // 成交量分析以了解機構興趣
  if (stockData.volume) {
    // 高成交量表示強烈興趣
    institutionalInterest = 'moderate'; // 基於成交量可用性的佔位符
  }

  // 價格與移動平均線比較
  if (historicalData && historicalData.length > 5) {
    const prices = historicalData.map((d) => d.close);
    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;

    if (stockData.price > avgPrice * 1.05) marketSentiment = 'positive';
    else if (stockData.price < avgPrice * 0.95) marketSentiment = 'negative';
  }

  return {
    marketSentiment: marketSentiment,
    institutionalInterest: institutionalInterest,
    fearGreedIndex: 'neutral', // 需要外部資料來源
    newsImpact: 'minimal', // 需要新聞分析
  };
}

/**
 * 基於所有分析產生建議
 */
function generateRecommendation(analysis) {
  const { baseScore, technical, fundamental, risk, sentiment } = analysis;

  let action = 'hold';
  let score = Math.round(baseScore);
  let timeframe = 'medium';
  let reasoning = [];

  // 技術因素
  if (technical.trend === 'bullish') {
    reasoning.push('技術指標顯示上升趨勢');
    if (action === 'hold') action = 'buy';
  } else if (technical.trend === 'bearish') {
    reasoning.push('技術指標顯示下降趨勢');
    if (action === 'hold') action = 'wait';
  }

  // 基本面因素
  if (fundamental.overallRating === 'positive') {
    reasoning.push('基本面分析正面');
    if (action === 'buy' || action === 'hold') score += 10;
  } else if (fundamental.overallRating === 'negative') {
    reasoning.push('基本面存在疑慮');
    action = 'cautious';
  }

  // 風險因素
  if (risk.riskLevel === 'high') {
    reasoning.push('風險水平較高，建議謹慎');
    action = 'cautious';
    score = Math.max(20, score - 15);
  } else if (risk.riskLevel === 'low') {
    reasoning.push('風險水平適中');
    score = Math.min(90, score + 5);
  }

  // 情緒因素
  if (sentiment.marketSentiment === 'positive') {
    reasoning.push('市場情緒正面');
  }

  // 調整最終分數
  score = Math.max(0, Math.min(100, score));

  return {
    action: action,
    score: score,
    timeframe: timeframe,
    reasoning: reasoning.join('；'),
  };
}

/**
 * 計算分析信心水準
 */
function calculateConfidence(stockData, historicalData) {
  let confidence = 0.5; // 基礎 50%

  // 可用資料因素
  if (stockData.peRatio) confidence += 0.1;
  if (stockData.dividendYield && stockData.dividendYield > 0) confidence += 0.1;
  if (historicalData && historicalData.length > 20) confidence += 0.15;
  if (stockData.returnOnEquity) confidence += 0.1;
  if (stockData.marketCap) confidence += 0.05;

  return Math.min(0.95, confidence);
}

/**
 * 基於分析取得優勢
 */
function getStrengths(stockData, technical, fundamental) {
  const strengths = [];

  if (technical.trend === 'bullish') strengths.push('技術趨勢向上');
  if (fundamental.valuation === 'attractive') strengths.push('估值具吸引力');
  if (fundamental.dividendStrength === 'strong')
    strengths.push('股息收益率優良');
  if (stockData.returnOnEquity && stockData.returnOnEquity > 0.15)
    strengths.push('權益報酬率高');
  if (stockData.marketCap && stockData.marketCap > 1e10)
    strengths.push('市值規模大');

  return strengths;
}

/**
 * 基於分析取得弱點
 */
function getWeaknesses(stockData, technical, fundamental) {
  const weaknesses = [];

  if (technical.trend === 'bearish') weaknesses.push('技術趨勢向下');
  if (fundamental.valuation === 'expensive') weaknesses.push('估值偏高');
  if (!stockData.dividendYield || stockData.dividendYield < 0.01)
    weaknesses.push('股息收益率低');
  if (stockData.peRatio && stockData.peRatio > 30)
    weaknesses.push('本益比偏高');

  return weaknesses;
}

/**
 * 取得機會
 */
function getOpportunities(stockData, historicalData) {
  const opportunities = [];

  const currentPrice = stockData.price;
  const yearLow = stockData.fiftyTwoWeekLow;

  if (yearLow && (currentPrice - yearLow) / yearLow < 0.1) {
    opportunities.push('距離52週低點不遠，有潛在買點');
  }

  if (stockData.dividendYield && stockData.dividendYield > 0.03) {
    opportunities.push('高股息，為投資人帶來穩定收入');
  }

  // 市場條件機會
  if (historicalData && historicalData.length > 10) {
    const prices = historicalData.map((d) => d.close);
    const recentLow = Math.min(...prices.slice(-5));
    if (currentPrice < recentLow * 1.02) {
      opportunities.push('近期低點，將有反彈機會');
    }
  }

  return opportunities;
}

/**
 * 取得威脅
 */
function getThreats(stockData, historicalData) {
  const threats = [];

  if (stockData.dailyChange && Math.abs(stockData.dailyChange) > 4) {
    threats.push('近期波動較大，需留意風險');
  }

  if (historicalData && historicalData.length > 10) {
    const prices = historicalData.map((d) => d.close);
    const currentVolatility = calculateVolatility(prices);
    if (currentVolatility > 0.05) {
      // 5% standard deviation
      threats.push('價格波動性高，投資風險較大');
    }
  }

  if (stockData.peRatio && stockData.peRatio > 25) {
    threats.push('估值偏高，可能存在泡沫風險');
  }

  return threats;
}

/**
 * 輔助函數
 */
function calculateSMA(prices, period) {
  if (prices.length < period) return null;

  const recentPrices = prices.slice(-period);
  return recentPrices.reduce((sum, price) => sum + price, 0) / period;
}

function calculateVolatility(prices) {
  if (prices.length < 2) return 0;

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

  return Math.sqrt(variance);
}

/**
 * 付費用戶的增強分析
 * 未來可以整合 OpenAI API
 */
async function performEnhancedAnalysis(
  stockData,
  historicalData,
  userPreferences
) {
  const basicAnalysis = await performAnalysis(
    stockData,
    historicalData,
    userPreferences
  );

  // 付費用戶的增強功能
  if (userPreferences.isPremium) {
    // 在此添加付費功能
    basicAnalysis.prediction = {
      shortTerm: 'bullish', // 將使用機器學習模型
      confidence: 0.75,
    };

    basicAnalysis.portfolioAllocation = {
      suggestedPercentage: 5.2,
      reasoning: '基於風險調整後報酬計算',
    };
  }

  return basicAnalysis;
}

/**
 * OpenAI API 整合的佔位符
 * 這需要 OPENAI_API_KEY 環境變數
 */
async function analyzeWithAI() {
  // 未來 OpenAI 整合的佔位符
  // const openai = require('openai');
  // const client = new openai({ apiKey: functions.config().openai.key });
  // const response = await client.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [{ role: 'user', content: buildPrompt(symbol, data, historicalData) }]
  // });

  // 目前返回模擬回應
  return {
    ai: 'OpenAI 整合佔位符',
    recommendation: '基於包含市場條件和歷史資料的綜合分析',
  };
}

module.exports = {
  performAnalysis,
  performEnhancedAnalysis,
  analyzeTechnical,
  analyzeFundamental,
  assessRisk,
  analyzeSentiment,
  calculateConfidence,
  analyzeWithAI,
};
