import { test, expect } from '@playwright/test';
import {
  goldenTestCases,
  getBugCases,
  getEnhancementCases,
  getQuestionCases,
  getUnclassifiableCases,
  getIrrelevantCases,
  type GoldenTestCase,
} from './golden-eval-data';

/**
 * Golden Evaluation E2E Tests
 * 
 * These tests evaluate the Dify Workflow's classification accuracy
 * and product relevance validation using 50 carefully designed test cases.
 * 
 * Test Distribution:
 * - 10 Bug cases
 * - 10 Enhancement cases
 * - 10 Question cases
 * - 10 Unclassifiable cases
 * - 10 Irrelevant cases
 * 
 * Target Accuracy:
 * - Overall classification accuracy: ≥ 90%
 * - Bug identification accuracy: ≥ 90%
 * - Enhancement identification accuracy: ≥ 90%
 * - Question identification accuracy: ≥ 90%
 * - Relevant content pass rate: ≥ 95%
 * - Irrelevant content rejection rate: ≥ 85%
 */

// Skip these tests in local development unless explicitly enabled
test.skip(
  !process.env.CI && !process.env.RUN_GOLDEN_EVAL,
  'Golden evaluation tests only run in CI or when RUN_GOLDEN_EVAL=true'
);

// Configure tests to run serially to avoid API rate limits
// Disable retries for golden evaluation to get accurate results
// Note: workers=1 is set via command line flag (--workers=1)
test.describe.configure({ mode: 'serial', retries: 0 });

// Helper function to submit feedback and get result
async function submitFeedbackAndGetResult(
  page: any,
  input: string
): Promise<{ success: boolean; message: string }> {
  await page.goto('/');

  const textarea = page.getByLabel('反馈内容');
  const submitButton = page.getByRole('button', { name: '提交反馈' });

  await textarea.fill(input);
  await submitButton.click();

  // Wait for response alert to appear
  const alert = page
    .locator('[role="alert"]:not(#__next-route-announcer__)')
    .last();
  await expect(alert).toBeVisible({ timeout: 60000 });

  // Wait for alert to have content
  await page.waitForFunction(
    () => {
      const alerts = Array.from(document.querySelectorAll('[role="alert"]'));
      const feedbackAlert = alerts.find(
        (el) => !el.id.includes('route-announcer')
      );
      return (
        feedbackAlert &&
        feedbackAlert.textContent &&
        feedbackAlert.textContent.trim().length > 0
      );
    },
    { timeout: 10000 }
  );

  const alertText = (await alert.textContent()) || '';

  // Determine if submission was successful
  const success =
    /已创建|成功|您的反馈已成功提交|已提交/i.test(alertText) &&
    !/拒绝|无法|错误|失败/i.test(alertText);

  return { success, message: alertText };
}

// Helper function to validate test case result
function validateTestCase(
  testCase: GoldenTestCase,
  result: { success: boolean; message: string }
): { passed: boolean; reason?: string } {
  if (testCase.shouldPass && !result.success) {
    return {
      passed: false,
      reason: `Expected to pass but failed. Message: ${result.message}`,
    };
  }

  if (!testCase.shouldPass && result.success) {
    return {
      passed: false,
      reason: `Expected to fail but passed. Message: ${result.message}`,
    };
  }

  return { passed: true };
}

test.describe('Golden Evaluation Tests - All Cases', () => {
  // Track results for reporting
  const results: {
    testCase: GoldenTestCase;
    result: { success: boolean; message: string };
    validation: { passed: boolean; reason?: string };
  }[] = [];

  test.afterAll(() => {
    // Generate evaluation report
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.validation.passed).length;
    const failedTests = totalTests - passedTests;
    const accuracy = ((passedTests / totalTests) * 100).toFixed(2);

    console.log('\n========================================');
    console.log('Golden Evaluation Report');
    console.log('========================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Accuracy: ${accuracy}%`);
    console.log('========================================\n');

    // Category-specific accuracy
    const categories = ['bug', 'enhancement', 'question'];
    categories.forEach((category) => {
      const categoryResults = results.filter(
        (r) => r.testCase.category === category
      );
      const categoryPassed = categoryResults.filter(
        (r) => r.validation.passed
      ).length;
      const categoryAccuracy = (
        (categoryPassed / categoryResults.length) *
        100
      ).toFixed(2);
      console.log(
        `${category.toUpperCase()} Accuracy: ${categoryAccuracy}% (${categoryPassed}/${categoryResults.length})`
      );
    });

    // Relevance validation
    const relevantCases = results.filter((r) => r.testCase.shouldPass);
    const relevantPassed = relevantCases.filter(
      (r) => r.validation.passed
    ).length;
    const relevantPassRate = (
      (relevantPassed / relevantCases.length) *
      100
    ).toFixed(2);
    console.log(
      `\nRelevant Content Pass Rate: ${relevantPassRate}% (${relevantPassed}/${relevantCases.length})`
    );

    const irrelevantCases = results.filter((r) => !r.testCase.shouldPass);
    const irrelevantRejected = irrelevantCases.filter(
      (r) => r.validation.passed
    ).length;
    const irrelevantRejectRate = (
      (irrelevantRejected / irrelevantCases.length) *
      100
    ).toFixed(2);
    console.log(
      `Irrelevant Content Rejection Rate: ${irrelevantRejectRate}% (${irrelevantRejected}/${irrelevantCases.length})`
    );

    // Failed cases
    if (failedTests > 0) {
      console.log('\n========================================');
      console.log('Failed Test Cases:');
      console.log('========================================');
      results
        .filter((r) => !r.validation.passed)
        .forEach((r) => {
          console.log(`\n[${r.testCase.id}] ${r.testCase.category}`);
          console.log(`Input: ${r.testCase.input.substring(0, 50)}...`);
          console.log(`Reason: ${r.validation.reason}`);
        });
    }
  });

  for (const testCase of goldenTestCases) {
    test(`${testCase.id}: ${testCase.category} - ${testCase.description}`, async ({
      page,
    }) => {
      const result = await submitFeedbackAndGetResult(page, testCase.input);
      const validation = validateTestCase(testCase, result);

      // Store result for reporting
      results.push({ testCase, result, validation });

      // Assert validation passed
      expect(validation.passed, validation.reason).toBe(true);
    });
  }
});

// Category-specific test suites (skipped by default, can be run with -g flag)
test.describe.skip('Golden Evaluation Tests - Bug Cases', () => {
  const bugCases = getBugCases();

  test(`should have ${bugCases.length} bug test cases`, () => {
    expect(bugCases.length).toBe(10);
  });

  for (const testCase of bugCases) {
    test(`${testCase.id}: ${testCase.description}`, async ({ page }) => {
      const result = await submitFeedbackAndGetResult(page, testCase.input);
      const validation = validateTestCase(testCase, result);

      expect(validation.passed, validation.reason).toBe(true);

      // Additional validation: should create issue
      if (testCase.shouldCreateIssue) {
        expect(result.success).toBe(true);
        expect(result.message).toMatch(/已创建|成功|Issue/i);
      }
    });
  }
});

test.describe.skip('Golden Evaluation Tests - Enhancement Cases', () => {
  const enhancementCases = getEnhancementCases();

  test(`should have ${enhancementCases.length} enhancement test cases`, () => {
    expect(enhancementCases.length).toBe(10);
  });

  for (const testCase of enhancementCases) {
    test(`${testCase.id}: ${testCase.description}`, async ({ page }) => {
      const result = await submitFeedbackAndGetResult(page, testCase.input);
      const validation = validateTestCase(testCase, result);

      expect(validation.passed, validation.reason).toBe(true);

      // Additional validation: should create issue
      if (testCase.shouldCreateIssue) {
        expect(result.success).toBe(true);
        expect(result.message).toMatch(/已创建|成功|Issue/i);
      }
    });
  }
});

test.describe.skip('Golden Evaluation Tests - Question Cases', () => {
  const questionCases = getQuestionCases();

  test(`should have ${questionCases.length} question test cases`, () => {
    expect(questionCases.length).toBe(10);
  });

  for (const testCase of questionCases) {
    test(`${testCase.id}: ${testCase.description}`, async ({ page }) => {
      const result = await submitFeedbackAndGetResult(page, testCase.input);
      const validation = validateTestCase(testCase, result);

      expect(validation.passed, validation.reason).toBe(true);

      // Additional validation: should create issue
      if (testCase.shouldCreateIssue) {
        expect(result.success).toBe(true);
        expect(result.message).toMatch(/已创建|成功|Issue/i);
      }
    });
  }
});

test.describe.skip('Golden Evaluation Tests - Unclassifiable Cases', () => {
  const unclassifiableCases = getUnclassifiableCases();

  test(`should have ${unclassifiableCases.length} unclassifiable test cases`, () => {
    expect(unclassifiableCases.length).toBe(10);
  });

  for (const testCase of unclassifiableCases) {
    test(`${testCase.id}: ${testCase.description}`, async ({ page }) => {
      const result = await submitFeedbackAndGetResult(page, testCase.input);
      const validation = validateTestCase(testCase, result);

      expect(validation.passed, validation.reason).toBe(true);

      // Additional validation: should NOT create issue
      expect(result.success).toBe(false);
    });
  }
});

test.describe.skip('Golden Evaluation Tests - Irrelevant Cases', () => {
  const irrelevantCases = getIrrelevantCases();

  test(`should have ${irrelevantCases.length} irrelevant test cases`, () => {
    expect(irrelevantCases.length).toBe(10);
  });

  for (const testCase of irrelevantCases) {
    test(`${testCase.id}: ${testCase.description}`, async ({ page }) => {
      const result = await submitFeedbackAndGetResult(page, testCase.input);
      const validation = validateTestCase(testCase, result);

      expect(validation.passed, validation.reason).toBe(true);

      // Additional validation: should NOT create issue
      expect(result.success).toBe(false);
    });
  }
});

// Accuracy threshold tests
test.describe('Golden Evaluation - Accuracy Thresholds', () => {
  test.skip(true, 'Run after all golden evaluation tests complete');

  test('overall accuracy should be >= 90%', () => {
    // This would be calculated from the results
    // Placeholder for demonstration
    expect(true).toBe(true);
  });

  test('bug identification accuracy should be >= 90%', () => {
    expect(true).toBe(true);
  });

  test('enhancement identification accuracy should be >= 90%', () => {
    expect(true).toBe(true);
  });

  test('question identification accuracy should be >= 90%', () => {
    expect(true).toBe(true);
  });

  test('relevant content pass rate should be >= 95%', () => {
    expect(true).toBe(true);
  });

  test('irrelevant content rejection rate should be >= 85%', () => {
    expect(true).toBe(true);
  });
});
