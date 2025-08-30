// ETF 資料服務 - 整合多個資料來源

/**
 * 取得 ETF 詳細資料
 * @param {string} symbol - ETF 代碼 (例如: '0050', '0056')
 * @returns {Promise<Object>} ETF 資料物件
 */
async function getETFData(symbol) {
  try {
    console.log(`🔍 開始取得 ${symbol} ETF 資料...`);
    
    // 移除 .TW 後綴以取得純代碼
    const cleanSymbol = symbol.replace('.TW', '');
    
    // 嘗試從多個來源取得資料
    const data = await Promise.allSettled([
      getYahooFinanceData(symbol),
      getYahooFinanceData(cleanSymbol),
      getMockETFData(cleanSymbol), // 模擬資料作為備用
    ]);

    // 選擇最佳資料來源
    const successfulData = data
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);

    if (successfulData.length === 0) {
      throw new Error(`無法從任何來源取得 ${symbol} 的資料`);
    }

    // 合併資料，優先使用有完整資訊的來源
    const bestData = successfulData.reduce((best, current) => {
      if (current.price && current.dividendYield && current.name) {
        return current;
      }
      return best;
    });

    console.log(`✅ 成功取得 ${symbol} ETF 資料`);
    return bestData;

  } catch (error) {
    console.error(`❌ 取得 ${symbol} ETF 資料失敗:`, error.message);
    throw error;
  }
}

/**
 * 從 Yahoo Finance 取得 ETF 資料
 */
async function getYahooFinanceData(symbol) {
  try {
    const yahooFinance = require('yahoo-finance2').default;
    const quote = await yahooFinance.quote(symbol);
    
    return {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol,
      price: quote.regularMarketPrice || quote.price,
      previousClose: quote.regularMarketPreviousClose,
      volume: quote.regularMarketVolume || quote.volume,
      dividendYield: quote.dividendYield,
      marketCap: quote.marketCap,
      currency: quote.currency || 'TWD',
      exchange: quote.exchange,
      source: 'Yahoo Finance'
    };
  } catch (error) {
    console.warn(`Yahoo Finance 資料取得失敗 ${symbol}:`, error.message);
    return null;
  }
}

/**
 * 模擬 ETF 資料 (基於實際市場資料)
 * 台灣常見 ETF 代號速查表
 */
function getMockETFData(symbol) {
  const etfDatabase = {
    // 市值型 ETF
    '0050': {
      symbol: '0050',
      name: '元大台灣50',
      price: 52.5,
      previousClose: 52.3,
      volume: 15000000,
      dividendYield: 0.025, // 2.5%
      marketCap: 1500000000000, // 1.5 兆
      currency: 'TWD',
      exchange: 'TWSE',
      source: '模擬資料',
      description: '追蹤台灣50指數，投資台灣大型股',
      expenseRatio: 0.0032, // 0.32%
      lastDividend: 1.2,
      dividendFrequency: '季配',
      category: '市值型',
      topHoldings: ['台積電', '鴻海', '聯發科', '台達電', '中華電']
    },
    '0051': {
      symbol: '0051',
      name: '元大中型100',
      price: 35.2,
      previousClose: 35.0,
      volume: 2000000,
      dividendYield: 0.035, // 3.5%
      marketCap: 300000000000, // 3000 億
      currency: 'TWD',
      exchange: 'TWSE',
      source: '模擬資料',
      description: '追蹤中型100指數，投資中型股',
      expenseRatio: 0.0035, // 0.35%
      lastDividend: 1.2,
      dividendFrequency: '季配',
      category: '市值型',
      topHoldings: ['聯發科', '台達電', '聯電', '日月光', '南亞科']
    },
    
    // 高股息 ETF
    '0056': {
      symbol: '0056',
      name: '元大高股息',
      price: 28.5,
      previousClose: 28.2,
      volume: 8000000,
      dividendYield: 0.045, // 4.5%
      marketCap: 800000000000, // 8000 億
      currency: 'TWD',
      exchange: 'TWSE',
      source: '模擬資料',
      description: '投資高股息股票，提供穩定現金流',
      expenseRatio: 0.0035, // 0.35%
      lastDividend: 1.3,
      dividendFrequency: '季配',
      category: '高股息型',
      topHoldings: ['中華電', '台塑', '南亞', '台化', '統一']
    },
    '00878': {
      symbol: '00878',
      name: '國泰永續高股息',
      price: 16.8,
      previousClose: 16.6,
      volume: 12000000,
      dividendYield: 0.048, // 4.8%
      marketCap: 600000000000, // 6000 億
      currency: 'TWD',
      exchange: 'TWSE',
      source: '模擬資料',
      description: '永續高股息指數，ESG 篩選',
      expenseRatio: 0.0035, // 0.35%
      lastDividend: 0.8,
      dividendFrequency: '季配',
      category: '高股息型',
      topHoldings: ['中華電', '台塑', '南亞', '台化', '統一']
    },
    '00900': {
      symbol: '00900',
      name: '富邦特選高股息30',
      price: 15.8,
      previousClose: 15.6,
      volume: 5000000,
      dividendYield: 0.052, // 5.2%
      marketCap: 400000000000, // 4000 億
      currency: 'TWD',
      exchange: 'TWSE',
      source: '模擬資料',
      description: '特選高股息30指數，專注高股息策略',
      expenseRatio: 0.0038, // 0.38%
      lastDividend: 0.8,
      dividendFrequency: '季配',
      category: '高股息型',
      topHoldings: ['中華電', '台塑', '南亞', '台化', '統一']
    },
    '00919': {
      symbol: '00919',
      name: '群益台灣精選高息',
      price: 22.3,
      previousClose: 22.1,
      volume: 3000000,
      dividendYield: 0.055, // 5.5%
      marketCap: 200000000000, // 2000 億
      currency: 'TWD',
      exchange: 'TWSE',
      source: '模擬資料',
      description: '台灣精選高息指數，動態調整',
      expenseRatio: 0.0040, // 0.40%
      lastDividend: 1.2,
      dividendFrequency: '季配',
      category: '高股息型',
      topHoldings: ['中華電', '台塑', '南亞', '台化', '統一']
    },
    
    // 科技高股息 ETF
    '00929': {
      symbol: '00929',
      name: '復華台灣科技高息成長',
      price: 18.5,
      previousClose: 18.3,
      volume: 2500000,
      dividendYield: 0.042, // 4.2%
      marketCap: 150000000000, // 1500 億
      currency: 'TWD',
      exchange: 'TWSE',
      source: '模擬資料',
      description: '科技高息成長策略，科技股高股息',
      expenseRatio: 0.0042, // 0.42%
      lastDividend: 0.8,
      dividendFrequency: '季配',
      category: '科技高股息型',
      topHoldings: ['台積電', '聯發科', '台達電', '鴻海', '聯電']
    },
    
    // 海外型 ETF
    '0061': {
      symbol: '0061',
      name: '元大寶滬深',
      price: 42.8,
      previousClose: 42.5,
      volume: 1500000,
      dividendYield: 0.028, // 2.8%
      marketCap: 250000000000, // 2500 億
      currency: 'TWD',
      exchange: 'TWSE',
      source: '模擬資料',
      description: '追蹤滬深300指數，投資中國A股',
      expenseRatio: 0.0045, // 0.45%
      lastDividend: 1.2,
      dividendFrequency: '年配',
      category: '海外型',
      topHoldings: ['貴州茅台', '平安銀行', '招商銀行', '五糧液', '中國平安']
    }
  };

  const etfData = etfDatabase[symbol];
  if (!etfData) {
    return null;
  }

  // 添加一些隨機波動以模擬真實市場
  const priceVariation = (Math.random() - 0.5) * 0.02; // ±1%
  etfData.price = etfData.price * (1 + priceVariation);
  etfData.dailyChange = ((etfData.price - etfData.previousClose) / etfData.previousClose) * 100;

  return etfData;
}

/**
 * 計算 ETF 健康分數
 */
function calculateETFHealthScore(etfData) {
  let score = 50; // 基礎分數

  // 股息率分析 (40% 權重)
  if (etfData.dividendYield) {
    if (etfData.dividendYield > 0.05) {
      score += 20; // >5% 優秀
    } else if (etfData.dividendYield > 0.03) {
      score += 15; // 3-5% 良好
    } else if (etfData.dividendYield > 0.02) {
      score += 10; // 2-3% 一般
    }
  }

  // 費用率分析 (25% 權重)
  if (etfData.expenseRatio) {
    if (etfData.expenseRatio < 0.003) {
      score += 12; // <0.3% 優秀
    } else if (etfData.expenseRatio < 0.005) {
      score += 8; // 0.3-0.5% 良好
    } else {
      score -= 5; // >0.5% 較高
    }
  }

  // 成交量分析 (20% 權重)
  if (etfData.volume) {
    if (etfData.volume > 10000000) {
      score += 10; // 高流動性
    } else if (etfData.volume > 5000000) {
      score += 5; // 中等流動性
    }
  }

  // 市值分析 (15% 權重)
  if (etfData.marketCap) {
    if (etfData.marketCap > 1000000000000) {
      score += 8; // >1000億 大型
    } else if (etfData.marketCap > 500000000000) {
      score += 5; // 500-1000億 中型
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 格式化 ETF 報告
 */
function formatETFReport(etfData, healthScore) {
  const dividendYieldPercent = etfData.dividendYield ? (etfData.dividendYield * 100).toFixed(2) : 'N/A';
  const expenseRatioPercent = etfData.expenseRatio ? (etfData.expenseRatio * 100).toFixed(2) : 'N/A';
  const dailyChangePercent = etfData.dailyChange ? etfData.dailyChange.toFixed(2) : '0.00';
  const marketCapFormatted = etfData.marketCap ? formatMarketCap(etfData.marketCap) : 'N/A';

  return `📊 ${etfData.name} (${etfData.symbol}) ETF 健康報告

🏥 健康分數: ${healthScore}/100
💰 當前價格: $${etfData.price?.toFixed(2) || 'N/A'}
📈 漲跌幅: ${dailyChangePercent}%
💵 股息殖利率: ${dividendYieldPercent}%
📊 費用率: ${expenseRatioPercent}%
💎 市值: ${marketCapFormatted}
📊 成交量: ${etfData.volume?.toLocaleString() || 'N/A'}

📋 ETF 資訊:
• 類型: ${etfData.category || 'N/A'}
• 追蹤指數: ${etfData.description || 'N/A'}
• 配息頻率: ${etfData.dividendFrequency || 'N/A'}
• 最近配息: $${etfData.lastDividend || 'N/A'}
• 資料來源: ${etfData.source}

💡 投資建議:
${getETFRecommendation(healthScore, etfData)}`;
}

/**
 * 取得 ETF 投資建議
 */
function getETFRecommendation(healthScore, etfData) {
  if (healthScore >= 80) {
    return '🌟 優秀選擇 - 高股息率、低費用率，適合長期投資';
  } else if (healthScore >= 60) {
    return '✅ 良好選擇 - 平衡的風險報酬比，可考慮配置';
  } else if (healthScore >= 40) {
    return '⚠️ 一般選擇 - 需要關注費用率和流動性';
  } else {
    return '❌ 需要謹慎 - 建議進一步研究或考慮其他選項';
  }
}

/**
 * 格式化市值
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
 * 台灣 ETF 速查表
 * 提供常見 ETF 的基本資訊
 */
function getETFLookupTable() {
  return {
    // 市值型 ETF
    '0050': {
      name: '元大台灣50',
      category: '市值型',
      description: '追蹤台灣50指數，投資台灣大型股',
      dividendFrequency: '季配',
      typicalYield: '2.5-3.5%',
      expenseRatio: '0.32%',
      topHoldings: ['台積電', '鴻海', '聯發科', '台達電', '中華電']
    },
    '0051': {
      name: '元大中型100',
      category: '市值型',
      description: '追蹤中型100指數，投資中型股',
      dividendFrequency: '季配',
      typicalYield: '3.0-4.0%',
      expenseRatio: '0.35%',
      topHoldings: ['聯發科', '台達電', '聯電', '日月光', '南亞科']
    },
    
    // 高股息 ETF
    '0056': {
      name: '元大高股息',
      category: '高股息型',
      description: '投資高股息股票，提供穩定現金流',
      dividendFrequency: '季配',
      typicalYield: '4.0-5.5%',
      expenseRatio: '0.35%',
      topHoldings: ['中華電', '台塑', '南亞', '台化', '統一']
    },
    '00878': {
      name: '國泰永續高股息',
      category: '高股息型',
      description: '永續高股息指數，ESG 篩選',
      dividendFrequency: '季配',
      typicalYield: '4.5-5.5%',
      expenseRatio: '0.35%',
      topHoldings: ['中華電', '台塑', '南亞', '台化', '統一']
    },
    '00900': {
      name: '富邦特選高股息30',
      category: '高股息型',
      description: '特選高股息30指數，專注高股息策略',
      dividendFrequency: '季配',
      typicalYield: '5.0-6.0%',
      expenseRatio: '0.38%',
      topHoldings: ['中華電', '台塑', '南亞', '台化', '統一']
    },
    '00919': {
      name: '群益台灣精選高息',
      category: '高股息型',
      description: '台灣精選高息指數，動態調整',
      dividendFrequency: '季配',
      typicalYield: '5.0-6.5%',
      expenseRatio: '0.40%',
      topHoldings: ['中華電', '台塑', '南亞', '台化', '統一']
    },
    
    // 科技高股息 ETF
    '00929': {
      name: '復華台灣科技高息成長',
      category: '科技高股息型',
      description: '科技高息成長策略，科技股高股息',
      dividendFrequency: '季配',
      typicalYield: '4.0-5.0%',
      expenseRatio: '0.42%',
      topHoldings: ['台積電', '聯發科', '台達電', '鴻海', '聯電']
    },
    
    // 海外型 ETF
    '0061': {
      name: '元大寶滬深',
      category: '海外型',
      description: '追蹤滬深300指數，投資中國A股',
      dividendFrequency: '年配',
      typicalYield: '2.5-3.5%',
      expenseRatio: '0.45%',
      topHoldings: ['貴州茅台', '平安銀行', '招商銀行', '五糧液', '中國平安']
    }
  };
}

/**
 * 格式化 ETF 速查表
 */
function formatETFLookupTable() {
  const etfTable = getETFLookupTable();
  let table = '📊 台灣常見 ETF 速查表\n\n';
  
  // 按分類組織
  const categories = {
    '市值型': [],
    '高股息型': [],
    '科技高股息型': [],
    '海外型': []
  };
  
  // 分類 ETF
  Object.entries(etfTable).forEach(([code, info]) => {
    if (categories[info.category]) {
      categories[info.category].push({ code, ...info });
    }
  });
  
  // 生成表格
  Object.entries(categories).forEach(([category, etfs]) => {
    if (etfs.length > 0) {
      table += `🏷️ ${category} ETF:\n`;
      etfs.forEach(etf => {
        table += `• ${etf.code} ${etf.name}\n`;
        table += `  └ 殖利率: ${etf.typicalYield} | 費用率: ${etf.expenseRatio} | 配息: ${etf.dividendFrequency}\n`;
      });
      table += '\n';
    }
  });
  
  table += '💡 使用方式: 輸入「查詢 [代號]」即可獲得詳細分析\n';
  table += '📋 例如: 查詢 0050、查詢 00878、查詢 00929';
  
  return table;
}

module.exports = {
  getETFData,
  calculateETFHealthScore,
  formatETFReport,
  getMockETFData,
  getETFLookupTable,
  formatETFLookupTable
};
