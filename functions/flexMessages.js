// Flex Messages utilities for LINE Bot
// const line = require('@line/bot-sdk'); // Not used in this module

/**
 * Generate health report Flex Message for stock analysis
 * @param {string} symbol - Stock symbol
 * @param {object} data - Stock data with health score
 * @returns {object} Flex Message object
 */
function generateHealthReportMessage(symbol, data) {
  const healthScore = data.healthScore || 0;
  const healthColor =
    healthScore >= 70 ? '#00C500' : healthScore >= 50 ? '#FFB800' : '#FF0000';
  const healthText =
    healthScore >= 70 ? '健康' : healthScore >= 50 ? '一般' : '需要關注';

  return {
    type: 'flex',
    altText: `${symbol} 股票健康度報告`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📊 股票健康度報告',
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
            text: symbol,
            size: 'xxl',
            weight: 'bold',
            color: '#333333',
          },
          {
            type: 'text',
            text: `健康分數: ${healthScore}/100`,
            size: 'lg',
            color: healthColor,
            weight: 'bold',
          },
          {
            type: 'text',
            text: healthText,
            size: 'md',
            color: healthColor,
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '基本指標',
                size: 'sm',
                color: '#555555',
                flex: 1,
              },
              {
                type: 'text',
                text: data.pe || 'N/A',
                size: 'sm',
                color: '#111111',
                align: 'end',
                flex: 1,
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '市值',
                size: 'sm',
                color: '#555555',
                flex: 1,
              },
              {
                type: 'text',
                text: data.marketCap || 'N/A',
                size: 'sm',
                color: '#111111',
                align: 'end',
                flex: 1,
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '近月漲跌',
                size: 'sm',
                color: '#555555',
                flex: 1,
              },
              {
                type: 'text',
                text: `${data.monthlyChange || 0}%`,
                size: 'sm',
                color: data.monthlyChange >= 0 ? '#00C500' : '#FF0000',
                align: 'end',
                flex: 1,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '加入清單',
              data: `action:add_to_watchlist&symbol:${symbol}`,
            },
            style: 'primary',
            color: '#1DB446',
          },
          {
            type: 'button',
            action: {
              type: 'message',
              label: '詳細分析',
              text: `詳細分析 ${symbol}`,
            },
            style: 'secondary',
          },
        ],
      },
    },
  };
}

/**
 * Generate watchlist Flex Message
 * @param {string} userId - User ID
 * @param {Array} watchlist - List of stocks
 * @returns {object} Flex Message object
 */
function generateWatchlistMessage(userId, watchlist) {
  if (!watchlist || watchlist.length === 0) {
    return {
      type: 'flex',
      altText: '您的觀察清單',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📋 您的觀察清單',
              weight: 'bold',
              size: 'md',
            },
            {
              type: 'text',
              text: '還沒有股票在清單中',
              color: '#888888',
              size: 'sm',
            },
          ],
        },
      },
    };
  }

  const contents = watchlist.map((stock) => ({
    type: 'box',
    layout: 'horizontal',
    contents: [
      {
        type: 'text',
        text: stock.symbol,
        size: 'md',
        weight: 'bold',
        flex: 1,
      },
      {
        type: 'text',
        text: `健康度: ${stock.healthScore || 'N/A'}`,
        size: 'sm',
        color: '#666666',
        flex: 2,
      },
      {
        type: 'button',
        action: {
          type: 'postback',
          label: '移除',
          data: `action:remove_from_watchlist&symbol:${stock.symbol}`,
        },
        style: 'secondary',
      },
    ],
    margin: 'md',
  }));

  return {
    type: 'flex',
    altText: '您的觀察清單',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📋 您的觀察清單',
            weight: 'bold',
            size: 'lg',
            color: '#1DB446',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: contents,
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'button',
            action: {
              type: 'message',
              label: '批量分析',
              text: '批量分析',
            },
            style: 'primary',
          },
        ],
      },
    },
  };
}

/**
 * Generate help message with buttons
 * @returns {object} Flex Message object for help
 */
function generateHelpMessage() {
  return {
    type: 'flex',
    altText: '股健檢 Bot 幫助',
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
                text: '📈 股健檢 Bot',
                weight: 'bold',
                size: 'lg',
                color: '#1DB446',
              },
              {
                type: 'text',
                text: '股票健康度分析工具',
                size: 'md',
              },
            ],
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '基本功能',
                weight: 'bold',
                size: 'md',
                margin: 'md',
              },
              {
                type: 'text',
                text: '• 查詢股票健康度\n• 加入監控清單\n• 分析整體趨勢',
                size: 'sm',
                wrap: true,
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'message',
                  label: '開始查詢',
                  text: '查詢 2330',
                },
                style: 'primary',
              },
              {
                type: 'button',
                action: {
                  type: 'message',
                  label: '我的清單',
                  text: '我的清單',
                },
                style: 'secondary',
              },
            ],
          },
        },
      ],
    },
  };
}

/**
 * Generate simpler text message for when Flex Message fails
 * @param {string} symbol - Stock symbol
 * @param {object} data - Stock data
 * @returns {object} Text message object
 */
function generateSimpleHealthMessage(symbol, data) {
  const healthScore = data.healthScore || 0;

  return {
    type: 'text',
    text: `📊 ${symbol} 股票健康度報告
健康分數：${healthScore}/100

基本指標：
• PE比率: ${data.pe || 'N/A'}
• 市值: ${data.marketCap || 'N/A'}
• 月漲跌: ${data.monthlyChange || 0}%

💡 提示：升級至訂閱版，解鎖完整分析和個人化警報！

輸入 '加入清單 ${symbol}' 來加入監控清單`,
  };
}

module.exports = {
  generateHealthReportMessage,
  generateWatchlistMessage,
  generateHelpMessage,
  generateSimpleHealthMessage,
};
