# 🤝 Contributing to 股健檢 LINE Bot

感謝您對股健檢 LINE Bot的興趣！我們歡迎各種形式的貢獻，包括錯誤修復、新功能、功能改進、文檔更新等。

## 📋 開發設定

### 🔧 環境準備
```bash
# 複製專案
git clone https://github.com/your-repo/stock-health-linebot.git
cd stock-health-linebot

# 安裝依賴
cd functions && npm install

# 設定環境變數
cp .env.example .env
# 編輯 .env 文件，填入必要的 API 金鑰
```

### 🏗️ 代碼品質要求
在提交代碼前，請確保通過所有品質檢查：

```bash
# 運行完整品質檢查
../scripts/ci-check.sh

# 或在 functions 目錄中運行：
npm run ci
```

### 🔍 品質檢查項目
- ✅ **ESLint**: 語法檢查 (0錯誤容忍度)
- ✅ **Prettier**: 代碼格式化 (100%符合度)
- ✅ **Build**: 專案建置驗證
- ✅ **Tests**: 測試用例通過

## 🌟 貢獻流程

### 1. Fork 專案
點擊右上角的 "Fork" 按鈕創建自己的副本。

### 2. 建立功能分支
```bash
git checkout -b feature/your-feature-name
# 或修復bug
git checkout -b bugfix/issue-number
```

### 3. 進行更改
```bash
# 開發時進行品質檢查
npm run lint          # 語法檢查
npm run format        # 自動格式化
npm run lint:fix      # 自動修復
```

### 4. 提交更改
```bash
git add .
git commit -m "feat: 簡潔描述變更內容

- 詳細說明更改的原因和內容
- 如果有問題單號，請提及

BREAKING CHANGE: 如果有破壞性變更

doc: 更新README說明
fix: 修復股票解析錯誤
feat: 新增個人清單功能"
```

### 5. 推送分支
```bash
git push origin feature/your-feature-name
```

### 6. 創建 Pull Request
1. 在 GitHub 上點擊 "Compare & pull request"
2. 挑選基地板分支 (通常是 `main` 或 `develop`)
3. 填寫 PR 描述 (參考 PR 模板)
4. 請求 Code Review
5. 等待 CI 檢查通過

## 📋 Pull Request 要求

### ✅ 必須檢查項目
- [ ] 🔍 **CI 通過**: 所有 GitHub Actions 必須成功
- [ ] 👁️ **Code Review**: 至少一位審查者通過
- [ ] 🎨 **代碼格式**: Prettier 格式化通過
- [ ] 📖 **文檔更新**: 新功能有對應文檔
- [ ] 🧪 **測試**: 相關測試已完成

### 📝 PR 類型
- `feat:` 新功能
- `fix:` 缺陷修復
- `docs:` 文檔更新
- `style:` 代碼風格調整
- `refactor:` 重構
- `test:` 測試相關
- `chore:` 雜項 (如配置更新)

## 🚨 分支策略

### 🌟 主要分支
- **main**: 生產環境部署分支，保護分支
- **develop**: 開發主分支，保護分支

### 🌱 功能分支
- 新功能: `feature/feature-name`
- 修復: `bugfix/issue-number`
- 熱修復: `hotfix/bug-description`

```bash
# 創建功能分支建議格式
git checkout -b feature/add-stock-alerts
git checkout -b bugfix/fix-parsing-error-123
git checkout -b hotfix/critical-api-fix
```

## 🛡️ 代碼品質標準

### JavaScript/TypeScript 標準
```javascript
// ✅ 正確格式
const analyzeStock = async (symbol) => {
  try {
    const data = await getStockData(symbol);
    return {
      score: calculateScore(data),
      analysis: '詳細分析結果'
    };
  } catch (error) {
    console.error('Analysis failed:', error);
    throw new Error('分析失敗');
  }
};

// ❌ 錯誤格式
const analyzeStock = async (symbol) => {
  try{const data = await getStockData(symbol); // 無空格
    return {score: calculateScore(data),analysis: '詳細分析結果'}
  } catch(error){console.error('Analysis failed:', error); throw new Error('分析失敗');}
};
```

### 提交訊息格式
```bash
# ✅ 正確格式
fix: resolve stock data parsing timeout

- Add retry mechanism for API calls
- Increase timeout to 10 seconds
- Add proper error handling

fix: handle empty stock response

- Check for null/undefined responses
- Add default fallback values
- Improve user feedback messages

# ❌ 錯誤格式
fixed bug in parser  # 英文
修正股票代號有些問題  # 太寬泛
update some code     # 無清楚說明
FIXED!!              # 過度標點
```

## 🔍 故障排除

### 常見問題

#### 1. ESLint 錯誤
```bash
❌ no-unused-vars: 'response' is defined but never used

npm run lint:fix  # 自動修復
```

#### 2. Prettier 格式化錯誤
```bash
❌ Code style issues found

npm run format    # 自動格式化
```

#### 3. CI 檢查失敗
```bash
❌ Dependencies installation failed

npm ci            # 重新安裝依賴
npm cache clean --force
```

#### 4. 環境變數缺失
```bash
❌ .env file missing

cp .env.example .env
# 編輯 .env，填入 API 金鑰
```

#### 5. 建置錯誤
```bash
❌ Syntax error in index.js

node -c index.js  # 檢查語法
npm run lint      # 詳細檢查
```

## 📊 測試策略

### 單元測試
```javascript
// functions/test/stockService.test.js
const { calculateHealthScore } = require('../stockService');

describe('Stock Service', () => {
  test('應該正確計算健康分數', () => {
    const mockData = {
      price: 100,
      peRatio: 15,
      dividendYield: 0.03
    };

    const result = calculateHealthScore(mockData);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
```

### 整合測試
```bash
# 測試 LINE Bot 互動
npm run test:api

# 測試 Firebase Functions
npm run test:functions
```

## 🎨 設計指南

### UI/UX 設計原則
1. **一致性**: 使用統一的色彩和字體
2. **簡單性**: 功能盡量簡潔，避免過度複雜
3. **響應性**: 支援行動裝置的最佳體驗
4. **無障礙**: 支持螢幕閱讀器和鍵盤導航

### API 設計原則
```javascript
// ✅ RESTful 設計
GET    /api/stocks/2330
POST   /api/lists
PUT    /api/lists/1
DELETE /api/lists/1

// ✅ 統一回應格式
{
  success: true,
  data: { /* 數據 */ },
  error: null,
  timestamp: "2024-01-01T00:00:00Z"
}
```

## 🌍 國際化與本地化

### 中英文支援
```javascript
// functions/utils/i18n.js
const messages = {
  zh: {
    welcome: '歡迎使用股健檢',
    analysisComplete: '分析完成'
  },
  en: {
    welcome: 'Welcome to Stock Health',
    analysisComplete: 'Analysis Complete'
  }
};

module.exports = { messages };
```

## 📈 效能優化

### 快取策略
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5分鐘

async function getCachedStockData(symbol) {
  let data = cache.get(symbol);

  if (!data) {
    data = await fetchStockData(symbol);
    cache.set(symbol, data);
  }

  return data;
}
```

### 數據庫優化
```javascript
// 使用索引優化查詢
const stockLists = collection('stockLists')
  .where('userId', '==', userId)
  .where('symbol', '==', symbol)
  .orderBy('lastAnalyzed', 'desc')
  .limit(10);
```

## 📞 獲取幫助

### 💬 聯絡方式
- 🐛 **問題回報**: [GitHub Issues](https://github.com/your-repo/stock-health-linebot/issues)
- 💬 **討論區**: [GitHub Discussions](https://github.com/your-repo/stock-health-linebot/discussions)
- 📧 **電子郵件**: your.email@example.com
- 🇹🇼 **LINE 社群**: 加入測試群組分享經驗

### 🆘 緊急支援
如果遇到緊急問題或安全漏洞，請直接聯絡維護者。

## 📝 貢獻者認可

我們誠摯感謝所有貢獻者：

<a href="https://github.com/your-repo/stock-health-linebot/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=your-repo/stock-health-linebot" />
</a>

---

## ⚡ 快速開始檢查列表

- [ ] Fork 專案並複製到本地
- [ ] 安裝 Node.js 依賴: `npm install`
- [ ] 設定環境變數文件
- [ ] 運行品質檢查: `../scripts/ci-check.sh`
- [ ] 建立功能分支
- [ ] 進行代碼變更
- [ ] 通過所有品質檢查
- [ ] 提交 Pull Request

祝您貢獻愉快！🎉