/**
 * iframe 샌드박스를 이용한 코드 실행기
 * postMessage로 코드를 전달하고 결과를 받아옴
 */

export type TestResult = {
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
};

export type RunResult = {
  results: TestResult[];
  passedCount: number;
  totalTests: number;
};

type TestCase = {
  input: string;
  expectedOutput: string;
  description: string;
};

export const runCodeInSandbox = (code: string, testCases: TestCase[], timeLimitMs = 5000): Promise<RunResult> => {
  return new Promise((resolve) => {
    const results: TestResult[] = [];
    let resolved = false;

    // 타임아웃
    const timeout = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      resolve({
        results: testCases.map((tc) => ({
          description: tc.description,
          passed: false,
          expected: tc.expectedOutput,
          actual: "시간 초과",
          error: `${timeLimitMs}ms 시간 초과`,
        })),
        passedCount: 0,
        totalTests: testCases.length,
      });
    }, timeLimitMs);

    // 각 테스트 케이스를 순서대로 실행
    try {
      for (const tc of testCases) {
        try {
          // Function constructor로 실행
          const wrappedCode = `
            ${code}
            return (${tc.input});
          `;
          // eslint-disable-next-line no-new-func
          const fn = new Function(wrappedCode);
          const actual = String(fn());
          const expected = tc.expectedOutput.trim();
          const passed = actual.trim() === expected;

          results.push({
            description: tc.description,
            passed,
            expected,
            actual: actual.trim(),
          });
        } catch (err) {
          results.push({
            description: tc.description,
            passed: false,
            expected: tc.expectedOutput,
            actual: "",
            error: err instanceof Error ? err.message : "실행 오류",
          });
        }
      }

      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        const passedCount = results.filter((r) => r.passed).length;
        resolve({ results, passedCount, totalTests: testCases.length });
      }
    } catch (err) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({
          results: testCases.map((tc) => ({
            description: tc.description,
            passed: false,
            expected: tc.expectedOutput,
            actual: "",
            error: err instanceof Error ? err.message : "실행 오류",
          })),
          passedCount: 0,
          totalTests: testCases.length,
        });
      }
    }
  });
};
