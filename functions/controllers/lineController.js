// LINE 訊息處理控制器
const { lineClient } = require('../config/line');
const { db } = require('../config/firebase');
const {
  generateHealthReportMessage,
  generateWatchlistMessage,
  generateHelpMessage,
} = require('../utils/flexMessages');
const {
  getStockData,
  calculateHealthScore,
  formatMarketCap,
  analyzeTrend,
  getHistoricalData,
} = require('../services/stockService');
const {
  getETFData,
  calculateETFHealthScore,
  formatETFReport,
  formatETFLookupTable,
} = require('../services/etfDataService');
const { performAnalysis, performEnhancedAnalysis } = require('../services/aiAnalyzer');
const { createDetailedAnalysisMessage } = require('../utils/formatters');

/**
 * 處理文字訊息
 */
async function handleTextMessage(event) {
  const { text } = event.message;
  const userId = event.source.userId;

  try {
    // 處理查詢指令
    if (text.startsWith('查詢 ')) {
      const symbol = text.replace('查詢 ', '').trim();
      return await handleStockQuery(event.replyToken, userId, symbol);
    }

    // 處理 ETF 速查表指令
    if (text === 'ETF 速查表') {
      const lookupTable = formatETFLookupTable();
      return await lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: lookupTable,
      });
    }

    // 處理幫助指令
    if (text === '幫助' || text === 'help' || text === '?') {
      const helpMessage = generateHelpMessage();
      return await lineClient.replyMessage(event.replyToken, helpMessage);
    }

    // 處理其他指令
    if (text === '監控清單') {
      return await handleWatchlist(event.replyToken, userId);
    }

    // 預設回應
    return await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '請輸入「查詢 [股票代號]」來查詢股票健康狀況，或輸入「幫助」查看使用說明。',
    });
  } catch (error) {
    console.error('處理文字訊息錯誤:', error);
    return await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '處理訊息時發生錯誤，請稍後再試。',
    });
  }
}

/**
 * 處理股票查詢
 */
async function handleStockQuery(replyToken, userId, symbol) {
  try {
    // 檢查使用者訂閱和查詢限制
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    try {
      // 根據台灣市場代號慣例判斷是否為 ETF
      const isETF = /^00\d{2,3}$/.test(symbol);
      
      if (isETF) {
        // 使用 ETF 專用服務
        const etfData = await getETFData(symbol);
        const healthScore = calculateETFHealthScore(etfData);
        
        // 發送 ETF 報告
        const etfMessage = {
          type: 'text',
          text: formatETFReport(etfData, healthScore)
        };
        
        return await lineClient.replyMessage(replyToken, etfMessage);
      } else {
        // 使用一般股票服務
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
        if (userData && userData.subscriptionType === 'premium') {
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
          isPremium: userData && userData.subscriptionType === 'premium',
        };

        // 發送包含真實股票資訊的 Flex Message
        const flexMessage = generateHealthReportMessage(
          flexData.symbol,
          flexData
        );
        return await lineClient.replyMessage(replyToken, flexMessage);
      }
    } catch (apiError) {
      console.error('股票 API 錯誤:', apiError);

      // 回退到簡單文字訊息
      const simpleMessage = {
        type: 'text',
        text: `❌ 無法取得 ${symbol} 的股票數據\n\n🚀 可能的原因：\n• 股票代碼格式錯誤\n• 當前非交易時間\n• 網路連接問題\n\n請確認代碼並稍後再試\n例如：2330 (台積電)`,
      };

      return await lineClient.replyMessage(replyToken, simpleMessage);
    }
  } catch (error) {
    console.error('股票查詢錯誤:', error);
    return await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '查詢過程中發生錯誤，請稍後再試。',
    });
  }
}

/**
 * 處理監控清單
 */
async function handleWatchlist(replyToken, userId) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData || !userData.watchlist || userData.watchlist.length === 0) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '您還沒有設定監控清單。請先添加股票到監控清單中。',
      });
    }

    const watchlistMessage = generateWatchlistMessage(userData.watchlist);
    return await lineClient.replyMessage(replyToken, watchlistMessage);
  } catch (error) {
    console.error('處理監控清單錯誤:', error);
    return await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '處理監控清單時發生錯誤，請稍後再試。',
    });
  }
}

/**
 * 處理追蹤事件
 */
async function handleFollow(event) {
  const userId = event.source.userId;

  try {
    // 建立新使用者記錄
    await db.collection('users').doc(userId).set({
      userId: userId,
      createdAt: new Date().toISOString(),
      subscriptionType: 'free',
      dailyQueries: 0,
      lastQueryDate: null,
      watchlist: [],
    });

    const welcomeMessage = {
      type: 'text',
      text: '歡迎使用股健檢！\n\n📊 我可以幫您分析股票健康狀況\n💡 輸入「查詢 [股票代號]」開始使用\n❓ 輸入「幫助」查看完整說明',
    };

    return await lineClient.replyMessage(event.replyToken, welcomeMessage);
  } catch (error) {
    console.error('處理追蹤事件錯誤:', error);
    return await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '歡迎使用股健檢！請輸入「幫助」查看使用說明。',
    });
  }
}

/**
 * 處理取消追蹤事件
 */
async function handleUnfollow(event) {
  const userId = event.source.userId;

  try {
    // 刪除使用者記錄
    await db.collection('users').doc(userId).delete();
    console.log(`使用者 ${userId} 已取消追蹤`);
  } catch (error) {
    console.error('處理取消追蹤事件錯誤:', error);
  }
}

/**
 * 處理 Postback 事件
 */
async function handlePostback(event) {
  const { data } = event.postback;

  try {
    if (data.startsWith('action=')) {
      const action = data.replace('action=', '');
      
      if (action === 'help') {
        const helpMessage = generateHelpMessage();
        return await lineClient.replyMessage(event.replyToken, helpMessage);
      }
    }

    return await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '收到您的操作，正在處理中...',
    });
  } catch (error) {
    console.error('處理 Postback 錯誤:', error);
    return await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '處理操作時發生錯誤，請稍後再試。',
    });
  }
}

module.exports = {
  handleTextMessage,
  handleStockQuery,
  handleWatchlist,
  handleFollow,
  handleUnfollow,
  handlePostback,
};
