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

## 🔧 環境變數

必需的環境變數：
- `LINE_ACCESS_TOKEN`: LINE Bot 存取令牌
- `LINE_CHANNEL_SECRET`: LINE Bot 頻道密鑰

## 📊 效能優化

- 使用 Firestore 快取股票資料
- 實作查詢限制和計數
- 支援免費和付費使用者功能
- 模組化設計便於擴展
