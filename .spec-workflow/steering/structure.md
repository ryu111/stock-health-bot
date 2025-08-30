# 專案結構

## 目錄組織

```
股健檢/
├── functions/                    # Firebase Functions 後端
│   ├── controllers/             # 控制器層 (MVC)
│   │   ├── webhookController.js # LINE Webhook 處理
│   │   └── lineController.js    # LINE Bot 邏輯
│   ├── services/                # 服務層 (業務邏輯)
│   │   ├── stockService.js      # 股票分析服務
│   │   ├── aiAnalyzer.js        # AI 分析引擎
│   │   └── etfDataService.js    # ETF 數據服務
│   ├── config/                  # 配置檔案
│   │   └── line.js             # LINE Bot 配置
│   ├── utils/                   # 工具函數
│   ├── node_modules/           # 依賴套件
│   ├── index.js                # 主入口檔案
│   ├── package.json            # 套件配置
│   ├── .eslintrc.js           # ESLint 配置
│   └── .prettierrc.js         # Prettier 配置
├── scripts/                     # CI/CD 腳本
│   ├── ci-check.sh            # 品質檢查腳本
│   ├── ci-check.js            # Node.js 品質檢查
│   └── ci-stats.json          # 檢查統計
├── .spec-workflow/             # 規格工作流程
│   ├── steering/              # 專案導向文件
│   │   ├── product.md         # 產品願景
│   │   ├── tech.md           # 技術決策
│   │   └── structure.md      # 專案結構
│   ├── specs/                # 功能規格
│   └── approval/             # 審核狀態
├── .vscode/                    # VS Code 配置
│   └── launch.json           # 除錯配置
├── .github/                    # GitHub 配置
├── firebase.json              # Firebase 配置
├── firestore.rules            # Firestore 安全規則
├── firestore.indexes.json     # Firestore 索引
├── .firebaserc               # Firebase 專案配置
├── README.md                  # 專案說明
└── spec.md                   # 技術規格文件
```

## 命名規範

### 檔案
- **控制器**: `camelCase` (例如: `webhookController.js`)
- **服務**: `camelCase` (例如: `stockService.js`)
- **配置**: `camelCase` (例如: `line.js`)
- **工具**: `camelCase` (例如: `dateUtils.js`)
- **測試**: `[filename].test.js` (例如: `stockService.test.js`)

### 程式碼
- **類別**: `PascalCase` (例如: `StockAnalyzer`)
- **函數/方法**: `camelCase` (例如: `analyzeStock`)
- **常數**: `UPPER_SNAKE_CASE` (例如: `MAX_RETRY_COUNT`)
- **變數**: `camelCase` (例如: `stockData`)

## 匯入模式

### 匯入順序
1. Node.js 內建模組
2. 第三方套件
3. Firebase 相關模組
4. 內部模組 (相對路徑)
5. 配置檔案

### 模組組織
```javascript
// 1. Node.js 內建模組
const express = require('express');
const cors = require('cors');

// 2. 第三方套件
const line = require('@line/bot-sdk');

// 3. Firebase 模組
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// 4. 內部模組
const { lineMiddleware } = require('./config/line');
const { handleWebhook } = require('./controllers/webhookController');
```

## 程式碼結構模式

### 模組/類別組織
```javascript
// 1. 匯入和依賴
const dependencies = require('./dependencies');

// 2. 常數和配置
const CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT: 5000
};

// 3. 類型定義 (如果使用 TypeScript)
// interface StockData { ... }

// 4. 主要實作
class StockService {
  constructor() {
    // 初始化
  }
  
  async analyzeStock(symbol) {
    // 核心邏輯
  }
}

// 5. 輔助函數
function validateSymbol(symbol) {
  // 驗證邏輯
}

// 6. 匯出/公開 API
module.exports = StockService;
```

### 函數/方法組織
```javascript
async function analyzeStock(symbol) {
  // 1. 輸入驗證
  if (!symbol) {
    throw new Error('股票代碼不能為空');
  }
  
  // 2. 核心邏輯
  const stockData = await fetchStockData(symbol);
  const analysis = await performAnalysis(stockData);
  
  // 3. 錯誤處理
  if (!analysis) {
    throw new Error('分析失敗');
  }
  
  // 4. 回傳結果
  return analysis;
}
```

### 檔案組織原則
- **單一職責**: 每個檔案只負責一個明確的功能
- **模組化**: 相關功能組織在一起
- **公開 API**: 在檔案頂部或底部定義
- **實作細節**: 隱藏在模組內部

## 程式碼組織原則

1. **單一職責**: 每個檔案應該有明確的單一目的
2. **模組化**: 程式碼應該組織成可重複使用的模組
3. **可測試性**: 結構化程式碼以便於測試
4. **一致性**: 遵循程式碼庫中建立的模式

## 模組邊界

### 分層架構
- **控制器層**: 處理 HTTP 請求和回應
- **服務層**: 業務邏輯和數據處理
- **配置層**: 應用程式配置和設定
- **工具層**: 通用工具函數

### 依賴方向
```
控制器 → 服務 → 工具
   ↓       ↓      ↓
配置 ←─────┴──────┘
```

### 邊界模式
- **公開 API vs 內部**: 只匯出必要的函數和類別
- **穩定 vs 實驗性**: 生產程式碼與實驗性功能分離
- **核心 vs 擴展**: 核心功能與可選功能分離

## 程式碼大小指南

- **檔案大小**: 最大 500 行
- **函數/方法大小**: 最大 50 行
- **類別/模組複雜度**: 最大 10 個方法
- **巢狀深度**: 最大 4 層

## 儀表板/監控結構

### 儀表板組織
```
.spec-workflow/
├── steering/          # 專案導向文件
├── specs/            # 功能規格
├── approval/         # 審核狀態
└── session.json      # 會話狀態
```

### 關注點分離
- 儀表板與核心業務邏輯分離
- 獨立的 CLI 入口點
- 對主要應用程式的最小依賴
- 可以停用而不影響核心功能

## 文檔標準

- 所有公開 API 必須有文檔
- 複雜邏輯應該包含內嵌註解
- 主要模組的 README 檔案
- 遵循 JavaScript 文檔慣例
- 使用 JSDoc 格式註解