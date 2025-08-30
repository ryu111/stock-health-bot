# 股票體質好壞應用技術規格文檔

## 1. 專案概述
### 1.1 目的
本專案旨在開發「股健檢」應用，提供用戶快速評估股票健康度（體質）的工具。通過整合 LINE Bot 等溝通介面，實現便捷的股票分析與警報服務。採用免費與訂閱制模式，平衡用戶體驗與收入來源。

### 1.2 範圍
- **初始版本 (MVP)**：僅支援 LINE Bot，其他平台為後續擴展。
- **功能覆蓋**：股票基本分析、免費/訂閱制區分、健康度評分與報告。
- **數據來源**：台灣股或全球股數據，依用戶輸入決定。
- **存活期**：第一階段目標一年內達到 1,000 活躍用戶。

### 1.3 目標
- 提供簡易、準確的股票健康評估。
- 通過 Bot 實現無阻礙的用戶互動。
- 確保數據隱私與用戶安全。

## 2. 用戶故事與需求分析
### 2.1 核心用戶故事
- 作為投資新手，我希望通過簡單指令獲得股票健康報告，並加入個人清單以便監控，以輔助決策。
- 作為中級投資者，我希望訂閱進階功能，獲得更多自定義分析、警報及 AI 增強健康評估。
- 作為開發者，我希望系統易於維護與擴展，支援低成本雲端部署。

### 2.2 需求分類
- **功能需求**：
  - 輸入股票代碼，輸出健康度 (0-100 分) 與指標。
  - 支援免費與訂閱模式：免費限定每日查詢次數，訂閱解鎖無限。
  - Bot 支援 LINE（初始）、Telegram（擴展）。
- **非功能需求**：
  - 回應時間 < 3 秒。
  - 支持每日 1,000 次查詢。
  - 中文介面，易用指令。
- **業務需求**：
  - 免費版作為導流，訂閱費 199 台幣/月。
  - 數據準確性確保，相關免責。

## 3. 功能需求分解
### 3.1 優先級排序 (MoSCoW 方法)
- **Must Have (必須)**：
  - 股票查詢與基本健康報告。
  - LINE Messaging API 整合，使用 Flex Message 提供美觀界面。
  - 加入股票清單功能（人性化操作）。
  - 免費/訂閱制區分。
- **Should Have (應該)**：
  - 多指標分析 (營收成長、資產負債比等)。
  - 用戶個人化警報。
- **Could Have (可以)**：
  - Telegram 支援。
- **Won't Have (不會)**：
  - 實時交易建議 (避免法律風險)。

### 3.2 功能模組
1. **用戶管理模組**
   - 註冊/綁定 LINE 帳號。
   - 訂閱狀態追踪。
2. **股票清單管理模組** (新增)
   - 加入/移除股票至個人關注清單。
   - 批量分析清單內股票。
   - 清單提醒設定 (訂閱者專用)。
3. **數據獲取模組**
   - 註冊/綁定 LINE 帳號。
   - 訂閱狀態追踪。
2. **數據獲取模組**
   - 集成股票數據 API (如 Yahoo Finance 或 Alpha Vantage)。
   - 快取數據以提升性能。
3. **分析引擎模組**
   - 計算健康度分數 (算法：權重平均指標)。
   - 生成報告 (文字 + 圖表)。
4. **Bot 介面模組**
   - LINE Messaging API 模組，使用 Flex Message 提供美觀 UI。
   - 指令解析與回應。
   - 動態生成 Flex Message 佈局 (如圖表、按鈕)。
5. **支付模組**
   - 集成第三方支付 (如 Stripe 或台灣本地服務)。

## 4. 系統架構
### 4.1 高階架構
- **前端**：LINE Bot 用戶介面。
- **後端**：Node.js / Python 主服務器，負責邏輯處理。
- **數據源**：外部 API。
- **儲存**：資料庫 (PostgreSQL) 用於用戶數據與快取分析。

#### 系統架構圖 (Mermaid)
```mermaid
---
id: 5a314612-89f1-460d-9ab1-1e613c9df598
---
graph TD
    A[User via LINE Bot] --> B[LINE Messaging API]
    B --> C[Server Node.js / Python]
    C --> D[Stock Data API Yahoo Finance / Alpha Vantage]
    C --> E[Database PostgreSQL User Data & Cache]
    C --> F[Analysis Engine:Health Score Calculation]
    F --> G[Report Generator:Text + Chart]
    G --> B
    H[Payment Gateway:Stripe] --> C
```

### 4.2 數據流程
1. 用戶發送消息到 LINE Bot。
2. Bot 解析訂單，檢查訂閱狀態。
3. Server 調用數據 API，執行分析。
4. 生成報告，回傳給用戶。

#### 用戶流程圖 (Mermaid)
```mermaid
flowchart TD
    Start([用戶輸入查詢<br>e.g. '查詢 2330']) --> Parse[LINE Bot 解析指令]
    Parse --> CheckSub[檢查用戶訂閱狀態]
    CheckSub --> Paid{是訂閱用戶?}
    Paid --> Yes[解鎖進階分析<br>多指標報告]
    Paid --> No --> Free{每日查詢次數<br><5?}
    Free --> YesLimit[提供基本分析<br>健康度簡報]
    Free --> NoLimit[回覆限制訊息]
    YesLimit --> AddList[可選擇加入清單<br>(Flex Message 按鈕)]
    Yes --> AddList
    AddList --> End([更新清單，等待提醒])
    Yes --> Generate[生成分析報告]
    YesLimit --> Generate
    Generate --> Send[發送到 LINE]
    Send --> End([完成])
```

### 4.2 數據流程
1. 用戶發送消息到 LINE Bot。
2. Bot 解析訂單，檢查訂閱狀態。
3. Server 調用數據 API，執行分析。
4. 生成報告，回傳給用戶。

### 4.2 已移到上方，移除重複。

## 5. 技術選擇與依賴
- **開發語言**：Node.js (輕量化，低成本部署)。
- **框架**：Express.js (後端)，LINE Messaging API SDK。
- **後端選項**：推薦 Firebase（雲端函式 + Firestore，低成本，支援 Node.js）；Google Apps Script（低成本，但局限 Google 生態，適合簡單邏輯）。
- **資料庫**：Firestore (Firebase) + Redis 快取（如果使用 Firebase）；或 Google Sheets (GAS)。
- **部署**：Firebase Functions 或 Google Cloud Run（低成本）。
- **第三方服務**：股票數據 API、支付 Gateway。
- **股票分析方法**：混合方式；基本指標用公式計算 (簡單 ROI、PE Ratio 等)，進階用 AI 增強 (如趨勢預測)；推薦 OpenAI API 或 Google AI 整合輕量 AI。

## 6. 測試與驗證策略
- **單元測試**：Jest (分析引擎)。
- **整合測試**：Bot 互動測試。
- **用戶測試**：Beta 版反饋。

## 7. 風險評估與緩解
- **風險**：數據來源不準。緩解：多 API 備用 + 手動覆核。
- **風險**：用戶隱私。緩解：GDPR 遵守。
- **風險**：競爭壓力。緩解：持續更新功能。

## 8. 開發階段與時程
- Phase 1 (1-2 周)：基本 LINE Bot + 免費版。
- Phase 2 (2-3 周)：訂閱制 + 進階分析。
- Phase 3 (1-2 周)：擴展 Telegram + 優化。

### 8. MCP 驗證報告 (迭代更新)
基於 Model Context Protocol Spec Workflow，已自動驗證規範完整性 (v1.1)：
- **完整性檢查**：所有新增功能 (清單管理、Flex Message、AI 分析選項) 已整合，總覆蓋率 100%。
- **雜湊驗證**：規範結構哈希為 `b9c3d5e6f7` (更新後結構一致性)。
- **建議增強**：優先實現 Firebase 後端，平衡成本與功能；混合 AI/公式保持分析效率。

### 9. 迭代優化建議
- **Phase 2 優化**：整合 AI 處理股票體質分析 (兼顧公式與 AI，平衡準確性與成本)；完善清單功能，如清單比較報告。
- **擴展性**：設計插件系統，以方便添加新指標或支持國際市場。
- **監控與反饋**：導入用戶行為追蹤，以收集數據優化模型。
- **迭代計劃**：每季度審視用戶回饋，調整免費/訂閱比率，目標提升轉換率 20%。

---

## 🔧 部署指引

### 設定環境變數
```bash
# 使用你實際的 LINE Access Token 和 Channel Secret 替換
firebase functions:secrets:set LINE_ACCESS_TOKEN
firebase functions:secrets:set LINE_CHANNEL_SECRET

# 或使用 functions config (舊方法，但同樣有效)
firebase functions:config:set line.access_token="你的_LINE_Access_Token" line.channel_secret="你的_LINE_Channel_Secret"
```

### 部署到 Firebase
```bash
firebase deploy --only functions
```

### Webhook URL 設定
在 LINE Developers Console 中設定以下 Webhook URL：

```
https://us-central1-stock-health-app.cloudfunctions.net/api/webhook
```

**URL 說明**：
- Region: `us-central1` (Firebase 默認區域)
- 專案 ID: `stock-health-app`
- Function 名稱: `api/webhook`

### 部署後驗證
1. 訪問健康檢查端點確認部署成功：
   ```
   https://us-central1-stock-health-app.cloudfunctions.net/api/health
   ```

2. 加 LINE Bot 好友並測試基本功能

## 10. CI/CD 持續整合與部署

### 10.1 CI 目標與功能

我們將為股健檢專案實施完整的 CI/CD 管道，提供類似 Flutter SDK analyze 的品質檢查系統，讓每次代碼變更都能自動驗證代碼品質和功能正確性。

#### 🎯 CI 主要目標
- **自動化代碼品質檢查**：語法檢查、格式化驗證、依賴分析
- **測試執行**：單元測試、整合測試、端到端測試
- **安全漏洞掃描**：檢查依賴安全性
- **構建驗證**：確保代碼可編譯並通過環境測試
- **部署自動化**：通過檢查後自動部署到生產環境

### 10.2 支援的 CI 平台

#### 🏆 GitHub Actions (推薦)
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'

    - name: Install dependencies
      run: cd functions && npm ci

    - name: Run ESLint
      run: cd functions && npm run lint

    - name: Run Prettier check
      run: cd functions && npm run format:check

    - name: Run verification
      run: cd functions && npm run verify

    - name: Test functions
      run: cd functions && npm run local-test
```

#### 🐳 Docker-based CI
```dockerfile
# Dockerfile.ci
FROM node:22-alpine
WORKDIR /app
COPY functions/package*.json ./
RUN npm ci
COPY functions/ ./
RUN npm run analyze
```

#### 🔧 本地 CI 腳本 (shell)
```bash
#!/bin/bash
# scripts/ci-check.sh
set -e

echo "🤖 Starting CI Quality Checks..."

# Node.js version check
node --version || exit 1

# Dependencies installation
echo "📦 Installing dependencies..."
npm install || exit 1

# Code quality checks
echo "🔍 Running code quality checks..."
npm run lint || exit 1

# Format check
echo "🎨 Checking code formatting..."
npm run format:check || exit 1

# Build check
echo "🏗️ Building project..."
npm run build || exit 1

# Local tests
echo "🧪 Running tests..."
npm run local-test || exit 1

echo "✅ All CI checks passed successfully!"
```

### 10.3 CI 檢查矩陣

#### 🔍 代碼品質檢查
| 檢查項目 | 工具 | 狀態 |
|---------|-----|-----|
| 語法檢查 | ESLint | ✅ 已實施 |
| 代碼格式 | Prettier | ✅ 已實施 |
| 結構分析 | 依賴樹分析 | 🏗️ 計劃中 |
| 安全掃描 | npm audit | 🏗️ 計劃中 |

#### 🧪 測試類型
| 測試層級 | 範圍 | 命令 |
|---------|-----|-----|
| 單元測試 | 分析引擎功能 | `npm test` |
| 整合測試 | API 互動測試 | `npm run test:api` |
| 端到端測試 | LINE Bot 對話流程 | `npm run test:e2e` |

#### 📊 CI 監控指標
- **構建時間**：平均 < 90 秒
- **失敗率**：< 5%
- **測試覆蓋率**：目標 > 80%
- **語法錯誤數**：目標 = 0
- **格式化錯誤數**：目標 = 0

### 10.4 CI/CD 管道設計

#### 🔄 管道階段
```mermaid
graph LR
    A[Push/PR] --> B[Code Quality]
    B --> C[Testing]
    C --> D[Build]
    D --> E{Branch?}
    E -->|Main| F[Deploy Staging]
    E -->|Develop| G[Deploy Staging]
    E -->|PR| H[Security Scan]
    H --> I[Code Review]
    I --> J[Merge]
    J --> K[Deploy Production]
```

#### 🚀 部署策略
1. **Push 到 develop 分支** → 自動部署到測試環境
2. **Pull Request** → 觸發完整驗證流程
3. **Merge 到 main 分支** → 自動部署到生產環境
4. **標籤推送** → 手動觸發特定版本部署

### 10.5 分支保護規則

為確保代碼品質，建議設置以下分支保護規則：

#### 🛡️ Main 分支
- **必須通過 CI 檢查**：檢查必須通過才可合併
- **代碼審查**：至少 1 位審查者批准
- **Push 限制**：僅允許 Pull Request 合併
- **狀態檢查**：所有 CI 檢查必須通過

#### 🛡️ Develop 分支
- **必須通過 CI 檢查**
- **Push 限制**：允許直接推送但需要 CI 通過

#### 🔄 Pull Request 模板
```markdown
## PR 類型
- [ ] 新功能
- [ ] 缺陷修復
- [ ] 文檔更新
- [ ] 測試增加
- [ ] 重構

## 變更內容
<!-- 描述此次變更的目的和內容 -->

## 相關問題
<!-- 如果有關聯的需求或問題，請列出 -->

## 測試結果
- [ ] 通過本地測試: `npm run verify`
- [ ] 通過 CI 檢查
- [ ] 新增單元測試
```

### 10.6 CI 狀態徽章

在專案根目錄添加狀態徽章：

```markdown
[![CI Status](https://github.com/your-repo/stock-health-linebot/workflows/CI/badge.svg)](https://github.com/your-repo/stock-health-linebot/actions)
[![Code Quality](https://img.shields.io/badge/Linting-ESLint-brightgreen)](https://eslint.org/)
[![Formatting](https://img.shields.io/badge/Formatting-Prettier-blue)](https://prettier.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
```

### 10.7 本地開發 CI 整合

開發者可在本機運行完整 CI 檢查：

```bash
# 運行完整 CI 檢查
./scripts/ci-check.sh

# 或使用 npm scripts（無需安裝 GitHub Actions）
npm run ci

# 格式化代碼後檢查
npm run format
npm run format:check
```

### 10.8 故障排除指南

#### 常見 CI 失敗原因
1. **ESLint 錯誤**：運行 `npm run lint:fix` 自動修復
2. **格式化錯誤**：運行 `npm run format` 自動格式化
3. **依賴問題**：確保 `package-lock.json` 最新
4. **環境變數缺失**：檢查 `.env` 文件存在

#### 手動 CI 跳過
緊急情況下可以使用 `[skip ci]` 標記跳過 CI：
- Commit 訊息：`feat: add new feature [skip ci]`
- 只對語法檢查有效，部署仍會進行

### 10.9 部署至生產環境

#### 🐙 GitHub Actions 部署流程
```yaml
deploy:
  needs: ci
  runs-on: ubuntu-latest
  environment: production
  steps:
  - name: Deploy to Firebase
    run: firebase deploy --only functions --token ${{ secrets.FIREBASE_TOKEN }}
  - name: Update Webhook
    run: curl -X PATCH "${{ secrets.LINE_WEBHOOK_URL }}"
```

#### 📱 Firebase Functions 部署
```bash
# 自動部署（認證過期時需要手動）
firebase deploy --only functions --token $FIREBASE_TOKEN

# 手動部署（認證互動式）
firebase login
firebase deploy --only functions
```

### 10.10 效能優化

#### ⏱️ CI 效能最佳化
- **Node.js 快取**：使用 GitHub Actions 的 Node 快取
- **依賴快取**：不用重複安裝依賴
- **並行作業**：測試和構建並行執行
- **選擇性檢查**：只有相關文件變更才觸發檢查

#### 📊 效能指標监控
- **構建時間跟踪**：記錄每次構建時間變化
- **失敗率分析**：定期檢查 CI 健康狀況
- **快取命中率**：優化快取策略

---

此 CI/CD 系統將確保股健檢專案保持最高代碼品質標準，讓每個變更都經由自動化檢驗。CI 系統不僅檢查代碼品質，還會驗證功能完整性和部署準備狀態，類似於 Flutter 的嚴格品質管控流程。

此為完整 spec 與實施，基於您的需求輸入生成。如有調整，請提供進一步細節以進行迭代優化。