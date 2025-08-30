// Webhook 處理控制器
const {
  handleTextMessage,
  handleFollow,
  handleUnfollow,
  handlePostback,
} = require('./lineController');

/**
 * 處理測試 webhook
 */
async function handleTestWebhook(req, res) {
  try {
    const events = req.body.events;
    const responses = [];

    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          const response = await handleTestMessage(event);
          responses.push(response);
        } else if (event.type === 'postback') {
          return await handlePostback(event);
        } else if (event.type === 'follow') {
          return await handleFollow(event);
        }
      })
    );

    res.status(200).json({
      message: '測試成功',
      responses: responses,
    });
  } catch (error) {
    console.error('測試 webhook 錯誤:', error);
    res.status(500).json({
      error: '內部伺服器錯誤',
      message: error.message,
    });
  }
}

/**
 * 處理正式 webhook
 */
async function handleWebhook(req, res) {
  try {
    const events = req.body.events;

    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          return await handleTextMessage(event);
        } else if (event.type === 'postback') {
          return await handlePostback(event);
        } else if (event.type === 'follow') {
          return await handleFollow(event);
        } else if (event.type === 'unfollow') {
          return await handleUnfollow(event);
        }
      })
    );

    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook 錯誤:', error);
    res.status(500).json({
      error: '內部伺服器錯誤',
      message: error.message,
    });
  }
}

/**
 * 處理測試訊息（模擬回應）
 */
async function handleTestMessage(event) {
  const { text } = event.message;

  try {
    // 處理查詢指令
    if (text.startsWith('查詢 ')) {
      const symbol = text.replace('查詢 ', '').trim();
      return await handleTestStockQuery(symbol);
    }

    // 處理 ETF 速查表指令
    if (text === 'ETF 速查表') {
      const { formatETFLookupTable } = require('../services/etfDataService');
      const lookupTable = formatETFLookupTable();
      return {
        type: 'text',
        text: lookupTable,
      };
    }

    // 處理幫助指令
    if (text === '幫助' || text === 'help' || text === '?') {
      const { generateHelpMessage } = require('../utils/flexMessages');
      return generateHelpMessage();
    }

    // 預設回應
    return {
      type: 'text',
      text: '請輸入「查詢 [股票代號]」來查詢股票健康狀況，或輸入「幫助」查看使用說明。',
    };
  } catch (error) {
    console.error('處理測試訊息錯誤:', error);
    return {
      type: 'text',
      text: '處理訊息時發生錯誤，請稍後再試。',
    };
  }
}

/**
 * 處理測試股票查詢（模擬回應）
 */
async function handleTestStockQuery(symbol) {
  try {
    // 根據台灣市場代號慣例判斷是否為 ETF
    const isETF = /^00\d{2,3}$/.test(symbol);
    
    if (isETF) {
      // 使用 ETF 專用服務
      const { getETFData, calculateETFHealthScore, formatETFReport } = require('../services/etfDataService');
      const etfData = await getETFData(symbol);
      const healthScore = calculateETFHealthScore(etfData);
      
      return {
        type: 'text',
        text: formatETFReport(etfData, healthScore)
      };
    } else {
      // 使用一般股票服務
      const { getStockData, calculateHealthScore, formatMarketCap } = require('../services/stockService');
      let stockSymbol = symbol.toUpperCase();

      // 如果未指定，為台股添加 .TW
      if (!stockSymbol.includes('.')) {
        stockSymbol = stockSymbol + '.TW';
      }

      const stockData = await getStockData(stockSymbol);

      if (!stockData || !stockData.price) {
        return {
          type: 'text',
          text: `❌ 無法取得 ${symbol} 的股票數據\n\n🚀 可能的原因：\n• 股票代碼格式錯誤\n• 當前非交易時間\n• 網路連接問題\n\n請確認代碼並稍後再試\n例如：2330 (台積電)`
        };
      }

      // 計算健康分數
      const healthScore = calculateHealthScore(stockData);

      return {
        type: 'text',
        text: `📊 ${stockData.name || stockSymbol} 股票健康報告\n\n🏥 健康分數: ${healthScore}/100\n💰 當前價格: $${stockData.price?.toFixed(2) || 'N/A'}\n📈 漲跌幅: ${stockData.dailyChange?.toFixed(2) || '0.00'}%\n📊 本益比: ${stockData.peRatio?.toFixed(2) || 'N/A'}\n💎 市值: ${formatMarketCap(stockData.marketCap)}\n📊 成交量: ${stockData.volume || 'N/A'}\n💵 股息殖利率: ${stockData.dividendYield ? (stockData.dividendYield * 100).toFixed(2) + '%' : 'N/A'}`
      };
    }
  } catch (error) {
    console.error('測試股票查詢錯誤:', error);
    return {
      type: 'text',
      text: '查詢過程中發生錯誤，請稍後再試。',
    };
  }
}

module.exports = {
  handleTestWebhook,
  handleWebhook,
  handleTestMessage,
  handleTestStockQuery,
};
