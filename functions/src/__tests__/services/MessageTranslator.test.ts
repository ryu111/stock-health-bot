import { MessageTranslator } from '../../services/MessageTranslator';

describe('MessageTranslator', () => {
  let messageTranslator: MessageTranslator;

  beforeEach(() => {
    messageTranslator = new MessageTranslator();
  });

  describe('translateMessage', () => {
    it('應該翻譯股票查詢訊息', async () => {
      const translated = await messageTranslator.translateMessage('stock_query', 'zh_TW');
      
      expect(translated).toBeDefined();
      expect(typeof translated).toBe('string');
      expect(translated.length).toBeGreaterThan(0);
    });

    it('應該翻譯 ETF 查詢訊息', async () => {
      const translated = await messageTranslator.translateMessage('etf_query', 'zh_TW');
      
      expect(translated).toBeDefined();
      expect(typeof translated).toBe('string');
      expect(translated.length).toBeGreaterThan(0);
    });

    it('應該翻譯錯誤訊息', async () => {
      const translated = await messageTranslator.translateMessage('error_message', 'zh_TW');
      
      expect(translated).toBeDefined();
      expect(typeof translated).toBe('string');
      expect(translated.length).toBeGreaterThan(0);
    });

    it('應該翻譯英文訊息', async () => {
      const translated = await messageTranslator.translateMessage('stock_query', 'en_US');
      
      expect(translated).toBeDefined();
      expect(typeof translated).toBe('string');
      expect(translated.length).toBeGreaterThan(0);
    });

    it('應該處理未知的翻譯鍵', async () => {
      const translated = await messageTranslator.translateMessage('unknown_key', 'zh_TW');
      
      expect(translated).toBeDefined();
      expect(typeof translated).toBe('string');
    });
  });

  describe('translateMessages', () => {
    it('應該批量翻譯訊息', async () => {
      const texts = ['stock_query', 'etf_query'];
      const translated = await messageTranslator.translateMessages(texts, 'zh_TW');
      
      expect(translated).toBeDefined();
      expect(Array.isArray(translated)).toBe(true);
      expect(translated.length).toBe(2);
      expect(typeof translated[0]).toBe('string');
      expect(typeof translated[1]).toBe('string');
    });
  });

  describe('detectTextLanguage', () => {
    it('應該檢測文字語言', async () => {
      const detected = await messageTranslator.detectTextLanguage('Hello world');
      
      expect(detected).toBeDefined();
      expect(typeof detected).toBe('string');
    });
  });
});
