#!/usr/bin/env ts-node

import * as path from 'path';
import yahooFinance from 'yahoo-finance2';

// Yahoo Finance 報價介面
interface YahooQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  price?: number;
  quoteType?: string;
  exchange?: string;
  currency?: string;
  fundProfile?: any;
  assetProfile?: any;
}

/**
 * ETF 查詢除錯測試腳本
 */
class ETFDebugScript {
  private readonly testSymbols: string[] = [
    '0050.TW',
    '0050',
    '0056.TW', 
    '0056',
    '2330.TW', // 對照組
    '2330'
  ];

  constructor() {
    // 切換到 functions 目錄
    process.chdir(path.join(__dirname, '..', 'functions'));
  }

  /**
   * 執行 ETF 查詢除錯測試
   */
  async run(): Promise<void> {
    console.log('🧪 開始 ETF 查詢除錯測試...');
    console.log('==============================================================');
    
    for (const symbol of this.testSymbols) {
      await this.testSymbol(symbol);
    }
    
    console.log('\n🎉 ETF 除錯測試完成！');
  }

  /**
   * 測試單一股票代碼
   */
  private async testSymbol(symbol: string): Promise<void> {
    console.log(`\n📈 測試 ${symbol}...`);
    try {
      const quote: YahooQuote = await yahooFinance.quote(symbol);
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
      console.log(`❌ ${symbol} 失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// 執行測試
if (require.main === module) {
  const etfDebugScript = new ETFDebugScript();
  etfDebugScript.run().catch(error => {
    console.error('ETF 除錯測試失敗:', error);
    process.exit(1);
  });
}

export { ETFDebugScript };


