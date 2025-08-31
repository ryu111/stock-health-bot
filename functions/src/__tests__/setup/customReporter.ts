/**
 * 自訂 Jest 覆蓋率報告器
 * 提供中文化的測試輸出
 */

export class CustomCoverageReporter {
  private coverageData: any;

  constructor() {
    this.coverageData = null;
  }

  /**
   * 處理覆蓋率資料
   */
  onRunComplete(_contexts: any, results: any) {
    if (results.coverageMap) {
      this.coverageData = results.coverageMap;
      this.printChineseCoverageReport();
    }
  }

  /**
   * 印出中文化覆蓋率報告
   */
  private printChineseCoverageReport() {
    if (!this.coverageData) return;

    console.log('\n📊 測試覆蓋率報告 (中文版)');
    console.log('='.repeat(60));

    const summary = this.coverageData.getCoverageSummary();
    const { statements, branches, functions, lines } = summary;

    console.log(`語句覆蓋率: ${statements.pct}% (${statements.covered}/${statements.total})`);
    console.log(`分支覆蓋率: ${branches.pct}% (${branches.covered}/${branches.total})`);
    console.log(`函數覆蓋率: ${functions.pct}% (${functions.covered}/${functions.total})`);
    console.log(`行數覆蓋率: ${lines.pct}% (${lines.covered}/${lines.total})`);

    console.log('\n📋 檔案詳細覆蓋率:');
    console.log('-'.repeat(40));

    this.coverageData.files().forEach((file: string) => {
      const fileCoverage = this.coverageData.fileCoverageFor(file);
      const summary = fileCoverage.toSummary();
      
      console.log(`${file}:`);
      console.log(`  語句: ${summary.statements.pct}%`);
      console.log(`  分支: ${summary.branches.pct}%`);
      console.log(`  函數: ${summary.functions.pct}%`);
      console.log(`  行數: ${summary.lines.pct}%`);
    });
  }
}

/**
 * 自訂測試結果報告器
 */
export class CustomTestReporter {
  /**
   * 處理測試完成事件
   */
  onRunComplete(_contexts: any, results: any) {
    const { numPassedTests, numFailedTests, numTotalTests, testResults } = results;
    
    console.log('\n🧪 測試結果摘要 (中文版)');
    console.log('='.repeat(40));
    console.log(`✅ 通過測試: ${numPassedTests}`);
    console.log(`❌ 失敗測試: ${numFailedTests}`);
    console.log(`📊 總測試數: ${numTotalTests}`);
    console.log(`📁 測試套件: ${testResults.length} 個`);

    if (numFailedTests > 0) {
      console.log('\n❌ 失敗的測試:');
      testResults.forEach((suite: any) => {
        suite.testResults.forEach((test: any) => {
          if (test.status === 'failed') {
            console.log(`  - ${suite.testFilePath}: ${test.fullName}`);
          }
        });
      });
    }
  }
}
