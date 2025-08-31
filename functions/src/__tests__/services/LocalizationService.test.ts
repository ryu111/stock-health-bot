import { LocalizationService } from '../../services/LocalizationService';

describe('LocalizationService', () => {
  let localizationService: LocalizationService;

  beforeEach(() => {
    localizationService = LocalizationService.getInstance();
  });

  describe('getSupportedLanguages', () => {
    it('應該返回支援的語言列表', () => {
      const languages = localizationService.getSupportedLanguages();
      
      expect(languages).toBeDefined();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages).toContain('zh_TW');
      expect(languages).toContain('en_US');
    });
  });

  describe('getCurrentLanguage', () => {
    it('應該返回當前語言', () => {
      const language = localizationService.getCurrentLanguage();
      
      expect(language).toBeDefined();
      expect(typeof language).toBe('string');
    });

    it('應該設置和返回語言', () => {
      localizationService.setLanguage('en_US');
      const language = localizationService.getCurrentLanguage();
      
      expect(language).toBe('en_US');
    });
  });

  describe('getText', () => {
    it('應該獲取中文文字', () => {
      const text = localizationService.getText('welcome', 'zh_TW');
      
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('應該獲取英文文字', () => {
      const text = localizationService.getText('welcome', 'en_US');
      
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('應該處理未知的翻譯鍵', () => {
      const text = localizationService.getText('unknown_key', 'zh_TW');
      
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
    });
  });

  describe('isLanguageSupported', () => {
    it('應該檢查支援的語言', () => {
      expect(localizationService.isLanguageSupported('zh_TW')).toBe(true);
      expect(localizationService.isLanguageSupported('en_US')).toBe(true);
      expect(localizationService.isLanguageSupported('fr_FR')).toBe(false);
    });
  });

  describe('getDefaultLanguage', () => {
    it('應該返回預設語言', () => {
      const defaultLang = localizationService.getDefaultLanguage();
      
      expect(defaultLang).toBeDefined();
      expect(typeof defaultLang).toBe('string');
      expect(localizationService.isLanguageSupported(defaultLang)).toBe(true);
    });
  });
});
