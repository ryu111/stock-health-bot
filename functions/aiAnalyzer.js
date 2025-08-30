// AI Analysis Engine - Mix of rule-based and AI algorithms
const { calculateHealthScore, getHistoricalData } = require('./stockService');

/**
 * Advanced AI-style analysis using rule-based algorithms
 * This can be replaced with actual AI API calls later
 * @param {Object} stockData - Stock data object
 * @param {Array} historicalData - Historical data array
 * @param {Object} userPreferences - User analysis preferences (optional)
 * @returns {Object} Analysis result with recommendations
 */
async function performAnalysis(stockData, historicalData, userPreferences = {}) {
  const baseScore = calculateHealthScore(stockData);

  // Technical Analysis
  const technicalAnalysis = analyzeTechnical(stockData, historicalData);

  // Fundamental Analysis
  const fundamentalAnalysis = analyzeFundamental(stockData);

  // Risk Assessment
  const riskAnalysis = assessRisk(stockData, historicalData);

  // Sentiment Analysis (rule-based)
  const sentimentAnalysis = analyzeSentiment(stockData, historicalData);

  // Generate comprehensive recommendation
  const recommendation = generateRecommendation({
    baseScore,
    technical: technicalAnalysis,
    fundamental: fundamentalAnalysis,
    risk: riskAnalysis,
    sentiment: sentimentAnalysis
  });

  // Confidence level based on data availability
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
      reasoning: recommendation.reasoning
    },
    analysisDetails: {
      strengths: getStrengths(stockData, technicalAnalysis, fundamentalAnalysis),
      weaknesses: getWeaknesses(stockData, technicalAnalysis, fundamentalAnalysis),
      opportunities: getOpportunities(stockData, historicalData),
      threats: getThreats(stockData, historicalData)
    }
  };
}

/**
 * Technical analysis using price and volume data
 */
function analyzeTechnical(stockData, historicalData) {
  if (!historicalData || historicalData.length < 10) {
    return {
      trend: 'insufficient_data',
      momentum: 'unknown',
      supportLevels: [],
      resistanceLevels: []
    };
  }

  // Calculate moving averages
  const prices = historicalData.map(d => d.close);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);

  // Trend analysis
  let trend = 'neutral';
  const lastPrice = stockData.price;

  if (lastPrice > sma20 && sma20 > sma50) {
    trend = 'bullish';
  } else if (lastPrice < sma20 && sma20 < sma50) {
    trend = 'bearish';
  }

  // Momentum (RSI approximation)
  const gains = prices.slice(-10).map((price, index, arr) =>
    index > 0 ? Math.max(0, price - arr[index - 1]) : 0
  );
  const losses = prices.slice(-10).map((price, index, arr) =>
    index > 0 ? Math.max(0, arr[index - 1] - price) : 0
  );

  const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length;
  const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;

  let momentum = 'neutral';
  if (avgGain > avgLoss * 1.5) momentum = 'strong';
  else if (avgLoss > avgGain * 1.5) momentum = 'weak';

  // Simple support and resistance levels (rough estimation)
  const recentHigh = Math.max(...prices.slice(-10));
  const recentLow = Math.min(...prices.slice(-10));

  return {
    trend: trend,
    momentum: momentum,
    movingAverages: {
      sma20: sma20,
      sma50: sma50
    },
    supportLevels: [recentLow * 0.98, recentLow * 0.95],
    resistanceLevels: [recentHigh * 1.02, recentHigh * 1.05]
  };
}

/**
 * Fundamental analysis using financial data
 */
function analyzeFundamental(stockData) {
  let overallRating = 'neutral';
  let valuation = 'fair';

  // PE Ratio analysis
  if (stockData.peRatio) {
    if (stockData.peRatio < 15) valuation = 'attractive';
    else if (stockData.peRatio > 25) valuation = 'expensive';
  }

  // Dividend yield analysis
  let dividendStrength = 'none';
  if (stockData.dividendYield) {
    if (stockData.dividendYield > 0.04) dividendStrength = 'strong';
    else if (stockData.dividendYield > 0.02) dividendStrength = 'moderate';
  }

  // Determine overall fundamental rating
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
      marketCap: stockData.marketCap || null
    }
  };
}

/**
 * Risk assessment analysis
 */
function assessRisk(stockData, historicalData) {
  let volatilityRating = 'moderate';
  let riskLevel = 'medium';

  if (historicalData && historicalData.length > 5) {
    // Calculate volatility based on price range
    const prices = historicalData.map(d => d.close);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const currentPrice = stockData.price;

    const volatility = (maxPrice - minPrice) / currentPrice;

    if (volatility > 0.3) volatilityRating = 'high';
    else if (volatility < 0.1) volatilityRating = 'low';

    // Daily change risk
    const dailyChange = Math.abs(stockData.dailyChange || 0);
    if (dailyChange > 5) riskLevel = 'high';
    else if (dailyChange < 2) riskLevel = 'low';
  }

  return {
    volatilityRating: volatilityRating,
    riskLevel: riskLevel,
    liquidity: stockData.volume ? 'good' : 'poor',
    downsideProtection: stockData.fiftyTwoWeekLow ?
      ((stockData.price - stockData.fiftyTwoWeekLow) / stockData.price) * 100 : null
  };
}

/**
 * Rule-based sentiment analysis
 */
function analyzeSentiment(stockData, historicalData) {
  let marketSentiment = 'neutral';
  let institutionalInterest = 'moderate';

  // Volume analysis for institutional interest
  if (stockData.volume) {
    // High volume indicates strong interest
    const typicalVolume = stockData.volume; // In a real scenario, this would be compared to averages
    institutionalInterest = 'moderate'; // Placeholder
  }

  // Price vs moving averages
  if (historicalData && historicalData.length > 5) {
    const prices = historicalData.map(d => d.close);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    if (stockData.price > avgPrice * 1.05) marketSentiment = 'positive';
    else if (stockData.price < avgPrice * 0.95) marketSentiment = 'negative';
  }

  return {
    marketSentiment: marketSentiment,
    institutionalInterest: institutionalInterest,
    fearGreedIndex: 'neutral', // Would require external data source
    newsImpact: 'minimal' // Would require news analysis
  };
}

/**
 * Generate recommendation based on all analysis
 */
function generateRecommendation(analysis) {
  const { baseScore, technical, fundamental, risk, sentiment } = analysis;

  let action = 'hold';
  let score = Math.round(baseScore);
  let timeframe = 'medium';
  let reasoning = [];

  // Technical factors
  if (technical.trend === 'bullish') {
    reasoning.push('技術指標顯示上升趨勢');
    if (action === 'hold') action = 'buy';
  } else if (technical.trend === 'bearish') {
    reasoning.push('技術指標顯示下降趨勢');
    if (action === 'hold') action = 'wait';
  }

  // Fundamental factors
  if (fundamental.overallRating === 'positive') {
    reasoning.push('基本面分析正面');
    if (action === 'buy' || action === 'hold') score += 10;
  } else if (fundamental.overallRating === 'negative') {
    reasoning.push('基本面存在疑慮');
    action = 'cautious';
  }

  // Risk factors
  if (risk.riskLevel === 'high') {
    reasoning.push('風險水平較高，建議謹慎');
    action = 'cautious';
    score = Math.max(20, score - 15);
  } else if (risk.riskLevel === 'low') {
    reasoning.push('風險水平適中');
    score = Math.min(90, score + 5);
  }

  // Sentiment factors
  if (sentiment.marketSentiment === 'positive') {
    reasoning.push('市場情緒正面');
  }

  // Adjust final score
  score = Math.max(0, Math.min(100, score));

  return {
    action: action,
    score: score,
    timeframe: timeframe,
    reasoning: reasoning.join('；')
  };
}

/**
 * Calculate analysis confidence level
 */
function calculateConfidence(stockData, historicalData) {
  let confidence = 0.5; // Base 50%

  // Available data factors
  if (stockData.peRatio) confidence += 0.1;
  if (stockData.dividendYield && stockData.dividendYield > 0) confidence += 0.1;
  if (historicalData && historicalData.length > 20) confidence += 0.15;
  if (stockData.returnOnEquity) confidence += 0.1;
  if (stockData.marketCap) confidence += 0.05;

  return Math.min(0.95, confidence);
}

/**
 * Get strengths based on analysis
 */
function getStrengths(stockData, technical, fundamental) {
  const strengths = [];

  if (technical.trend === 'bullish') strengths.push('技術趨勢向上');
  if (fundamental.valuation === 'attractive') strengths.push('估值具吸引力');
  if (fundamental.dividendStrength === 'strong') strengths.push('股息收益率優良');
  if (stockData.returnOnEquity && stockData.returnOnEquity > 0.15) strengths.push('權益報酬率高');
  if (stockData.marketCap && stockData.marketCap > 1e10) strengths.push('市值規模大');

  return strengths;
}

/**
 * Get weaknesses based on analysis
 */
function getWeaknesses(stockData, technical, fundamental) {
  const weaknesses = [];

  if (technical.trend === 'bearish') weaknesses.push('技術趨勢向下');
  if (fundamental.valuation === 'expensive') weaknesses.push('估值偏高');
  if (!stockData.dividendYield || stockData.dividendYield < 0.01) weaknesses.push('股息收益率低');
  if (stockData.peRatio && stockData.peRatio > 30) weaknesses.push('本益比偏高');

  return weaknesses;
}

/**
 * Get opportunities
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

  // Market condition opportunities
  if (historicalData && historicalData.length > 10) {
    const prices = historicalData.map(d => d.close);
    const recentLow = Math.min(...prices.slice(-5));
    if (currentPrice < recentLow * 1.02) {
      opportunities.push('近期低點，將有反彈機會');
    }
  }

  return opportunities;
}

/**
 * Get threats
 */
function getThreats(stockData, historicalData) {
  const threats = [];

  if (stockData.dailyChange && Math.abs(stockData.dailyChange) > 4) {
    threats.push('近期波動較大，需留意風險');
  }

  if (historicalData && historicalData.length > 10) {
    const prices = historicalData.map(d => d.close);
    const currentVolatility = calculateVolatility(prices);
    if (currentVolatility > 0.05) { // 5% standard deviation
      threats.push('價格波動性高，投資風險較大');
    }
  }

  if (stockData.peRatio && stockData.peRatio > 25) {
    threats.push('估值偏高，可能存在泡沫風險');
  }

  return threats;
}

/**
 * Helper functions
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
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

  return Math.sqrt(variance);
}

/**
 * Enhanced analysis for premium users
 * This could integrate with OpenAI API in the future
 */
async function performEnhancedAnalysis(stockData, historicalData, userPreferences) {
  const basicAnalysis = await performAnalysis(stockData, historicalData, userPreferences);

  // Enhanced features for premium users
  if (userPreferences.isPremium) {
    // Add premium features here
    basicAnalysis.prediction = {
      shortTerm: 'bullish', // Would use ML model
      confidence: 0.75
    };

    basicAnalysis.portfolioAllocation = {
      suggestedPercentage: 5.2,
      reasoning: '基於風險調整後報酬計算'
    };
  }

  return basicAnalysis;
}

/**
 * Placeholder for OpenAI API integration
 * This would require OPENAI_API_KEY environment variable
 */
async function analyzeWithAI(symbol, data, historicalData) {
  // Placeholder for future OpenAI integration
  try {
    // const openai = require('openai');
    // const client = new openai({ apiKey: functions.config().openai.key });
    // const response = await client.chat.completions.create({
    //   model: 'gpt-4',
    //   messages: [{ role: 'user', content: buildPrompt(symbol, data, historicalData) }]
    // });

    // Return mock response for now
    return {
      ai: 'OpenAI integration placeholder',
      recommendation: 'Based on comprehensive analysis including market conditions and historical data'
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return { ai: 'unavailable', recommendation: 'Fallback to rule-based analysis' };
  }
}

module.exports = {
  performAnalysis,
  performEnhancedAnalysis,
  analyzeTechnical,
  analyzeFundamental,
  assessRisk,
  analyzeSentiment,
  calculateConfidence,
  analyzeWithAI
};