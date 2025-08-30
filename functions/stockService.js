// Stock Data Service
const yahooFinance = require('yahoo-finance2').default;
const admin = require('firebase-admin');

// Function to get Firestore reference (ensure admin is initialized)
function getFirestore() {
  return admin.firestore();
}

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache duration (5 minutes)

/**
 * Get stock data with caching
 * @param {string} symbol - Stock symbol (e.g., '2330.TW')
 * @returns {Promise<Object>} Stock data object
 */
async function getStockData(symbol) {
  try {
    // Check cache first
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

    // Fetch from Yahoo Finance with better handling
    let quote;
    // const isETF = /\d{4}/.test(symbol.replace('.TW', '')); // ETF detection for future use

    try {
      // Default API call
      quote = await yahooFinance.quote(symbol);
    } catch (error) {
      console.warn(`First attempt failed for ${symbol}:`, error.message);

      // Try without .TW for potential ETF or international symbols
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

      // If still no data, try ETF-specific modules
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

    // Enhanced data processing
    const stockData = processStockQuoteData(quote);

    // Calculate additional metrics
    stockData.dailyChange = calculatePercentageChange(
      quote.regularMarketPrice,
      quote.regularMarketPreviousClose
    );
    stockData.priceToBook = quote.priceToBook || null;
    stockData.returnOnEquity = quote.returnOnEquity || null;

    // Cache the data
    await getFirestore().collection('stockCache').doc(cacheKey).set({
      data: stockData,
      timestamp: new Date().toISOString(),
    });

    return stockData;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);

    // Try to get from cache even if expired
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
 * Calculate health score based on multiple indicators
 * @param {Object} data - Stock data object
 * @returns {number} Health score (0-100)
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
 * Format market cap for display
 * @param {number} marketCap - Market cap value
 * @returns {string} Formatted market cap
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
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
function calculatePercentageChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get historical data for trend analysis
 * @param {string} symbol - Stock symbol
 * @param {string} period - Period ('1mo', '3mo', '6mo', '1y')
 * @returns {Promise<Array>} Historical data points
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
 * Analyze stock trend
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Trend analysis
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
 * Process stock quote data with better ETF support
 * @param {Object} quote - Yahoo Finance quote data
 * @returns {Object} Processed stock data
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
