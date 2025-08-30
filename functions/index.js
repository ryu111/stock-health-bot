// 股健檢 LINE Bot 主入口檔案
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// 載入配置
const { lineMiddleware } = require('./config/line');

// 載入控制器
const {
  handleTestWebhook,
  handleWebhook,
} = require('./controllers/webhookController');

// 建立 Express 應用程式
const app = express();

// 中介軟體
app.use(cors({ origin: true }));
app.use(express.json());

console.log('股健檢 LINE Bot 伺服器已初始化');

// 基本端點
app.get('/', (req, res) => {
  res.json({
    status: '股健檢 Bot 運行中',
    timestamp: new Date().toISOString(),
  });
});

app.get('/test', (req, res) => {
  res.send('股健檢 API 正在運行！');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Webhook 端點
app.post('/test-webhook', handleTestWebhook);
app.post('/webhook', lineMiddleware, handleWebhook);

// 匯出 Firebase Function
exports.api = functions.https.onRequest(app);
