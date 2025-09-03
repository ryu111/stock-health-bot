// 資料品質控制器
import {
  DataSource,
  DataQuality,
  DataQualityFactor,
  DataQualityLevel,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../types/data-source';
import { StockData, ETFData } from '../types/stock';

export type Analyzable = StockData | ETFData | Record<string, unknown>;

export interface DataQualityOptions {
  minimumCompleteness?: number;
  maximumAgeHours?: number;
  anomalySigmaThreshold?: number;
  requiredFields?: string[];
}

export class DataQualityController {
  private readonly options: Required<DataQualityOptions>;

  constructor(options?: DataQualityOptions) {
    this.options = {
      minimumCompleteness: options?.minimumCompleteness ?? 0.8,
      maximumAgeHours: options?.maximumAgeHours ?? 24,
      anomalySigmaThreshold: options?.anomalySigmaThreshold ?? 3,
      requiredFields: options?.requiredFields ?? ['symbol', 'price', 'lastUpdated'],
    };
  }

  validate(data: Analyzable, _source: DataSource): Promise<ValidationResult> {
    const start = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // 1) 基本有效性檢查
    if (!data || typeof data !== 'object') {
      errors.push({ code: 'INVALID_DATA', message: '資料格式無效', severity: 'critical' });
    }

    // 2) 完整性檢查
    const completeness = this.calculateCompleteness(data, this.options.requiredFields);
    if (completeness < this.options.minimumCompleteness) {
      errors.push({
        code: 'LOW_COMPLETENESS',
        message: `資料完整性過低: ${completeness}`,
        severity: 'error',
      });
      suggestions.push('補齊必要欄位，或調整資料來源以提升可用性');
    }

    // 3) 時效性檢查
    const timeliness = this.checkTimeliness(data);
    if (timeliness.ageHours > this.options.maximumAgeHours) {
      warnings.push({
        code: 'DATA_OUTDATED',
        message: `資料老化 ${timeliness.ageHours.toFixed(1)} 小時`,
        impact: 'high',
      });
      suggestions.push('重新抓取資料以確保即時性');
    }

    // 4) 合法性檢查（欄位值範圍）
    const validityScore = this.checkValidity(data, errors, warnings);

    // 5) 一致性檢查（跨欄位邏輯）
    const consistencyScore = this.checkConsistency(data, warnings);

    // 6) 異常偵測（簡易統計/閾值）
    const anomalyIssues = this.detectAnomalies(data);
    warnings.push(...anomalyIssues);

    // 7) 組合品質評分
    const quality = this.buildDataQuality({
      completeness,
      timelinessScore: Math.max(0, 1 - timeliness.ageHours / this.options.maximumAgeHours),
      consistencyScore,
      validityScore,
      issues: [...errors.map(e => e.message), ...warnings.map(w => w.message)],
    });

    const isValid = errors.length === 0 && quality.overallScore >= 60;

    return Promise.resolve({
      isValid,
      quality,
      errors,
      warnings,
      suggestions,
      timestamp: new Date(),
      duration: Date.now() - start,
    });
  }

  // 提供除權/分割等調整掛鉤（目前僅設計擴充點）
  adjustForCorporateActions<T extends Analyzable>(
    data: T,
    _actions?: Array<Record<string, unknown>>
  ): T {
    return data; // 目前不做變更，後續接上實際處理
  }

  // 工具方法
  private calculateCompleteness(data: Analyzable, required: string[]): number {
    const total = required.length;
    const present = required.filter(
      key =>
        Object.prototype.hasOwnProperty.call(data, key) &&
        (data as Record<string, unknown>)[key] !== null &&
        (data as Record<string, unknown>)[key] !== undefined
    ).length;
    return total === 0 ? 1 : present / total;
  }

  private checkTimeliness(data: Analyzable): { ageHours: number } {
    const last = (data as Record<string, unknown>)['lastUpdated'];
    if (!(last instanceof Date)) return { ageHours: Number.POSITIVE_INFINITY };
    const ageMs = Date.now() - last.getTime();
    return { ageHours: ageMs / (1000 * 60 * 60) };
  }

  private checkValidity(
    data: Analyzable,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 1;

    const record = data as Record<string, unknown>;

    // 價格必須為正
    if ('price' in record) {
      const price = Number(record['price']);
      if (Number.isNaN(price) || price <= 0) {
        errors.push({
          code: 'INVALID_PRICE',
          message: `價格不合法: ${record['price'] as unknown as string}`,
          severity: 'error',
          field: 'price',
        });
        score -= 0.3;
      }
    }

    // 殖利率合理範圍（0%~40%）
    if ('dividendYield' in record && record['dividendYield'] !== null) {
      const dy = Number(record['dividendYield']);
      if (dy < 0 || dy > 0.4) {
        warnings.push({
          code: 'ABNORMAL_YIELD',
          message: `異常殖利率: ${dy}`,
          impact: 'medium',
          field: 'dividendYield',
        });
        score -= 0.1;
      }
    }

    // PE/PB 合理性（非強制）
    if ('peRatio' in record && record['peRatio'] !== null) {
      const pe = Number(record['peRatio']);
      if (pe < 0 || pe > 200) {
        warnings.push({
          code: 'ABNORMAL_PE',
          message: `異常本益比: ${pe}`,
          impact: 'low',
          field: 'peRatio',
        });
        score -= 0.05;
      }
    }

    if ('pbRatio' in record && record['pbRatio'] !== null) {
      const pb = Number(record['pbRatio']);
      if (pb < 0 || pb > 50) {
        warnings.push({
          code: 'ABNORMAL_PB',
          message: `異常股價淨值比: ${pb}`,
          impact: 'low',
          field: 'pbRatio',
        });
        score -= 0.05;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  private checkConsistency(data: Analyzable, warnings: ValidationWarning[]): number {
    let score = 1;
    const record = data as Record<string, unknown>;

    // 例：若提供 currentRatio 與 quickRatio，則 quickRatio 不應高於 currentRatio 太多
    if (
      'currentRatio' in record &&
      'quickRatio' in record &&
      record['currentRatio'] !== null &&
      record['quickRatio'] !== null
    ) {
      const cr = Number(record['currentRatio']);
      const qr = Number(record['quickRatio']);
      if (!Number.isNaN(cr) && !Number.isNaN(qr) && qr > cr * 1.2) {
        warnings.push({
          code: 'INCONSISTENT_LIQUIDITY',
          message: `速動比過高於流動比: quick=${qr}, current=${cr}`,
          impact: 'medium',
          field: 'quickRatio',
        });
        score -= 0.1;
      }
    }

    // 例：若提供 gross/operating/net margins，則應滿足 gross >= operating >= net（若皆存在）
    const gp = this.num(record['grossProfitMargin']);
    const op = this.num(record['operatingMargin']);
    const np = this.num(record['netProfitMargin']);
    if (gp !== null && op !== null && np !== null) {
      if (!(gp >= op && op >= np)) {
        warnings.push({
          code: 'INCONSISTENT_MARGINS',
          message: `毛利/營益/淨利率不一致: gross=${gp}, operating=${op}, net=${np}`,
          impact: 'medium',
        });
        score -= 0.1;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  private detectAnomalies(data: Analyzable): ValidationWarning[] {
    const issues: ValidationWarning[] = [];
    const record = data as Record<string, unknown>;

    // 例：單日振幅（若提供 day range 或 volatility）
    if ('volatility' in record && record['volatility'] !== null) {
      const vol = Number(record['volatility']);
      if (!Number.isNaN(vol) && vol > 25) {
        issues.push({
          code: 'HIGH_INTRADAY_VOL',
          message: `日內波動過大: ${vol.toFixed(2)}%`,
          impact: 'high',
          field: 'volatility',
        });
      }
    }

    // 例：交易量缺失或為 0
    if ('volume' in record) {
      const volume = Number(record['volume']);
      if (Number.isNaN(volume) || volume <= 0) {
        issues.push({
          code: 'NO_VOLUME',
          message: '成交量缺失或為 0',
          impact: 'low',
          field: 'volume',
        });
      }
    }

    return issues;
  }

  private buildDataQuality(params: {
    completeness: number;
    timelinessScore: number;
    consistencyScore: number;
    validityScore: number;
    issues: string[];
  }): DataQuality {
    // 權重可依需求調整
    const weights: Record<keyof Omit<typeof params, 'issues'>, number> = {
      completeness: 0.35,
      timelinessScore: 0.15,
      consistencyScore: 0.25,
      validityScore: 0.25,
    } as const;

    const weighted =
      params.completeness * weights.completeness +
      params.timelinessScore * weights.timelinessScore +
      params.consistencyScore * weights.consistencyScore +
      params.validityScore * weights.validityScore;

    const overallScore = Math.round(weighted * 100);

    const level: DataQualityLevel =
      overallScore >= 90
        ? DataQualityLevel.EXCELLENT
        : overallScore >= 80
          ? DataQualityLevel.GOOD
          : overallScore >= 70
            ? DataQualityLevel.AVERAGE
            : overallScore >= 60
              ? DataQualityLevel.BELOW_AVERAGE
              : overallScore >= 50
                ? DataQualityLevel.POOR
                : DataQualityLevel.UNRELIABLE;

    const factors: DataQualityFactor[] = [
      {
        name: '完整性',
        score: Math.round(params.completeness * 100),
        weight: weights.completeness,
        description: '必要欄位齊備程度',
        issues: [],
        recommendations: [],
      },
      {
        name: '時效性',
        score: Math.round(params.timelinessScore * 100),
        weight: weights.timelinessScore,
        description: '資料新鮮程度',
        issues: [],
        recommendations: [],
      },
      {
        name: '一致性',
        score: Math.round(params.consistencyScore * 100),
        weight: weights.consistencyScore,
        description: '跨欄位邏輯一致性',
        issues: [],
        recommendations: [],
      },
      {
        name: '有效性',
        score: Math.round(params.validityScore * 100),
        weight: weights.validityScore,
        description: '欄位值落在合理範圍',
        issues: [],
        recommendations: [],
      },
    ];

    return {
      overallScore,
      level,
      completeness: Math.round(params.completeness * 100),
      accuracy: Math.round(params.validityScore * 100),
      timeliness: Math.round(params.timelinessScore * 100),
      consistency: Math.round(params.consistencyScore * 100),
      validity: Math.round(params.validityScore * 100),
      factors,
      lastValidation: new Date(),
    };
  }

  private num(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
}
