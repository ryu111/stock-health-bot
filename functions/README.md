# 🔧 Functions 目錄

此目錄包含股健檢 LINE Bot 的 Firebase Functions 程式碼，採用模組化架構設計。

## 📂 目錄結構

```
functions/
├── services/          # 🔧 業務邏輯服務層
│   ├── stockService.js      # 股票資料服務
│   ├── etfDataService.js    # ETF 資料服務
│   └── aiAnalyzer.js        # AI 分析服務
├── controllers/       # 🎮 控制器層
│   ├── lineController.js    # LINE 訊息處理
│   └── webhookController.js # Webhook 處理
├── utils/            # 🛠️ 工具函數
│   ├── flexMessages.js      # Flex 訊息生成
│   └── formatters.js        # 格式化工具
├── config/           # ⚙️ 配置檔案
│   ├── firebase.js          # Firebase 配置
│   └── line.js              # LINE Bot 配置
├── index.js          # 🚪 主入口檔案
└── 其他配置檔案...
```

## 🏗️ 架構說明

### 🔧 Services 層 (業務邏輯)
- **stockService.js**: 處理股票資料取得、快取、健康分數計算
- **etfDataService.js**: 處理 ETF 資料取得、分析、報告生成
- **aiAnalyzer.js**: 提供 AI 風格的股票分析

### 🎮 Controllers 層 (控制器)
- **lineController.js**: 處理 LINE 訊息、查詢、使用者互動
- **webhookController.js**: 處理 webhook 請求、測試端點

### 🛠️ Utils 層 (工具函數)
- **flexMessages.js**: 生成 LINE Flex Messages
- **formatters.js**: 格式化工具函數

### ⚙️ Config 層 (配置)
- **firebase.js**: Firebase Admin 初始化和配置
- **line.js**: LINE Bot 配置和客戶端初始化

## 🚀 主要功能

### 📊 股票分析
- 即時股票資料取得
- 健康分數計算
- 技術面和基本面分析
- 歷史資料分析

### 📈 ETF 分析
- 台灣常見 ETF 資料庫
- ETF 專用健康分數
- 費用率和殖利率分析
- ETF 速查表功能

### 🤖 AI 分析
- 智能投資建議
- 風險評估
- 市場情緒分析
- 詳細分析報告

### 💬 LINE Bot 功能
- 文字訊息處理
- Flex Messages 回應
- 使用者管理
- 監控清單功能

## 🔄 資料流程

```
LINE 訊息 → Webhook → Controller → Service → 外部 API → 回應
    ↓
Firebase Firestore (快取/使用者資料)
```

## 📝 開發指南

### 新增功能
1. 在適當的 service 層新增業務邏輯
2. 在 controller 層處理請求
3. 在 utils 層新增工具函數
4. 更新配置檔案（如需要）

### 測試
- 使用 `/test-webhook` 端點進行本地測試
- 使用 `scripts/test/` 目錄下的測試腳本

### 部署
- 使用 `scripts/deploy/deploy.sh` 進行部署
- 確保所有環境變數已設定

## 🧪 測試框架

### 📋 測試架構

本專案使用 Jest 作為測試框架，採用 TypeScript 編寫測試，提供完整的測試覆蓋率。

```
src/__tests__/
├── api/                    # API 端點測試
│   └── webhook.test.ts     # Webhook 整合測試
├── controllers/            # 控制器測試
│   └── LineBotController.test.ts
├── services/               # 服務層測試
│   ├── AIAnalyzer.test.ts
│   ├── ETFDataService.test.ts
│   └── StockService.test.ts
├── utils/                  # 工具函數測試
│   ├── Formatter.test.ts
│   ├── Validation.test.ts
│   └── FlexMessageGenerator.test.ts
├── e2e/                    # 端到端測試
│   └── completeFlow.test.ts
├── setup/                  # 測試設置
│   └── testSetup.ts
├── mocks/                  # 模擬服務
│   └── mockServices.ts
└── utils/                  # 測試工具
    └── testUtils.ts
```

### 🚀 測試命令

```bash
# 執行所有測試
npm test

# 執行測試並監聽檔案變更
npm run test:watch

# 執行測試並生成覆蓋率報告
npm run test:coverage

# 執行 CI 環境測試
npm run test:ci

# 執行中文化測試報告
npm run test:chinese

# 執行中文化覆蓋率檢查
npm run test:coverage:chinese

# 執行特定測試檔案
npm test -- --testPathPattern=Formatter.test.ts

# 執行特定類型的測試
npm test -- --testPathPattern="(api|controllers)"  # 整合測試
npm test -- --testPathPattern="e2e"                # 端到端測試
```

### 📊 覆蓋率報告

```bash
# 生成簡要覆蓋率報告
npm run test:coverage

# 生成 HTML 覆蓋率報告
npm run test:coverage:html

# 生成完整覆蓋率報告 (多種格式)
npm run test:coverage:full

# 檢查覆蓋率閾值
npm run test:coverage:check
```

### 🎯 測試類型

#### 1. 單元測試 (Unit Tests)
- **位置**: `src/__tests__/services/`, `src/__tests__/utils/`
- **目的**: 測試個別函數和類別的功能
- **特點**: 快速執行，隔離測試，模擬外部依賴

#### 2. 整合測試 (Integration Tests)
- **位置**: `src/__tests__/controllers/`, `src/__tests__/api/`
- **目的**: 測試組件間的互動
- **特點**: 測試真實的 API 端點和控制器邏輯

#### 3. 端到端測試 (E2E Tests)
- **位置**: `src/__tests__/e2e/`
- **目的**: 測試完整的用戶流程
- **特點**: 模擬真實用戶操作，測試整個系統

### 🌐 中文化測試報告

專案提供中文化的測試報告功能，讓測試結果更容易理解：

#### 功能特點
- ✅ **中文覆蓋率統計**: 語句、分支、函數、行數覆蓋率
- ✅ **中文測試摘要**: 測試套件、測試案例、執行時間
- ✅ **CI/CD 整合**: 自動在 CI 流程中使用中文化報告
- ✅ **保持原始輸出**: 同時保留 Jest 的標準輸出

#### 使用方式
```bash
# 執行中文化測試報告
npm run test:chinese

# 輸出範例
🧪 開始執行測試...
📊 測試結果摘要 (中文版)
📈 覆蓋率統計 (中文版):
語句覆蓋率: 48.08% ( 704/1464 )
分支覆蓋率: 38% ( 439/1155 )
函數覆蓋率: 53.14% ( 152/286 )
行數覆蓋率: 48.91% ( 697/1425 )
```

#### CI/CD 整合
- **Shell 腳本**: `scripts/ci/check.sh` 已整合中文化測試
- **TypeScript 腳本**: `scripts/ci/check.ts` 支援中文化報告
- **Pre-commit Hook**: 自動執行中文化測試檢查

### 🔧 測試工具

#### TestUtils
提供可重複使用的測試工具和模擬數據：

```typescript
import { TestUtils } from '../utils/testUtils';

// 創建模擬股票數據
const mockStockData = TestUtils.createMockStockData('2330');

// 創建模擬 LINE 事件
const mockEvent = TestUtils.createMockLineEvent('查詢 2330');
```

#### 模擬服務 (Mock Services)
- **位置**: `src/__tests__/mocks/mockServices.ts`
- **功能**: 模擬外部 API 和服務
- **包含**: Yahoo Finance API, LINE Bot API, Firebase Admin SDK

### 📈 覆蓋率標準

| 模組類型 | 語句覆蓋率 | 分支覆蓋率 | 函數覆蓋率 | 行覆蓋率 |
|---------|-----------|-----------|-----------|----------|
| 全域 | 35% | 30% | 40% | 35% |
| 服務層 | 55% | 50% | 60% | 55% |
| 控制器層 | 55% | 50% | 60% | 55% |
| 工具函數 | 75% | 70% | 80% | 75% |

### 🛠️ 測試最佳實踐

#### 1. 測試命名
```typescript
describe('Formatter', () => {
  describe('formatCurrency', () => {
    it('應該正確格式化台幣', () => {
      // 測試實作
    });
    
    it('應該處理無效輸入', () => {
      // 測試實作
    });
  });
});
```

#### 2. 測試結構 (AAA 模式)
```typescript
it('應該正確格式化貨幣', () => {
  // Arrange (準備)
  const amount = 1234.56;
  
  // Act (執行)
  const result = Formatter.formatCurrency(amount, 'TWD');
  
  // Assert (斷言)
  expect(result).toContain('$1,234.56');
});
```

#### 3. 模擬外部依賴
```typescript
// 模擬外部服務
jest.mock('../../services/StockService');
jest.mock('../../utils/Logger');

// 在測試中設置模擬回應
jest.spyOn(stockService, 'getStockData').mockResolvedValue(mockData);
```

#### 4. 測試邊界條件
```typescript
it('應該處理極端數值', () => {
  expect(Formatter.formatLargeNumber(0)).toBe('0');
  expect(Formatter.formatLargeNumber(Number.MAX_SAFE_INTEGER)).toContain('T');
});
```

### 🔄 CI/CD 整合

#### 自動化測試
```bash
# 執行完整 CI 檢查 (包含測試)
npm run ci:full

# 僅執行測試相關檢查
npm run ci:test
```

#### 測試失敗處理
- 測試失敗會阻止部署
- 覆蓋率低於閾值會產生警告
- 自動生成測試報告

### 🚀 VS Code 開發配置

專案提供完整的 VS Code 啟動配置，讓開發更便利：

#### 🧪 測試相關配置
- **🧪 Jest 測試 (監控模式)**: 邊寫邊測試，自動重新執行
- **🧪 Jest 測試 (中文化報告)**: 執行中文化測試報告
- **🧪 Jest 測試 (覆蓋率)**: 生成詳細覆蓋率報告
- **📊 覆蓋率檢查 (中文化)**: 執行中文化覆蓋率檢查
- **🧪 Jest 測試 (特定檔案)**: 測試特定檔案 (如 Formatter)
- **🧪 Jest 測試 (E2E)**: 執行端到端測試
- **🧪 Jest 測試 (整合測試)**: 執行 API 和控制器測試

#### 🔍 品質檢查配置
- **🔍 快速品質檢查**: 執行 ESLint 檢查
- **🔍 程式碼格式檢查**: 檢查 Prettier 格式

#### 使用方式
1. 在 VS Code 中按 `F5` 或點擊 "Run and Debug"
2. 選擇需要的配置
3. 一鍵執行，無需手動輸入指令

#### 開發流程建議
```bash
# 日常開發流程
1. 選擇 "🧪 Jest 測試 (監控模式)" - 邊寫邊測試
2. 選擇 "🔍 快速品質檢查" - 檢查程式碼品質
3. 選擇 "🧪 Jest 測試 (中文化報告)" - 查看完整測試結果
4. 選擇 "📊 覆蓋率檢查 (中文化)" - 檢查覆蓋率達標情況
5. 選擇 "🔍 程式碼品質檢查" - 完整 CI 檢查
```

### 📚 測試文檔

#### 新增測試
1. 在適當的測試目錄創建 `.test.ts` 檔案
2. 使用描述性的測試名稱
3. 包含正面和負面測試案例
4. 確保測試覆蓋率達標

#### 維護測試
- 定期更新模擬數據
- 監控測試執行時間
- 檢查覆蓋率趨勢
- 移除過時的測試

### 🐛 常見問題

#### 1. 測試執行緩慢
- 使用 `npm run test:watch` 進行增量測試
- 檢查模擬設置是否正確
- 避免不必要的網路請求

#### 2. 覆蓋率不達標
- 檢查是否有未測試的邊界條件
- 確保所有分支都有測試案例
- 考慮降低特定模組的覆蓋率要求

#### 3. 模擬失敗
- 確保模擬檔案路徑正確
- 檢查模擬函數的實作
- 驗證模擬數據的格式

## 🔧 環境變數

必需的環境變數：
- `LINE_ACCESS_TOKEN`: LINE Bot 存取令牌
- `LINE_CHANNEL_SECRET`: LINE Bot 頻道密鑰

## 📊 效能優化

- 使用 Firestore 快取股票資料
- 實作查詢限制和計數
- 支援免費和付費使用者功能
- 模組化設計便於擴展
