// 模擬 Firebase Functions
export const functions = {
  https: {
    onRequest: jest.fn(),
    onCall: jest.fn()
  },
  firestore: {
    document: jest.fn(),
    collection: jest.fn()
  },
  pubsub: {
    topic: jest.fn(),
    schedule: jest.fn()
  }
};

export const https = functions.https;
export const firestore = functions.firestore;
export const pubsub = functions.pubsub;
