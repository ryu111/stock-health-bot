# 📁 Scripts 目錄

此目錄包含股健檢 LINE Bot 專案的各種腳本工具，按功能分類組織。

## 📂 目錄結構

```
scripts/
├── dev/           # 🚀 開發相關腳本
├── test/          # 🧪 測試相關腳本
├── ci/            # 🔍 CI/CD 相關腳本
└── deploy/        # 🚀 部署相關腳本
```

## 🚀 開發腳本 (dev/)

### `start.sh` / `start.js`
- **功能**：啟動本地 Firebase 開發環境
- **使用**：`./scripts/dev/start.sh` 或 `node scripts/dev/start.js`
- **VS Code**：用於 launch.json 配置

### `structure.js`
- **功能**：顯示專案結構
- **使用**：`node scripts/dev/structure.js`
- **VS Code**：用於 launch.json 配置

## 🧪 測試腳本 (test/)

### `local.sh` / `local.js`
- **功能**：執行本地 API 測試
- **使用**：`./scripts/test/local.sh` 或 `node scripts/test/local.js`
- **測試內容**：股票查詢、ETF 查詢、基本功能

### `api.js`
- **功能**：API 測試工具
- **使用**：`node scripts/test/api.js`
- **功能**：測試各種 API 端點

### `stock.js`
- **功能**：股票服務測試
- **使用**：`node scripts/test/stock.js`
- **功能**：直接測試 stockService 功能

### `etf-debug.js`
- **功能**：ETF 除錯工具
- **使用**：`node scripts/test/etf-debug.js`
- **功能**：測試 ETF 資料取得

## 🔍 CI/CD 腳本 (ci/)

### `check.sh` / `check.js`
- **功能**：執行完整的品質檢查
- **使用**：`./scripts/ci/check.sh` 或 `node scripts/ci/check.js`
- **檢查項目**：ESLint、Prettier、建置、測試

### `stats.json`
- **功能**：CI 統計資料
- **用途**：記錄 CI 執行統計

## 🚀 部署腳本 (deploy/)

### `deploy.sh`
- **功能**：部署到 Firebase
- **使用**：`./scripts/deploy/deploy.sh`
- **流程**：品質檢查 → 部署 → 驗證

## 💡 使用建議

### 開發流程
```bash
# 1. 啟動開發環境
./scripts/dev/start.sh

# 2. 執行測試
./scripts/test/local.sh

# 3. 品質檢查
./scripts/ci/check.sh

# 4. 部署
./scripts/deploy/deploy.sh
```

### VS Code 整合
這些腳本已整合到 VS Code launch.json 中，可以直接在 VS Code 中執行。

### Pre-commit Hook
`ci/check.sh` 已整合到 Git pre-commit hook 中，每次 commit 前會自動執行品質檢查。
