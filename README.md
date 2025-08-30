# 📊 股健檢 LINE Bot

> 🎯 **類似 Flutter analyze 的株券健康分析 LINE Bot**

股健檢是一個智慧型 LINE Bot 應用，提供台灣股市股票健康度分析服務！通過整合 LINE Messaging API、Flex Message，以及 Yahoo Finance API，提供個人化的股票健康評估，幫助投資者做出更明智的決策。

[![CI Status](https://github.com/your-repo/stock-health-linebot/workflows/CI/badge.svg)](https://github.com/your-repo/stock-health-linebot/actions)
[![Code Quality](https://img.shields.io/badge/Linting-ESLint-brightgreen)](https://eslint.org/)
[![Formatting](https://img.shields.io/badge/Formatting-Prettier-blue)](https://prettier.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## ✨ 核心功能

### 🤖 智慧分析
- 📈 **技術分析**: 移動平均線、RSI、MACD等指標
- 📊 **基本面分析**: PE 本益比、股息率、ROE等關鍵指標
- 🎯 **綜合評分**: 0-100 健康度分數算法
- 🤖 **AI引擎**: 混合規則引擎與未來擴展至OpenAI整合

### 💬 用戶體驗
- 📱 **LINE Bot Interface**: 美觀 Flex Message 介面
- 🆔 **股票代碼查詢**: 支援台股代碼 (2330、0050等)
- 📝 **個人清單管理**: 加入/移除股票，批量分析
- 👤 **用戶模式**: 免費版 (限定查詢) vs 訂閱版 (無限分析)
- 🌐 **多言語支援**: 中文完整介面

## 🚀 快速開始

### 前置需求
- Node.js 22+
- Firebase CLI
- Git

### 安裝與設定

```bash
# 複製專案
git clone https://github.com/your-repo/stock-health-linebot.git
cd stock-health-linebot

# 安裝依賴
cd functions && npm install

# 環境設定
cp .env.example .env
# 編輯 .env 文件，填入 LINE API 金鑰
```

### 本地的 CI 檢查
```bash
# 運行完整品質檢查 (類似 Flutter analyze)
./scripts/ci-check.sh

# 或使用 npm 腳本
cd functions && npm run ci
```

### 部署到 Firebase
```bash
# 設定 Firebase
firebase use --add
firebase functions:deploy
```

## 🛠️ 開發環境

### 🔍 代碼品質工具
```bash
cd functions

# 語法檢查 (ESLint)
npm run lint

# 自動修復
npm run lint:fix

# 代碼格式化 (Prettier)
npm run format

# 格式檢查
npm run format:check

# 完整驗證
npm run verify
```

## 📋 可用指令

### 👥 用戶端指令
| 指令格式 | 功能說明 | 範例 |
|---------|---------|-----|
| `查詢 [代碼]` | 單股健康分析 | `查詢 2330` |
| `加入清單 [代碼]` | 加入關注清單 | `加入清單 0050` |
| `我的清單` | 查看個人清單 | `我的清單` |
| `詳細分析 [代碼]` | 深度AI分析 | `詳細分析 2330` |
| `幫助` | 顯示說明 | `幫助` |

### 🔧 開發端指令
```bash
# 本地測試
npm run local-test

# 品質分析
npm run analyze

# 部署驗證
npm run verify

# 完整的CI檢查
./scripts/ci-check.sh
```

## 🏗️ 系統架構

```
用戶 ← LINE Bot → Firebase Functions
                         ↓
             ⭕ Yahoo Finance API (數據來源)
                         ↓
               📊 分析引擎 (規則 + AI)
                         ↓
               💬 Flex Message (用戶介面)
```

### 技術棧
- **前端**: LINE Messaging API + Flex Message
- **後端**: Node.js + Express + Firebase Functions
- **數據**: Yahoo Finance API + Firebase Firestore
- **品質**: ESLint + Prettier + GitHub Actions CI/CD
- **部署**: Google Cloud (Firebase)

## 🎯 CI/CD 流程

我們的專案採用類似 Flutter analyze 的完整品質檢查系統：

### 🔄 自動化流程
```yaml
Push/PR → Code Quality → Testing → Build → Security → Deploy
     ↓           ↓           ↓        ↓        ↓         ↓
   ESLint     Unit Tests   Bundle    npm audit  Staging  Production
  Prettier     Int Tests   Size       Trivy      ↓         ↓
   Format       API Test   Minify     Config   Verify    Monitor
   Check                         ↓                 ↓
```

### 🛡️ 質量保障
- **語法檢查**: 0 ESLint 錯誤容忍度
- **格式化**: 100% Prettier 符合度
- **測試**: >80% 覆蓋率目標
- **建置**: 必須通過各環境測試
- **安全**: 自動漏洞掃描

## 📊 分析指標

### 🎯 健康度評分系統 (0-100)
| 分數區間 | 等級 | 投資建議 |
|---------|-----|---------|
| 80-100 | ⭐⭐⭐⭐⭐ 優良 | 積極投資區間 |
| 60-79 | ⭐⭐⭐⭐ 良好 | 可考慮布局 |
| 40-59 | ⭐⭐⭐ 一般 | 需謹慎評估 |
| 20-39 | ⭐⭐ 較差 | 建議觀望 |
| 0-19 | ⭐ 危險 | 極度謹慎 |

### 📈 評估指標
- **技術面**: 移動平均線、趨勢指標
- **基本面**: PE本益比、股息率、ROE
- **波動性**: 當日漲跌幅、52週範圍
- **風險度**: β值、流動性分析

## 🤝 貢獻指南

### 🌟 開發流程
1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 遵守代碼品質要求 (ESLint + Prettier)
4. 通過本地 CI 檢查 (`./scripts/ci-check.sh`)
5. 提交 Pull Request

### 📋 Pull Request 要求
- ✅ 所有 CB 檢查通過
- 👁️ Code Review 通過
- 📝 更新相關文檔
- 🧪 新功能有對應測試

```bash
# 完整驗證流程
git add .
npm run format  # 自動格式化
npm run lint:fix  # 自動修復
npm run verify   # 完整檢查
```

## 📖 API 文檔

### 本機端點
```bash
# 健康檢查
GET /health

# 股票分析
POST /analyze
Content-Type: application/json
{
  "symbol": "2330"
}
```

## 🚨 免責聲明

- 📊 **數據準確性**: 提供資訊分析服務，分析結果僅供參考
- ⚠️ **投資風險**: 股市有風險，投資須謹慎
- 🚫 **非投資建議**: 本服務不構成任何投資建議

## 📞 支援

- 📧 **電子郵件**: your.email@example.com
- 🐛 **問題回報**: [GitHub Issues](https://github.com/your-repo/stock-health-linebot/issues)
- 📖 **文檔**: [Wiki](https://github.com/your-repo/stock-health-linebot/wiki)
- 🇹🇼 **LINE 社群**: 加入官方測試群組

## 📄 授權

本專案採用 [ISC License](LICENSE) 授權條款。

---

**🌟 一起為台股投資指南航！**

如果您對此專案有興趣，歡迎 star 🌟 我們，以及參與貢獻！# 測試 pre-commit hook
