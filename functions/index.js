const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const line = require('@line/bot-sdk');

// 從 .env 檔案載入環境變數
require('dotenv').config();
const {
  generateHealthReportMessage,
  generateWatchlistMessage,
  generateHelpMessage,
} = require('./flexMessages');
const {
  getStockData,
  calculateHealthScore,
  formatMarketCap,
  analyzeTrend,
  getHistoricalData,
} = require('./stockService');
const { performAnalysis, performEnhancedAnalysis } = require('./aiAnalyzer');

// 初始化 Firebase Admin
admin.initializeApp();

// Firestore 參考
const db = admin.firestore();

// LINE Bot 配置
const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// 驗證必需的環境變數
if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
  throw new Error('請設置環境變數: LINE_ACCESS_TOKEN 和 LINE_CHANNEL_SECRET');
}

// 無需驗證 - 令牌透過 Firebase 配置設定
console.log('LINE Bot 初始化成功');

// 建立 LINE 客戶端
const lineClient = new line.Client(lineConfig);

// 建立 Express 應用程式
const app = express();

// 中介軟體
app.use(cors({ origin: true }));
app.use(express.json());

// 為了 Cloud Run 相容性 - 確保伺服器準備好讓 Cloud Run 管理端口分配
console.log('股健檢 LINE Bot 伺服器已初始化');

app.get('/', (req, res) => {
  res.json({
    status: '股健檢 Bot 運行中',
    timestamp: new Date().toISOString(),
  });
});

// 處理 LINE webhook 驗證的中介軟體
const lineMiddleware = line.middleware(lineConfig);

// 基本測試端點
app.get('/test', (req, res) => {
  res.send('股健檢 API 正在運行！');
});

// LINE Webhook 端點
app.post('/webhook', lineMiddleware, async (req, res) => {
  try {
    const events = req.body.events;

    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          return await handleMessage(event);
        } else if (event.type === 'postback') {
          return await handlePostback(event);
        } else if (event.type === 'follow') {
          return await handleFollow(event);
        }
      })
    );

    res.status(200).json({});
  } catch (error) {
    console.error('Webhook 錯誤:', error);
    res.status(500).json({ error: '內部伺服器錯誤' });
  }
});

// 處理傳入訊息
async function handleMessage(event) {
  const userId = event.source.userId;
  const messageText = event.message.text;

  try {
    // 確保使用者檔案存在
    await ensureUserProfile(userId);

    // 指令解析
    if (messageText.startsWith('查詢')) {
      // 從訊息中提取股票代碼 (例如: "查詢 2330")
      const symbol = messageText.split(' ')[1]?.trim();
      if (symbol) {
        await handleStockQuery(event.replyToken, userId, symbol);
      } else {
        await replyWithText(
          event.replyToken,
          '請提供股票代碼，例如：查詢 2330'
        );
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
        await replyWithText(
          event.replyToken,
          '請提供股票代碼，例如：加入清單 2330'
        );
      }
    } else if (
      messageText.startsWith('移除') ||
      messageText.startsWith('刪除')
    ) {
      const symbol = messageText.split(' ')[1]?.trim();
      if (symbol) {
        await removeFromWatchlist(userId, symbol, event.replyToken);
      } else {
        await replyWithText(
          event.replyToken,
          '請提供股票代碼，例如：移除 2330'
        );
      }
    } else if (messageText === '健康') {
      await replyWithText(event.replyToken, '✅ Bot 運行正常！');
    } else if (messageText.startsWith('詳細分析')) {
      const symbol = messageText.split(' ')[1]?.trim();
      if (symbol) {
        await handleDetailedAnalysis(event.replyToken, userId, symbol);
      } else {
        await replyWithText(
          event.replyToken,
          '請提供股票代碼，例如：詳細分析 2330'
        );
      }
    } else {
      await replyWithText(
        event.replyToken,
        '可用指令：\n• 查詢 [代碼] - 股票健康度\n• 詳細分析 [代碼] - AI 進階分析\n• 加入清單 [代碼] - 加入監控\n• 我的清單 - 查看觀察清單\n• 幫助 - 詳細功能'
      );
    }
  } catch (error) {
    console.error('訊息處理錯誤:', error);
    await replyWithText(event.replyToken, '處理訊息時發生錯誤，請稍後再試。');
  }
}

// 股票查詢處理器
async function handleStockQuery(replyToken, userId, symbol) {
  try {
    // 檢查使用者訂閱和查詢限制
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    // 開發階段：跳過查詢計數以進行測試
    // const today = new Date().toISOString().split('T')[0];
    // let dailyQueries = userData.dailyQueries || 0;

    // 開發階段：移除查詢限制
    // 跳過所有查詢計數以進行開發測試

    try {
      // 取得真實股票資料
      let stockSymbol = symbol.toUpperCase();

      // 如果未指定，為台股添加 .TW
      if (!stockSymbol.includes('.')) {
        stockSymbol = stockSymbol + '.TW';
      }

      const stockData = await getStockData(stockSymbol);

      if (!stockData || !stockData.price) {
        throw new Error('無股票資料可用');
      }

      // 計算健康分數
      const healthScore = calculateHealthScore(stockData);

      // 取得歷史資料並為所有使用者執行基本分析
      const historicalData = await getHistoricalData(stockSymbol, '1mo');
      const trendAnalysis = await analyzeTrend(stockSymbol);

      // 免費使用者基本分析，付費使用者增強分析
      let analysisScore = healthScore;
      if (userData.subscriptionType === 'premium') {
        const basicAnalysis = await performAnalysis(
          stockData,
          historicalData,
          {}
        );
        analysisScore = basicAnalysis.overallScore;
      }

      // 準備 Flex Message 的資料
      const flexData = {
        symbol: stockData.name || stockSymbol,
        healthScore: analysisScore,
        pe: stockData.peRatio ? stockData.peRatio.toFixed(2) : 'N/A',
        marketCap: formatMarketCap(stockData.marketCap),
        monthlyChange: stockData.dailyChange
          ? stockData.dailyChange.toFixed(2)
          : 0,
        price: stockData.price ? stockData.price.toFixed(2) : 'N/A',
        volume: stockData.volume || 'N/A',
        trend: trendAnalysis,
        dividendYield: stockData.dividendYield
          ? (stockData.dividendYield * 100).toFixed(2) + '%'
          : 'N/A',
        returnOnEquity: stockData.returnOnEquity
          ? (stockData.returnOnEquity * 100).toFixed(2) + '%'
          : 'N/A',
        volatility:
          historicalData && historicalData.length > 5 ? '可用' : '資料不足',
        isPremium: userData.subscriptionType === 'premium',
      };

      // 發送包含真實股票資訊的 Flex Message
      const flexMessage = generateHealthReportMessage(
        flexData.symbol,
        flexData
      );
      await replyWithFlex(replyToken, flexMessage);
    } catch (apiError) {
      console.error('股票 API 錯誤:', apiError);

      // 回退到簡單文字訊息
      const simpleMessage = {
        type: 'text',
        text: `❌ 無法取得 ${symbol} 的股票數據\n\n🚀 可能的原因：\n• 股票代碼格式錯誤\n• 當前非交易時間\n• 網路連接問題\n\n請確認代碼並稍後再試\n例如：2330 (台積電)`,
      };

      await lineClient.replyMessage(replyToken, simpleMessage);
      return;
    }
  } catch (error) {
    console.error('股票查詢錯誤:', error);
    await replyWithText(replyToken, '查詢過程中發生錯誤，請稍後再試。');
  }
}

// 使用 Flex Message 的幫助訊息
async function replyWithHelp(replyToken) {
  const helpMessage = generateHelpMessage();
  await replyWithFlex(replyToken, helpMessage);
}

// 發送文字回覆
async function replyWithText(replyToken, text) {
  await lineClient.replyMessage(replyToken, {
    type: 'text',
    text: text,
  });
}

// 發送 flex 訊息
async function replyWithFlex(replyToken, flexMessage) {
  await lineClient.replyMessage(replyToken, flexMessage);
}

// 移除 replyWithStockInfo 函數，因為未使用

// 處理 postback 事件 (按鈕點擊)
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

// 處理追蹤事件 (當使用者加入機器人時)
async function handleFollow(event) {
  const userId = event.source.userId;
  const welcomeMessage = generateHelpMessage();

  await replyWithFlex(event.replyToken, welcomeMessage);

  // 初始化使用者檔案
  await initializeUserProfile(userId);
}

// 將股票加入使用者的觀察清單
async function addToWatchlist(userId, symbol, replyToken) {
  try {
    await ensureUserProfile(userId);

    const watchlistRef = db.collection('watchlists').doc(userId);
    const watchlistDoc = await watchlistRef.get();
    const currentWatchlist = watchlistDoc.exists
      ? watchlistDoc.data().stocks || []
      : [];

    if (!currentWatchlist.find((stock) => stock.symbol === symbol)) {
      currentWatchlist.push({ symbol: symbol, addedAt: new Date() });
      await watchlistRef.set({ stocks: currentWatchlist });
      await replyWithText(replyToken, `✅ 已將 ${symbol} 加入您的觀察清單`);
    } else {
      await replyWithText(replyToken, `ℹ️ ${symbol} 已經在您的觀察清單中`);
    }
  } catch (error) {
    console.error('加入觀察清單錯誤:', error);
    await replyWithText(replyToken, '加入清單失敗，請稍後再試');
  }
}

// 從使用者的觀察清單移除股票
async function removeFromWatchlist(userId, symbol, replyToken) {
  try {
    const watchlistRef = db.collection('watchlists').doc(userId);
    const watchlistDoc = await watchlistRef.get();

    if (watchlistDoc.exists) {
      const currentWatchlist = watchlistDoc.data().stocks || [];
      const updatedWatchlist = currentWatchlist.filter(
        (stock) => stock.symbol !== symbol
      );

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
    console.error('從觀察清單移除錯誤:', error);
    await replyWithText(replyToken, '移除失敗，請稍後再試');
  }
}

// 初始化使用者檔案
async function initializeUserProfile(userId) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      userId: userId,
      subscriptionType: 'free', // 免費或付費
      dailyQueries: 0,
      lastQueryDate: new Date().toISOString().split('T')[0],
      joinedAt: new Date(),
    });
  }
}

// 確保使用者檔案存在
async function ensureUserProfile(userId) {
  await initializeUserProfile(userId);
}

// 取得使用者的觀察清單
async function getWatchlist(userId) {
  try {
    const watchlistRef = db.collection('watchlists').doc(userId);
    const watchlistDoc = await watchlistRef.get();

    if (watchlistDoc.exists) {
      return watchlistDoc.data().stocks || [];
    }
    return [];
  } catch (error) {
    console.error('取得觀察清單錯誤:', error);
    return [];
  }
}

// "我的清單" 指令處理器
async function handleMyWatchlist(replyToken, userId) {
  try {
    const watchlist = await getWatchlist(userId);
    const flexMessage = generateWatchlistMessage(userId, watchlist);
    await replyWithFlex(replyToken, flexMessage);
  } catch (error) {
    console.error('處理觀察清單錯誤:', error);
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
      await replyWithText(
        replyToken,
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
      userId: userId,
    });

    // Create detailed analysis message
    const analysisMessage = createDetailedAnalysisMessage(stockData, analysis);

    await lineClient.replyMessage(replyToken, analysisMessage);
  } catch (error) {
    console.error('詳細分析錯誤:', error);
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
                color: '#1DB446',
              },
            ],
          },
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: stockData.name || stockData.symbol,
                size: 'xl',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `綜合評分: ${overallScore}/100`,
                size: 'lg',
                color:
                  overallScore >= 70
                    ? '#00C500'
                    : overallScore >= 50
                      ? '#FFB800'
                      : '#FF0000',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `投資建議: ${translateRecommendation(recommendation.action)}`,
                size: 'md',
                color: '#555555',
              },
            ],
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
                margin: 'md',
              },
              {
                type: 'text',
                text: recommendation.reasoning || 'AI 分析完成',
                size: 'sm',
                wrap: true,
                color: '#666666',
              },
            ],
          },
        },
        // Analysis Details Bubbles
        createAnalysisBubble('💹 技術分析', analysis.technicalAnalysis),
        createAnalysisBubble('🏢 基本面分析', analysis.fundamentalAnalysis),
        createAnalysisBubble('⚠️ 風險評估', analysis.riskAnalysis),
        createAnalysisBubble('🎯 SWOT 分析', analysisDetails),
      ],
    },
  };
}

// Helper function to create analysis bubble
function createAnalysisBubble(title, analysisData) {
  let content = '分析數據載入中...';

  if (typeof analysisData === 'object' && analysisData !== null) {
    const entries = Object.entries(analysisData).slice(0, 5); // Limit to 5 items
    content = entries
      .map(([key, value]) => `${formatKey(key)}: ${formatValue(value)}`)
      .join('\n');
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
          color: '#1DB446',
        },
        {
          type: 'text',
          text: content,
          size: 'sm',
          wrap: true,
          margin: 'md',
        },
      ],
    },
  };
}

// Helper functions for formatting
function translateRecommendation(action) {
  const translations = {
    buy: '積極買進',
    hold: '持有觀望',
    wait: '謹慎等待',
    cautious: '謹慎投資',
    sell: '考慮賣出',
  };
  return translations[action] || action;
}

function formatKey(key) {
  const keyTranslations = {
    trend: '趨勢',
    momentum: '動能',
    supportLevels: '支撐位',
    resistanceLevels: '壓力位',
    valuation: '估值',
    dividendStrength: '股息強度',
    overallRating: '整體評分',
    volatilityRating: '波動性',
    riskLevel: '風險等級',
    strengths: '優勢',
    weaknesses: '劣勢',
    opportunities: '機會',
    threats: '威脅',
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
exports.api = functions.https.onRequest(
  {
    memory: '256MB',
    timeoutSeconds: 60,
    maxInstances: 5,
  },
  app
);
