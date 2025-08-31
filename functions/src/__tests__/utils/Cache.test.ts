import { Cache } from '../../utils/Cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache({
      ttl: 3600,
      maxSize: 1000,
      cleanupInterval: 300
    });
  });

  afterEach(() => {
    cache.cleanup();
  });

  describe('set', () => {
    it('應該設置快取項目', () => {
      cache.set('test-key', 'test-value', 1000);
      
      expect(cache.has('test-key')).toBe(true);
    });

    it('應該設置快取項目並指定過期時間', () => {
      cache.set('test-key', 'test-value', 100);
      
      expect(cache.has('test-key')).toBe(true);
    });
  });

  describe('get', () => {
    it('應該獲取快取項目', () => {
      cache.set('test-key', 'test-value', 1000);
      const value = cache.get('test-key');
      
      expect(value).toBe('test-value');
    });

    it('應該返回 undefined 當項目不存在', () => {
      const value = cache.get('non-existent-key');
      
      expect(value).toBeUndefined();
    });

    it('應該返回 undefined 當項目不存在', () => {
      const value = cache.get('non-existent-key');
      expect(value).toBeUndefined();
    });
  });

  describe('has', () => {
    it('應該檢查項目是否存在', () => {
      expect(cache.has('test-key')).toBe(false);
      
      cache.set('test-key', 'test-value', 1000);
      expect(cache.has('test-key')).toBe(true);
    });

    it('應該檢查項目是否存在', () => {
      expect(cache.has('test-key')).toBe(false);
      
      cache.set('test-key', 'test-value', 1000);
      expect(cache.has('test-key')).toBe(true);
    });
  });

  describe('delete', () => {
    it('應該刪除快取項目', () => {
      cache.set('test-key', 'test-value', 1000);
      expect(cache.has('test-key')).toBe(true);
      
      cache.delete('test-key');
      expect(cache.has('test-key')).toBe(false);
    });

    it('應該處理刪除不存在的項目', () => {
      expect(() => cache.delete('non-existent-key')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('應該清空所有快取項目', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      
      cache.clear();
      
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('size', () => {
    it('應該返回快取項目數量', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1', 1000);
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2', 1000);
      expect(cache.size()).toBe(2);
      
      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });
  });

  describe('getStats', () => {
    it('應該返回快取統計', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      
      const stats = cache.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.size).toBe(2);
      expect(stats.hitRate).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('應該執行清理操作', () => {
      cache.set('test-key', 'test-value', 1000);
      expect(cache.has('test-key')).toBe(true);
      
      cache.cleanup();
      expect(cache.has('test-key')).toBe(false);
    });
  });
});
