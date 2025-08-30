// Firebase 配置
const admin = require('firebase-admin');

// 初始化 Firebase Admin
admin.initializeApp();

// Firestore 參考
const db = admin.firestore();

module.exports = {
  admin,
  db,
};
