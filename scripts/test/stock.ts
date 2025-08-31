#!/usr/bin/env ts-node

import * as path from 'path';
import * as dotenv from 'dotenv';

// 股票資料介面
interface StockData {
  symbol: string;
  name: string;
  price: number;
  [key: string]: any;
}

/**
 * 股票服務測試腳本
 */
class StockTestScript {
  private stockService: any;

  constructor() {
    // 切換到 functions 目錄並載入環境變數
    process.chdir(path.join(__dirname, '..', 'functions'));
    dotenv.config();
    
    // 動態載入股票服務
    this.stockService = require('./stockService');
  }

  /**
   * 執行股票服務測試
   */
  async run(): Promise<void> {
    console.log('🧪 開始測試股票服務...');
    console.log('==============================================================');

    try {
      // 測試台積電
      await this.testTSMC();

      // 測試元大台灣50
      await this.test0050();

      // 測試元大高股息
      await this.test0056();

      console.log('\n🎉 所有股票服務測試完成！');
    } catch (error) {
      console.error('❌ 測試失敗:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  /**
   * 測試台積電
   */
  private async testTSMC(): Promise<void> {
    console.log('📈 測試台積電 (2330.TW)...');
    const tsmcData: StockData = await this.stockService.getStockData('2330.TW');
    console.log('✅ 台積電資料:', {
      symbol: tsmcData.symbol,
      name: tsmcData.name,
      price: tsmcData.price,
      healthScore: this.stockService.calculateHealthScore(tsmcData)
    });
  }

  /**
   * 測試元大台灣50
   */
  private async test0050(): Promise<void> {
    console.log('\n📈 測試元大台灣50 (0050.TW)...');
    const etfData: StockData = await this.stockService.getStockData('0050.TW');
    console.log('✅ ETF 資料:', {
      symbol: etfData.symbol,
      name: etfData.name,
      price: etfData.price,
      healthScore: this.stockService.calculateHealthScore(etfData)
    });
  }

  /**
   * 測試元大高股息
   */
  private async test0056(): Promise<void> {
    console.log('\n📈 測試元大高股息 (0056.TW)...');
    const dividendData: StockData = await this.stockService.getStockData('0056.TW');
    console.log('✅ 高股息 ETF 資料:', {
      symbol: dividendData.symbol,
      name: dividendData.name,
      price: dividendData.price,
      healthScore: this.stockService.calculateHealthScore(dividendData)
    });
  }
}

// 執行測試
if (require.main === module) {
  const stockTestScript = new StockTestScript();
  stockTestScript.run().catch(error => {
    console.error('股票服務測試失敗:', error);
    process.exit(1);
  });
}

export { StockTestScript };


