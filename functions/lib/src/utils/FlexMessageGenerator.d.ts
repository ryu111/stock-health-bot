import { StockData, ETFData } from '../types/stock';
import { AnalysisResult } from '../types/analysis';
import { LineFlexReplyMessage } from '../types/line-events';
export declare class FlexMessageGenerator {
    /**
     * 建立股票資訊訊息
     * @param stockData - 股票資料
     * @returns Flex 訊息
     */
    createStockInfoMessage(stockData: StockData): LineFlexReplyMessage;
    /**
     * 建立分析結果訊息
     * @param analysisResult - 分析結果
     * @returns Flex 訊息
     */
    createAnalysisMessage(analysisResult: AnalysisResult): LineFlexReplyMessage;
    /**
     * 建立 ETF 資訊訊息
     * @param etfData - ETF 資料
     * @returns Flex 訊息
     */
    createETFInfoMessage(etfData: ETFData): LineFlexReplyMessage;
    /**
     * 建立錯誤訊息
     * @param message - 錯誤訊息
     * @returns Flex 訊息
     */
    createErrorMessage(message: string): LineFlexReplyMessage;
    /**
     * 格式化市值
     * @param marketCap - 市值
     * @returns 格式化後的市值
     */
    private formatMarketCap;
    /**
     * 取得分數顏色
     * @param score - 分數
     * @returns 顏色代碼
     */
    private getScoreColor;
    /**
     * 取得建議文字
     * @param recommendation - 建議類型
     * @returns 建議文字
     */
    private getRecommendationText;
    /**
     * 取得建議顏色
     * @param recommendation - 建議類型
     * @returns 顏色代碼
     */
    private getRecommendationColor;
}
//# sourceMappingURL=FlexMessageGenerator.d.ts.map