import request from 'supertest';
import express from 'express';
import { LineBotController } from '../../controllers/LineBotController';
import { TestUtils } from '../utils/testUtils';

// 模擬依賴
jest.mock('../../controllers/LineBotController');
jest.mock('../../config/FirebaseConfig');
jest.mock('../../utils/Logger', () => ({
  Logger: {
    getInstance: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      logApiRequest: jest.fn(),
    })),
  },
}));

describe('API Webhook 端點測試', () => {
  let app: express.Application;
  let mockLineBotController: jest.Mocked<LineBotController>;

  beforeEach(() => {
    // 重置模擬
    jest.clearAllMocks();

    // 創建模擬控制器
    mockLineBotController = {
      handleWebhook: jest.fn(),
    } as any;

    // 模擬 LineBotController 建構函數
    (LineBotController as jest.MockedClass<typeof LineBotController>).mockImplementation(() => mockLineBotController);

    // 創建 Express 應用
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 添加請求日誌中間件
    app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
      const startTime = Date.now();
      res.on('finish', () => {
        // 模擬日誌記錄
        void (Date.now() - startTime);
      });
      next();
    });

    // 添加 webhook 路由
    app.post('/webhook', async (req: express.Request, res: express.Response) => {
      try {
        await mockLineBotController.handleWebhook(req, res);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  describe('POST /webhook', () => {
    it('應該成功處理有效的 webhook 請求', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
      expect(mockLineBotController.handleWebhook).toHaveBeenCalledTimes(1);
    });

    it('應該處理空事件陣列', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const webhookData = {
        events: [],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('應該處理多個事件', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const mockMessageEvent1 = TestUtils.createMockLineEvent('message');
      const mockMessageEvent2 = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent1, mockMessageEvent2],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('應該處理控制器錯誤', async () => {
      // 模擬控制器拋出錯誤
      mockLineBotController.handleWebhook.mockImplementation(async (_req, _res) => {
        throw new Error('控制器錯誤');
      });

      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });

    it('應該處理無效的 JSON 格式', async () => {
      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('應該處理缺少事件陣列的請求', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const webhookData = {
        // 沒有 events 欄位
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('應該處理不同類型的事件', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const testCases = [
        { type: 'message', event: TestUtils.createMockLineEvent('message') },
        { type: 'postback', event: TestUtils.createMockLineEvent('postback') },
        { type: 'follow', event: TestUtils.createMockLineEvent('follow') },
        { type: 'unfollow', event: TestUtils.createMockLineEvent('unfollow') },
      ];

      for (const testCase of testCases) {
        const webhookData = {
          events: [testCase.event],
        };

        const response = await request(app)
          .post('/webhook')
          .set('Content-Type', 'application/json')
          .set('x-line-signature', 'test-signature')
          .send(webhookData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
      }
    });

    it('應該處理控制器返回不同狀態碼', async () => {
      // 模擬控制器返回 401 狀態碼
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('應該處理控制器返回 404 狀態碼', async () => {
      // 模擬控制器返回 404 狀態碼
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(404).json({ error: 'Not Found' });
      });

      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Not Found' });
    });
  });

  describe('請求驗證', () => {
    it('應該驗證 Content-Type 標頭', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent],
      };

      // 不設置 Content-Type 標頭
      const response = await request(app)
        .post('/webhook')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      // 應該仍然能處理請求
      expect(response.status).toBe(200);
    });

    it('應該處理不同的 User-Agent', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent],
      };

      const userAgents = [
        'LineBotWebhook/2.0',
        'Mozilla/5.0 (compatible; LineBot/1.0)',
        'LineBot/1.0',
        undefined,
      ];

      for (const userAgent of userAgents) {
        const requestBuilder = request(app)
          .post('/webhook')
          .set('Content-Type', 'application/json')
          .set('x-line-signature', 'test-signature')
          .send(webhookData);

        if (userAgent) {
          requestBuilder.set('User-Agent', userAgent);
        }

        const response = await requestBuilder;

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
      }
    });
  });

  describe('錯誤處理', () => {
    it('應該處理控制器拋出非 Error 物件', async () => {
      // 模擬控制器拋出字串錯誤
      mockLineBotController.handleWebhook.mockImplementation(async (_req, _res) => {
        throw '字串錯誤';
      });

      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });

    it('應該處理控制器拋出 null 錯誤', async () => {
      // 模擬控制器拋出 null 錯誤
      mockLineBotController.handleWebhook.mockImplementation(async (_req, _res) => {
        throw null;
      });

      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      const webhookData = {
        events: [mockMessageEvent],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理大型事件陣列', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      // 創建一個較大的事件陣列
      const events = Array(10).fill(null).map(() => TestUtils.createMockLineEvent('message'));
      const webhookData = {
        events,
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('應該處理空請求體', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('應該處理特殊字元在事件中', async () => {
      // 模擬控制器成功回應
      mockLineBotController.handleWebhook.mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      const specialEvent = {
        ...TestUtils.createMockLineEvent('message'),
        message: {
          ...TestUtils.createMockLineEvent('message').message,
          text: '2330@#$%^&*()_+-=[]{}|;:,.<>?',
        },
      };

      const webhookData = {
        events: [specialEvent],
      };

      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
