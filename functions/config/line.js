// LINE Bot 配置
const line = require('@line/bot-sdk');

// 從 .env 檔案載入環境變數
require('dotenv').config();

// LINE Bot 配置
const lineConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// 驗證必需的環境變數
if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
  throw new Error('請設置環境變數: LINE_ACCESS_TOKEN 和 LINE_CHANNEL_SECRET');
}

// 建立 LINE 客戶端
const lineClient = new line.Client(lineConfig);

// 處理 LINE webhook 驗證的中介軟體
const lineMiddleware = line.middleware(lineConfig);

console.log('LINE Bot 初始化成功');

module.exports = {
  lineConfig,
  lineClient,
  lineMiddleware,
};
