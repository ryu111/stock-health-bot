// 格式化工具函數

/**
 * 建立詳細分析訊息
 */
function createDetailedAnalysisMessage(stockData, analysis) {
  const message = {
    type: 'flex',
    altText: `${stockData.symbol} 詳細分析報告`,
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `📊 ${stockData.symbol} 詳細分析`,
            weight: 'bold',
            size: 'lg',
            color: '#ffffff',
          },
        ],
        backgroundColor: '#27AE60',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '🏥 健康分數',
                weight: 'bold',
                size: 'sm',
              },
              {
                type: 'text',
                text: `${analysis.overallScore}/100`,
                size: 'lg',
                color: analysis.overallScore >= 70 ? '#27AE60' : analysis.overallScore >= 50 ? '#F39C12' : '#E74C3C',
              },
            ],
          },
          {
            type: 'separator',
          },
          ...Object.entries(analysis.details).map(([key, value]) =>
            createAnalysisBubble(key, value)
          ),
        ],
      },
    },
  };

  return message;
}

/**
 * 建立分析氣泡
 */
function createAnalysisBubble(title, analysisData) {
  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: formatKey(title),
        weight: 'bold',
        size: 'sm',
      },
      {
        type: 'text',
        text: formatValue(analysisData),
        size: 'sm',
        color: analysisData.score >= 70 ? '#27AE60' : analysisData.score >= 50 ? '#F39C12' : '#E74C3C',
      },
    ],
  };
}

/**
 * 翻譯建議
 */
function translateRecommendation(action) {
  const translations = {
    buy: '買入',
    hold: '持有',
    sell: '賣出',
    strong_buy: '強烈買入',
    strong_sell: '強烈賣出',
  };
  return translations[action] || action;
}

/**
 * 格式化鍵值
 */
function formatKey(key) {
  const translations = {
    technicalAnalysis: '技術分析',
    fundamentalAnalysis: '基本面分析',
    marketSentiment: '市場情緒',
    riskAssessment: '風險評估',
    overallScore: '綜合評分',
  };
  return translations[key] || key;
}

/**
 * 格式化數值
 */
function formatValue(value) {
  if (typeof value === 'object' && value.recommendation) {
    return `${translateRecommendation(value.recommendation)} (${value.score}/100)`;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value.toString();
}

module.exports = {
  createDetailedAnalysisMessage,
  createAnalysisBubble,
  translateRecommendation,
  formatKey,
  formatValue,
};
