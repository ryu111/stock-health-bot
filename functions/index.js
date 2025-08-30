const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const line = require('@line/bot-sdk');

// Load environment variables from .env file
require('dotenv').config();
const {
  generateHealthReportMessage,
  generateWatchlistMessage,
  generateHelpMessage,
  generateSimpleHealthMessage
} = require('./flexMessages');
const {
  getStockData,
  calculateHealthScore,
  formatMarketCap,
  analyzeTrend,
  getHistoricalData
} = require('./stockService');
const { performAnalysis, performEnhancedAnalysis } = require('./aiAnalyzer');

// Initialize Firebase Admin
admin.initializeApp();

// Firestore reference
const db = admin.firestore();

// LINE Bot configuration
const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

// 驗證必需的環境變數
if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
  throw new Error('請設置環境變數: LINE_ACCESS_TOKEN 和 LINE_CHANNEL_SECRET');
}

// No validation needed - tokens are configured via Firebase config
console.log('LINE Bot initialized successfully');

// Create LINE client
const lineClient = new line.Client(lineConfig);

// Create Express app
const app = express();

// Middleware
app.use(cors({origin: true}));
app.use(express.json());

// Ensure the app can handle the PORT environment variable set by Cloud Run
const PORT = process.env.PORT || 8080;

// For Cloud Run compatibility - make sure the server is ready for Cloud Run to manage port assignment
console.log('Stock Health LINE Bot server initialized');

app.get('/', (req, res) => {
  res.json({ status: 'Stock Health Bot Running', timestamp: new Date().toISOString() });
});

// Middleware to handle LINE webhook verification
const lineMiddleware = line.middleware(lineConfig);

// Basic test endpoint
app.get('/test', (req, res) => {
  res.send('Stock Health Check API is running!');
});

// LINE Webhook endpoint
app.post('/webhook', lineMiddleware, async (req, res) => {
  try {
    const events = req.body.events;

    await Promise.all(events.map(async (event) => {
      if (event.type === 'message' && event.message.type === 'text') {
        return await handleMessage(event);
      } else if (event.type === 'postback') {
        return await handlePostback(event);
      } else if (event.type === 'follow') {
        return await handleFollow(event);
      }
    }));

    res.status(200).json({});
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle incoming messages
async function handleMessage(event) {
  const userId = event.source.userId;
  const messageText = event.message.text;

  try {
    // Ensure user profile exists
    await ensureUserProfile(userId);

    // Command parsing
    if (messageText.startsWith('查詢')) {
      // Extract stock symbol from message (e.g., "查詢 2330")
      const symbol = messageText.split(' ')[1]?.trim();
      if (symbol) {
        await handleStockQuery(event.replyToken, userId, symbol);
      } else {
        await replyWithText(event.replyToken, '請提供股票代碼，例如：查詢 2330');
      }
    } else if (messageText === '幫助' || messageText === 'help') {
      await replyWithHelp(event.replyToken);
    } else if (messageText === '我的清單' || messageText === '觀察清單') {
      await handleMyWatchlist(event.replyToken, userId);
    } else if (messageText.startsWith('加入清單')) {
      const symbol = messageText.split(' ')[1]?.trim();
      if (symbol) {
        await addToWatchlist(userId, symbol, event.replyToken);
      } else {
        await replyWithText(event.replyToken, '請提供股票代碼，例如：加入清單 2330');
      }
    } else if (messageText.startsWith('移除') || messageText.startsWith('刪除')) {
      const symbol = messageText.split(' ')[1]?.trim();
      if (symbol) {
        await removeFromWatchlist(userId, symbol, event.replyToken);
      } else {
        await replyWithText(event.replyToken, '請提供股票代碼，例如：移除 2330');
      }
    } else if (messageText === '健康') {
      await replyWithText(event.replyToken, '✅ Bot 運行正常！');
    } else if (messageText.startsWith('詳細分析')) {
      const symbol = messageText.split(' ')[1]?.trim();
      if (symbol) {
        await handleDetailedAnalysis(event.replyToken, userId, symbol);
      } else {
        await replyWithText(event.replyToken, '請提供股票代碼，例如：詳細分析 2330');
      }
    } else {
      await replyWithText(event.replyToken, '可用指令：\n• 查詢 [代碼] - 股票健康度\n• 詳細分析 [代碼] - AI 進階分析\n• 加入清單 [代碼] - 加入監控\n• 我的清單 - 查看觀察清單\n• 幫助 - 詳細功能');
    }
  } catch (error) {
    console.error('Message handling error:', error);
    await replyWithText(event.replyToken, '處理訊息時發生錯誤，請稍後再試。');
  }
}

// Stock query handler
async function handleStockQuery(replyToken, userId, symbol) {
  try {
    // Check user subscription and query limits
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const today = new Date().toISOString().split('T')[0];
    let dailyQueries = userData.dailyQueries || 0;

    // Reset daily count if it's a new day
    if (userData.lastQueryDate !== today) {
      dailyQueries = 0;
    }

    // DEVELOPMENT STAGE: Remove query limits
    // Skip all query counting for development testing

    try {
      // Get real stock data
      let stockSymbol = symbol.toUpperCase();

      // Add .TW for Taiwanese stocks if not specified
      if (!stockSymbol.includes('.')) {
        stockSymbol = stockSymbol + '.TW';
      }

      const stockData = await getStockData(stockSymbol);

      if (!stockData || !stockData.price) {
        throw new Error('No stock data available');
      }

      // Calculate health score
      const healthScore = calculateHealthScore(stockData);

      // Get historical data and perform basic analysis for all users
      const historicalData = await getHistoricalData(stockSymbol, '1mo');
      const trendAnalysis = await analyzeTrend(stockSymbol);
  
      // Basic analysis for free users, enhanced for premium
      let analysisScore = healthScore;
      if (userData.subscriptionType === 'premium') {
        const basicAnalysis = await performAnalysis(stockData, historicalData, {});
        analysisScore = basicAnalysis.overallScore;
      }

      // Prepare data for Flex Message
      const flexData = {
        symbol: stockData.name || stockSymbol,
        healthScore: analysisScore,
        pe: stockData.peRatio ? stockData.peRatio.toFixed(2) : 'N/A',
        marketCap: formatMarketCap(stockData.marketCap),
        monthlyChange: stockData.dailyChange ? stockData.dailyChange.toFixed(2) : 0,
        price: stockData.price ? stockData.price.toFixed(2) : 'N/A',
        volume: stockData.volume || 'N/A',
        trend: trendAnalysis,
        dividendYield: stockData.dividendYield ? (stockData.dividendYield * 100).toFixed(2) + '%' : 'N/A',
        returnOnEquity: stockData.returnOnEquity ? (stockData.returnOnEquity * 100).toFixed(2) + '%' : 'N/A',
        volatility: historicalData && historicalData.length > 5 ? '可用' : '資料不足',
        isPremium: userData.subscriptionType === 'premium'
      };

      // Send Flex Message with real stock info
      const flexMessage = generateHealthReportMessage(flexData.symbol, flexData);
      await replyWithFlex(replyToken, flexMessage);
    } catch (apiError) {
      console.error('Stock API error:', apiError);

      // Fallback to simple text message
      const simpleMessage = {
        type: 'text',
        text: `❌ 無法取得 ${symbol} 的股票數據\n\n🚀 可能的原因：\n• 股票代碼格式錯誤\n• 當前非交易時間\n• 網路連接問題\n\n請確認代碼並稍後再試\n例如：2330 (台積電)`
      };

      await lineClient.replyMessage(replyToken, simpleMessage);
      return;
    }
  } catch (error) {
    console.error('Stock query error:', error);
    await replyWithText(replyToken, '查詢過程中發生錯誤，請稍後再試。');
  }
}

// Help message using Flex Message
async function replyWithHelp(replyToken) {
  const helpMessage = generateHelpMessage();
  await replyWithFlex(replyToken, helpMessage);
}

// Send text reply
async function replyWithText(replyToken, text) {
  await lineClient.replyMessage(replyToken, {
    type: 'text',
    text: text
  });
}

// Send flex message
async function replyWithFlex(replyToken, flexMessage) {
  await lineClient.replyMessage(replyToken, flexMessage);
}

// Send stock info reply with Flex Message
async function replyWithStockInfo(replyToken, stockData) {
  const flexMessage = generateHealthReportMessage(stockData.symbol, stockData);
  await replyWithFlex(replyToken, flexMessage);
}

// Handle postback events (button clicks)
async function handlePostback(event) {
  const userId = event.source.userId;
  const data = event.postback.data;

  const [action, params] = data.split('&');

  if (action === 'action:add_to_watchlist') {
    const symbol = params.split(':')[1];
    await addToWatchlist(userId, symbol, event.replyToken);
  } else if (action === 'action:remove_from_watchlist') {
    const symbol = params.split(':')[1];
    await removeFromWatchlist(userId, symbol, event.replyToken);
  }
}

// Handle follow events (when user adds the bot)
async function handleFollow(event) {
  const userId = event.source.userId;
  const welcomeMessage = generateHelpMessage();

  await replyWithFlex(event.replyToken, welcomeMessage);

  // Initialize user profile
  await initializeUserProfile(userId);
}

// Add stock to user's watchlist
async function addToWatchlist(userId, symbol, replyToken) {
  try {
    await ensureUserProfile(userId);

    const watchlistRef = db.collection('watchlists').doc(userId);
    const watchlistDoc = await watchlistRef.get();
    const currentWatchlist = watchlistDoc.exists ? watchlistDoc.data().stocks || [] : [];

    if (!currentWatchlist.find(stock => stock.symbol === symbol)) {
      currentWatchlist.push({ symbol: symbol, addedAt: new Date() });
      await watchlistRef.set({ stocks: currentWatchlist });
      await replyWithText(replyToken, `✅ 已將 ${symbol} 加入您的觀察清單`);
    } else {
      await replyWithText(replyToken, `ℹ️ ${symbol} 已經在您的觀察清單中`);
    }
  } catch (error) {
    console.error('Add to watchlist error:', error);
    await replyWithText(replyToken, '加入清單失敗，請稍後再試');
  }
}

// Remove stock from user's watchlist
async function removeFromWatchlist(userId, symbol, replyToken) {
  try {
    const watchlistRef = db.collection('watchlists').doc(userId);
    const watchlistDoc = await watchlistRef.get();

    if (watchlistDoc.exists) {
      const currentWatchlist = watchlistDoc.data().stocks || [];
      const updatedWatchlist = currentWatchlist.filter(stock => stock.symbol !== symbol);

      if (updatedWatchlist.length !== currentWatchlist.length) {
        await watchlistRef.set({ stocks: updatedWatchlist });
        await replyWithText(replyToken, `✅ 已將 ${symbol} 從您的觀察清單移除`);
      } else {
        await replyWithText(replyToken, `🔍 ${symbol} 不在您的觀察清單中`);
      }
    } else {
      await replyWithText(replyToken, '您的觀察清單為空');
    }
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    await replyWithText(replyToken, '移除失敗，請稍後再試');
  }
}

// Initialize user profile
async function initializeUserProfile(userId) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      userId: userId,
      subscriptionType: 'free', // free or premium
      dailyQueries: 0,
      lastQueryDate: new Date().toISOString().split('T')[0],
      joinedAt: new Date()
    });
  }
}

// Ensure user profile exists
async function ensureUserProfile(userId) {
  await initializeUserProfile(userId);
}

// Get user's watchlist
async function getWatchlist(userId) {
  try {
    const watchlistRef = db.collection('watchlists').doc(userId);
    const watchlistDoc = await watchlistRef.get();

    if (watchlistDoc.exists) {
      return watchlistDoc.data().stocks || [];
    }
    return [];
  } catch (error) {
    console.error('Get watchlist error:', error);
    return [];
  }
}

// "My watchlist" command handler
async function handleMyWatchlist(replyToken, userId) {
  try {
    const watchlist = await getWatchlist(userId);
    const flexMessage = generateWatchlistMessage(userId, watchlist);
    await replyWithFlex(replyToken, flexMessage);
  } catch (error) {
    console.error('Handle watchlist error:', error);
    await replyWithText(replyToken, '取得觀察清單失敗，請稍後再試');
  }
}

// Update handleMessage to include new commands
// (This would need to be updated when we add more commands)
// The handleMessage function already handles some commands, we just need to add the watchlist command

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle detailed analysis with AI
async function handleDetailedAnalysis(replyToken, userId, symbol) {
  try {
    // Check user subscription
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (userData.subscriptionType !== 'premium') {
      await replyWithText(replyToken,
        '🤖 詳細分析為訂閱版專屬功能\n💎 升級至訂閱版解鎖進階 AI 分析！\n\n包含：\n• 技術分析\n• 基本面評估\n• 風險分析\n• 投資建議\n• 優勢/劣勢/機會/威脅分析'
      );
      return;
    }

    // Get stock data
    let stockSymbol = symbol.toUpperCase();
    if (!stockSymbol.includes('.')) {
      stockSymbol = stockSymbol + '.TW';
    }

    const stockData = await getStockData(stockSymbol);
    const historicalData = await getHistoricalData(stockSymbol, '3mo');

    if (!stockData || !stockData.price) {
      await replyWithText(replyToken, `❌ 無法取得 ${symbol} 的股票數據`);
      return;
    }

    // Perform comprehensive analysis
    const analysis = await performEnhancedAnalysis(stockData, historicalData, {
      isPremium: true,
      userId: userId
    });

    // Create detailed analysis message
    const analysisMessage = createDetailedAnalysisMessage(stockData, analysis);

    await lineClient.replyMessage(replyToken, analysisMessage);

  } catch (error) {
    console.error('Detailed analysis error:', error);
    await replyWithText(replyToken, '詳細分析處理失敗，請稍後再試');
  }
}

// Create detailed analysis message
function createDetailedAnalysisMessage(stockData, analysis) {
  const { overallScore, recommendation, analysisDetails } = analysis;

  return {
    type: 'flex',
    altText: `${stockData.symbol} 詳細分析報告`,
    contents: {
      type: 'carousel',
      contents: [
        {
          type: 'bubble',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🔍 AI 詳細分析報告',
                weight: 'bold',
                size: 'lg',
                color: '#1DB446'
              }
            ]
          },
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: stockData.name || stockData.symbol,
                size: 'xl',
                weight: 'bold'
              },
              {
                type: 'text',
                text: `綜合評分: ${overallScore}/100`,
                size: 'lg',
                color: overallScore >= 70 ? '#00C500' : overallScore >= 50 ? '#FFB800' : '#FF0000',
                weight: 'bold'
              },
              {
                type: 'text',
                text: `投資建議: ${translateRecommendation(recommendation.action)}`,
                size: 'md',
                color: '#555555'
              }
            ]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '分析摘要',
                weight: 'bold',
                size: 'md',
                margin: 'md'
              },
              {
                type: 'text',
                text: recommendation.reasoning || 'AI 分析完成',
                size: 'sm',
                wrap: true,
                color: '#666666'
              }
            ]
          }
        },
        // Analysis Details Bubbles
        createAnalysisBubble('💹 技術分析', analysis.technicalAnalysis),
        createAnalysisBubble('🏢 基本面分析', analysis.fundamentalAnalysis),
        createAnalysisBubble('⚠️ 風險評估', analysis.riskAnalysis),
        createAnalysisBubble('🎯 SWOT 分析', analysisDetails)
      ]
    }
  };
}

// Helper function to create analysis bubble
function createAnalysisBubble(title, analysisData) {
  let content = '分析數據載入中...';

  if (typeof analysisData === 'object' && analysisData !== null) {
    const entries = Object.entries(analysisData).slice(0, 5); // Limit to 5 items
    content = entries.map(([key, value]) =>
      `${formatKey(key)}: ${formatValue(value)}`
    ).join('\n');
  }

  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: title,
          weight: 'bold',
          size: 'md',
          color: '#1DB446'
        },
        {
          type: 'text',
          text: content,
          size: 'sm',
          wrap: true,
          margin: 'md'
        }
      ]
    }
  };
}

// Helper functions for formatting
function translateRecommendation(action) {
  const translations = {
    'buy': '積極買進',
    'hold': '持有觀望',
    'wait': '謹慎等待',
    'cautious': '謹慎投資',
    'sell': '考慮賣出'
  };
  return translations[action] || action;
}

function formatKey(key) {
  const keyTranslations = {
    'trend': '趨勢',
    'momentum': '動能',
    'supportLevels': '支撐位',
    'resistanceLevels': '壓力位',
    'valuation': '估值',
    'dividendStrength': '股息強度',
    'overallRating': '整體評分',
    'volatilityRating': '波動性',
    'riskLevel': '風險等級',
    'strengths': '優勢',
    'weaknesses': '劣勢',
    'opportunities': '機會',
    'threats': '威脅'
  };
  return keyTranslations[key] || key;
}

function formatValue(value) {
  if (typeof value === 'string') {
    return value;
  } else if (typeof value === 'number') {
    return value.toFixed ? value.toFixed(2) : value.toString();
  } else if (Array.isArray(value)) {
    return value.length > 0 ? value.slice(0, 2).join(', ') : '無數據';
  } else if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  return 'N/A';
}

// Firebase Functions 2nd Gen exports for Cloud Run compatibility
exports.api = functions.https.onRequest({
  memory: '256MB',
  timeoutSeconds: 60,
  maxInstances: 5
}, app);