# 技術棧

## 專案類型
股健檢是一個雲端服務應用，主要提供 LINE Bot 介面的股票分析服務。採用 Serverless 架構，透過 Firebase Functions 提供可擴展的後端服務。

## 核心技術

### 主要程式語言
- **語言**: JavaScript (Node.js 24)
- **運行時**: Node.js 24 LTS
- **語言特定工具**: npm 套件管理、ESLint 語法檢查、Prettier 格式化

### 關鍵依賴/函式庫
- **@line/bot-sdk**: LINE Messaging API 整合，版本 10.2.0
- **express**: Web 框架，版本 5.1.0
- **firebase-functions**: Serverless 函數框架，版本 6.4.0
- **firebase-admin**: Firebase 管理 SDK，版本 13.5.0
- **yahoo-finance2**: Yahoo Finance API 客戶端，版本 2.13.3
- **axios**: HTTP 客戶端，版本 1.11.0
- **cors**: 跨域資源共享，版本 2.8.5
- **dotenv**: 環境變數管理，版本 16.4.5

### 應用程式架構
採用 **MVC (Model-View-Controller)** 架構模式：
- **Model**: 服務層 (services/) 處理業務邏輯和數據操作
- **View**: LINE Flex Message 提供用戶介面
- **Controller**: 控制器層 (controllers/) 處理請求路由和回應

### 數據儲存
- **主要儲存**: Firebase Firestore (NoSQL 文件資料庫)
- **快取**: Firebase Functions 記憶體快取
- **數據格式**: JSON 格式，支援結構化查詢

### 外部整合
- **LINE Messaging API**: 用戶介面和訊息處理
- **Yahoo Finance API**: 股票數據來源
- **Firebase Authentication**: 用戶身份驗證 (未來擴展)
- **協議**: HTTP/REST API、Webhook
- **認證**: LINE Channel Access Token、API 金鑰

### 監控與儀表板技術
- **儀表板框架**: 自建 Web 儀表板 (spec-workflow)
- **即時通訊**: WebSocket 連接
- **視覺化函式庫**: Chart.js (未來整合)
- **狀態管理**: Firebase Firestore 作為單一數據來源

## 開發環境

### 建置與開發工具
- **建置系統**: npm scripts
- **套件管理**: npm
- **開發工作流程**: 本地開發伺服器、熱重載

### 代碼品質工具
- **靜態分析**: ESLint 8.57.0
- **格式化**: Prettier 3.3.3
- **測試框架**: 計劃整合 Jest (目前使用手動測試)
- **文檔**: Markdown 格式，GitHub Pages

### 版本控制與協作
- **VCS**: Git
- **分支策略**: GitHub Flow
- **代碼審查流程**: Pull Request 審查

### 儀表板開發
- **即時重載**: 檔案監控自動重載
- **端口管理**: 動態分配可用端口
- **多實例支援**: 每個專案獨立儀表板

## 部署與分發
- **目標平台**: Google Cloud Platform (Firebase)
- **分發方法**: SaaS 服務，透過 LINE Bot 存取
- **安裝需求**: 無需用戶安裝，純雲端服務
- **更新機制**: 自動部署，零停機更新

## 技術需求與約束

### 效能需求
- **回應時間**: < 3 秒 (股票分析查詢)
- **吞吐量**: 支援每日 1,000 次查詢
- **記憶體使用**: Firebase Functions 記憶體限制
- **啟動時間**: 冷啟動 < 10 秒

### 相容性需求
- **平台支援**: LINE 平台、Web 瀏覽器
- **依賴版本**: Node.js 24+、Firebase Functions 6.4+
- **標準遵循**: LINE Messaging API 規範

### 安全性與合規
- **安全需求**: HTTPS 加密、API 金鑰保護、用戶數據隱私
- **合規標準**: 台灣個資法、GDPR (未來國際化)
- **威脅模型**: API 濫用防護、數據洩露防護

### 可擴展性與可靠性
- **預期負載**: 1,000 活躍用戶
- **可用性需求**: 99.9% 正常運行時間
- **成長預測**: 支援 10,000+ 用戶擴展

## 技術決策與理由

### 決策記錄
1. **Firebase Functions**: 選擇 Serverless 架構以降低運營成本和簡化部署
2. **LINE Bot 介面**: 選擇 LINE 平台以觸達台灣用戶群體
3. **Yahoo Finance API**: 選擇可靠的股票數據來源，支援台股數據
4. **MVC 架構**: 採用清晰的分層架構以提升代碼可維護性
5. **JSON 數據格式**: 選擇輕量級格式以提升 API 效能

## 已知限制
- **冷啟動延遲**: Firebase Functions 冷啟動可能影響回應時間
- **數據來源依賴**: 依賴 Yahoo Finance API 的可用性
- **LINE 平台限制**: 受 LINE Messaging API 功能限制
- **測試覆蓋率**: 目前缺乏完整的自動化測試
- **國際化支援**: 目前僅支援中文介面