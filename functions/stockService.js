// 股票資料服務
const yahooFinance = require('yahoo-finance2').default;
const admin = require('firebase-admin');

// 取得 Firestore 參考的函數 (確保 admin 已初始化)
function getFirestore() {
  return admin.firestore();
}

// 快取持續時間 (5 分鐘)
const CACHE_DURATION = 5 * 60 * 1000;

// 快取持續時間 (5 分鐘)

/**
 * 取得股票資料並快取
 * @param {string} symbol - 股票代碼 (例如: '2330.TW')
 * @returns {Promise<Object>} 股票資料物件
 */
async function getStockData(symbol) {
  try {
    // 先檢查快取
    const cacheKey = `stock_${symbol}`;
    const cacheDoc = await getFirestore()
      .collection('stockCache')
      .doc(cacheKey)
      .get();

    if (cacheDoc.exists) {
      const cachedData = cacheDoc.data();
      const cacheTime = new Date(cachedData.timestamp);
      const now = new Date();

      if (now.getTime() - cacheTime.getTime() < CACHE_DURATION) {
        console.log(`Using cached data for ${symbol}`);
        return cachedData.data;
      }
    }

    // 從 Yahoo Finance 取得資料，改善處理方式
    let quote;
    // const isETF = /\d{4}/.test(symbol.replace('.TW', '')); // ETF 偵測，供未來使用

    try {
      // 預設 API 呼叫
      quote = await yahooFinance.quote(symbol);
    } catch (error) {
      console.warn(`First attempt failed for ${symbol}:`, error.message);

      // 嘗試不使用 .TW 以支援潛在的 ETF 或國際代碼
      if (symbol.endsWith('.TW')) {
        const altSymbol = symbol.replace('.TW', '');
        try {
          quote = await yahooFinance.quote(altSymbol);
          console.log(
            `✅ Found data for ${altSymbol} (used instead of ${symbol})`
          );
        } catch (altError) {
          console.warn(
            `Alternative symbol ${altSymbol} also failed:`,
            altError.message
          );
        }
      }

      // 如果仍然沒有資料，嘗試 ETF 特定模組
      if (!quote) {
        try {
          quote = await yahooFinance.quote(symbol, {
            modules: ['price', 'summaryDetail', 'fundProfile', 'assetProfile'],
          });
          console.log(`✅ Found ETF data for ${symbol}`);
        } catch (etfError) {
          console.error(`All attempts failed for ${symbol}:`, etfError.message);
          throw new Error(
            `無法取得 ${symbol} 的數據。請確認代碼正確性或稍後再試。`
          );
        }
      }
    }

    if (!quote) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    // 增強資料處理
    const stockData = processStockQuoteData(quote);

    // 計算額外指標
    stockData.dailyChange = calculatePercentageChange(
      quote.regularMarketPrice,
      quote.regularMarketPreviousClose
    );
    stockData.priceToBook = quote.priceToBook || null;
    stockData.returnOnEquity = quote.returnOnEquity || null;

    // 快取資料
    await getFirestore().collection('stockCache').doc(cacheKey).set({
      data: stockData,
      timestamp: new Date().toISOString(),
    });

    return stockData;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);

    // 即使過期也嘗試從快取取得
    try {
      const cacheDoc = await getFirestore()
        .collection('stockCache')
        .doc(`stock_${symbol}`)
        .get();
      if (cacheDoc.exists) {
        console.log(`Using expired cache for ${symbol}`);
        return cacheDoc.data().data;
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError.message);
    }

    throw new Error(`Unable to fetch data for symbol: ${symbol}`);
  }
}

/**
 * 基於多個指標計算健康分數
 * @param {Object} data - 股票資料物件
 * @returns {number} 健康分數 (0-100)
 */
function calculateHealthScore(data) {
  let score = 50; // Base score

  // Price vs 52-week range (30% weight)
  if (data.price && data.fiftyTwoWeekLow && data.fiftyTwoWeekHigh) {
    const pricePosition =
      (data.price - data.fiftyTwoWeekLow) /
      (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow);
    if (pricePosition < 0.3) {
      score += 20; // Oversold - good buying opportunity
    } else if (pricePosition > 0.7) {
      score -= 15; // Overbought - potential concern
    }
  }

  // PE Ratio analysis (20% weight)
  if (data.peRatio) {
    if (data.peRatio < 15) {
      score += 15; // Potentially undervalued
    } else if (data.peRatio > 30) {
      score -= 15; // Potentially overvalued
    }
  }

  // Daily change (15% weight)
  if (data.dailyChange > 3) {
    score -= 10; // Large positive daily change might indicate volatility
  } else if (data.dailyChange < -3) {
    score += 10; // Large negative daily change might indicate buying opportunity
  }

  // Volume analysis (15% weight)
  if (data.volume) {
    // High volume generally indicates strong trading interest
    score += 5;
  }

  // Dividend yield (10% weight)
  if (data.dividendYield) {
    if (data.dividendYield > 0.03) {
      // >3%
      score += 8; // Good dividend yield
    }
  }

  // Return on Equity (10% weight)
  if (data.returnOnEquity) {
    if (data.returnOnEquity > 0.1) {
      // >10%
      score += 7; // Strong ROE
    } else if (data.returnOnEquity < 0) {
      score -= 10; // Negative ROE is concerning
    }
  }

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 格式化市值以顯示
 * @param {number} marketCap - 市值
 * @returns {string} 格式化的市值
 */
function formatMarketCap(marketCap) {
  if (!marketCap) return 'N/A';

  if (marketCap >= 1e12) {
    return (marketCap / 1e12).toFixed(1) + ' 兆';
  } else if (marketCap >= 1e9) {
    return (marketCap / 1e9).toFixed(1) + ' 億';
  } else if (marketCap >= 1e6) {
    return (marketCap / 1e6).toFixed(1) + ' 萬';
  } else {
    return marketCap.toString();
  }
}

/**
 * 計算百分比變化
 * @param {number} current - 當前值
 * @param {number} previous - 先前值
 * @returns {number} 百分比變化
 */
function calculatePercentageChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * 取得歷史資料以進行趨勢分析
 * @param {string} symbol - 股票代碼
 * @param {string} period - 期間 ('1mo', '3mo', '6mo', '1y')
 * @returns {Promise<Array>} 歷史資料點
 */
async function getHistoricalData(symbol, period = '3mo') {
  try {
    const queryOptions = {
      period1:
        Date.now() / 1000 -
        (period === '1mo'
          ? 30
          : period === '3mo'
            ? 90
            : period === '6mo'
              ? 180
              : 365) *
          24 *
          60 *
          60,
    };
    const result = await yahooFinance.historical(symbol, queryOptions);

    return result.map((item) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
  } catch (error) {
    console.error(
      `Error fetching historical data for ${symbol}:`,
      error.message
    );
    return [];
  }
}

/**
 * Get multiple stocks data efficiently
 * @param {Array<string>} symbols - Array of stock symbols
 * @returns {Promise<Array>} Array of stock data objects
 */
async function getMultipleStocks(symbols) {
  const promises = symbols.map((symbol) =>
    getStockData(symbol).catch((error) => {
      console.error(`Failed to fetch ${symbol}:`, error.message);
      return null;
    })
  );

  const results = await Promise.all(promises);
  return results.filter((result) => result !== null);
}

/**
 * 分析股票趨勢
 * @param {string} symbol - 股票代碼
 * @returns {Promise<Object>} 趨勢分析
 */
async function analyzeTrend(symbol) {
  try {
    const historicalData = await getHistoricalData(symbol, '3mo');

    if (historicalData.length < 10) {
      return { trend: 'unknown', strength: 0 };
    }

    const prices = historicalData.map((item) => item.close);
    const recentPrices = prices.slice(-10); // Last 10 days
    const olderPrices = prices.slice(-30, -20); // 10-20 days ago

    const recentAvg =
      recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const olderAvg =
      olderPrices.reduce((sum, price) => sum + price, 0) / olderPrices.length;

    const trend = recentAvg > olderAvg ? 'up' : 'down';
    const strength = Math.abs((recentAvg - olderAvg) / olderAvg) * 100;

    return { trend, strength: Math.min(100, strength) };
  } catch (error) {
    console.error(`Error analyzing trend for ${symbol}:`, error.message);
    return { trend: 'unknown', strength: 0 };
  }
}

/**
 * 處理股票報價資料，改善 ETF 支援
 * @param {Object} quote - Yahoo Finance 報價資料
 * @returns {Object} 處理後的股票資料
 */
function processStockQuoteData(quote) {
  // Handle different quote formats
  let processedData = {};

  // Handle regular stocks
  if (quote.price || quote.regularMarketPrice) {
    const priceData = quote.price || quote;

    processedData = {
      symbol: quote.symbol || priceData.symbol,
      name:
        priceData.displayName ||
        priceData.shortName ||
        priceData.symbol ||
        '未知',
      price: priceData.regularMarketPrice || priceData.price,
      previousClose:
        priceData.regularMarketPreviousClose || priceData.previousClose,
      marketCap: priceData.marketCap || quote.marketCap,
      volume: priceData.regularMarketVolume || priceData.volume,
      peRatio: priceData.trailingPE || priceData.peRatio || null,
      eps: priceData.epsTrailingTwelveMonths || priceData.eps || null,
      dividendYield: priceData.dividendYield || priceData.yield || null,
      fiftyTwoWeekHigh: priceData.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: priceData.fiftyTwoWeekLow || null,
      currency: priceData.currency || 'TWD',
      exchange: priceData.exchange || quote.exchange,
    };
  }
  // Handle ETFs and Funds
  else if (quote.fundProfile || quote.assetProfile) {
    const profileData = quote.fundProfile || quote.assetProfile || {};

    processedData = {
      symbol: quote.symbol,
      name:
        profileData.longBusinessSummary ||
        profileData.family ||
        profileData.category ||
        quote.symbol,
      price: quote.regularMarketPrice || quote.lastPrice || null,
      previousClose: quote.regularMarketPreviousClose || null,
      marketCap: quote.marketCap || profileData.totalAssets || null,
      volume: quote.regularMarketVolume || quote.averageVolume10days || null,
      peRatio: null, // ETFs typically don't have PE ratios
      eps: null,
      dividendYield: quote.dividendYield || profileData.yield || null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || null,
      currency: quote.currency || 'TWD',
      exchange: quote.exchange,
    };
  }

  // Ensure required fields exist
  if (!processedData.price) {
    console.warn(`No price data found for ${quote.symbol}`);
    processedData.price = null;
  }

  return processedData;
}

module.exports = {
  getStockData,
  getMultipleStocks,
  calculateHealthScore,
  formatMarketCap,
  calculatePercentageChange,
  getHistoricalData,
  analyzeTrend,
};
