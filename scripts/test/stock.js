#!/usr/bin/env node

// 直接測試 stockService 功能
const path = require('path');

// 切換到 functions 目錄並載入環境變數
process.chdir(path.join(__dirname, '..', 'functions'));
require('dotenv').config();

const { getStockData, calculateHealthScore } = require('./stockService');

async function testStockService() {
  console.log('🧪 開始測試股票服務...');
  console.log('==============================================================');

  try {
    // 測試台積電
    console.log('📈 測試台積電 (2330.TW)...');
    const tsmcData = await getStockData('2330.TW');
    console.log('✅ 台積電資料:', {
      symbol: tsmcData.symbol,
      name: tsmcData.name,
      price: tsmcData.price,
      healthScore: calculateHealthScore(tsmcData)
    });

    console.log('\n📈 測試元大台灣50 (0050.TW)...');
    const etfData = await getStockData('0050.TW');
    console.log('✅ ETF 資料:', {
      symbol: etfData.symbol,
      name: etfData.name,
      price: etfData.price,
      healthScore: calculateHealthScore(etfData)
    });

    console.log('\n📈 測試元大高股息 (0056.TW)...');
    const dividendData = await getStockData('0056.TW');
    console.log('✅ 高股息 ETF 資料:', {
      symbol: dividendData.symbol,
      name: dividendData.name,
      price: dividendData.price,
      healthScore: calculateHealthScore(dividendData)
    });

    console.log('\n🎉 所有股票服務測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

// 執行測試
testStockService();
