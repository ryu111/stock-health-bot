#!/usr/bin/env node
const path = require('path');
process.chdir(path.join(__dirname, '..', 'functions'));

const yahooFinance = require('yahoo-finance2').default;

async function testETFQueries() {
  console.log('🧪 開始 ETF 查詢除錯測試...');
  console.log('==============================================================');
  
  const testSymbols = [
    '0050.TW',
    '0050',
    '0056.TW', 
    '0056',
    '2330.TW', // 對照組
    '2330'
  ];

  for (const symbol of testSymbols) {
    console.log(`\n📈 測試 ${symbol}...`);
    try {
      const quote = await yahooFinance.quote(symbol);
      console.log(`✅ ${symbol} 成功:`);
      console.log(`   - 名稱: ${quote.shortName || quote.longName || quote.symbol}`);
      console.log(`   - 價格: ${quote.regularMarketPrice || quote.price}`);
      console.log(`   - 類型: ${quote.quoteType || 'unknown'}`);
      console.log(`   - 交易所: ${quote.exchange}`);
      console.log(`   - 貨幣: ${quote.currency}`);
      
      if (quote.fundProfile) {
        console.log(`   - 基金資料: 有`);
      }
      if (quote.assetProfile) {
        console.log(`   - 資產資料: 有`);
      }
    } catch (error) {
      console.log(`❌ ${symbol} 失敗: ${error.message}`);
    }
  }
  
  console.log('\n🎉 ETF 除錯測試完成！');
}

testETFQueries().catch(console.error);
