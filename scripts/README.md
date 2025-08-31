# 股健檢專案腳本工具

這個目錄包含了股健檢專案的各種自動化腳本，現在已全面升級為 TypeScript 版本。

## 📁 目錄結構

```
scripts/
├── deploy/          # 部署相關腳本
│   ├── deploy.ts    # Firebase 部署腳本
│   └── deploy.sh    # Shell 部署腳本
├── dev/             # 開發環境腳本
│   ├── start.ts     # 本地開發環境啟動
│   ├── structure.ts # 專案結構分析
│   └── start.sh     # Shell 啟動腳本
├── test/            # 測試腳本
│   ├── local.ts     # 本地功能測試
│   ├── api.ts       # API 端點測試
│   ├── stock.ts     # 股票服務測試
│   ├── etf-debug.ts # ETF 查詢除錯
│   └── local.sh     # Shell 測試腳本
├── ci/              # CI/CD 腳本
│   ├── check.ts     # 品質檢查腳本
│   ├── check.sh     # Shell 檢查腳本
│   └── stats.json   # 統計資料
├── package.json     # 腳本依賴管理
├── tsconfig.json    # TypeScript 配置
└── README.md        # 說明文件
```

## 🚀 快速開始

### 安裝依賴

```bash
cd scripts
npm install
```

### 編譯 TypeScript

```bash
npm run build
```

### 執行腳本

```bash
# 部署到 Firebase
npm run deploy

# 啟動本地開發環境
npm run dev:start

# 分析專案結構
npm run dev:structure

# 執行本地測試
npm run test:local

# 測試 API 端點
npm run test:api

# 測試股票服務
npm run test:stock

# ETF 除錯測試
npm run test:etf-debug

# CI 品質檢查
npm run ci:check
```

## 📋 腳本說明

### 部署腳本 (deploy/)

- **deploy.ts**: Firebase Functions 部署腳本
  - 檢查 Firebase 登入狀態
  - 執行品質檢查
  - 部署到生產環境

### 開發腳本 (dev/)

- **start.ts**: 本地開發環境啟動
  - 啟動 Firebase 模擬器
  - 設定開發環境變數

- **structure.ts**: 專案結構分析
  - 顯示專案目錄結構
  - 檢查檔案組織

### 測試腳本 (test/)

- **local.ts**: 本地功能測試
  - 執行完整的本地測試流程
  - 驗證基本功能

- **api.ts**: API 端點測試
  - 測試健康檢查端點
  - 測試股票查詢 API
  - 測試 ETF 查詢 API

- **stock.ts**: 股票服務測試
  - 測試台積電 (2330.TW)
  - 測試元大台灣50 (0050.TW)
  - 測試元大高股息 (0056.TW)

- **etf-debug.ts**: ETF 查詢除錯
  - 測試不同股票代碼格式
  - 驗證 Yahoo Finance API 回應

### CI 腳本 (ci/)

- **check.ts**: 品質檢查
  - 執行程式碼品質檢查
  - 驗證建置流程

## 🔧 開發工具

### TypeScript 配置

- 嚴格模式啟用
- ES2022 目標
- 完整的類型檢查
- 源碼映射支援

### 程式碼品質

```bash
# 程式碼檢查
npm run lint

# 自動修復
npm run lint:fix

# 程式碼格式化
npm run format

# 檢查格式化
npm run format:check
```

## 📦 依賴管理

### 開發依賴

- `@types/node`: Node.js 類型定義
- `typescript`: TypeScript 編譯器
- `ts-node`: TypeScript 執行環境
- `eslint`: 程式碼檢查工具
- `prettier`: 程式碼格式化工具

### 執行依賴

- `dotenv`: 環境變數管理
- `yahoo-finance2`: Yahoo Finance API

## 🎯 使用範例

### 部署到生產環境

```bash
cd scripts
npm run deploy
```

### 本地開發測試

```bash
cd scripts
npm run dev:start
npm run test:api
```

### 股票服務測試

```bash
cd scripts
npm run test:stock
```

## 🔍 除錯

### 常見問題

1. **TypeScript 編譯錯誤**
   - 檢查 `tsconfig.json` 配置
   - 確認所有依賴已安裝

2. **腳本執行失敗**
   - 檢查環境變數設定
   - 確認 Firebase 登入狀態

3. **API 測試失敗**
   - 確認本地伺服器正在運行
   - 檢查網路連線狀態

### 日誌查看

所有腳本都會輸出詳細的執行日誌，包含：
- 執行步驟
- 錯誤訊息
- 成功狀態

## 📝 注意事項

1. 所有腳本都使用 TypeScript 編寫，提供完整的類型安全
2. 腳本支援非同步操作和錯誤處理
3. 使用類別結構組織程式碼，便於維護和擴展
4. 所有腳本都可以獨立執行或作為模組匯入

## 🤝 貢獻

當新增或修改腳本時，請：

1. 使用 TypeScript 編寫
2. 遵循現有的類別結構
3. 添加適當的錯誤處理
4. 更新此 README 文件
5. 執行測試確保功能正常
