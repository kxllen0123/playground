# Golden Evaluation Tests

This directory contains the golden evaluation test suite for the Dify Workflow, consisting of 50 carefully designed test cases to evaluate classification accuracy and product relevance validation.

## Overview

The golden evaluation suite includes:
- **10 Bug cases**: Various types of bugs and errors
- **10 Enhancement cases**: Feature requests and improvements
- **10 Question cases**: User inquiries and questions
- **10 Unclassifiable cases**: Meaningless or unclear content
- **10 Irrelevant cases**: Content unrelated to the product

## Target Metrics

- **Overall classification accuracy**: ≥ 90%
- **Bug identification accuracy**: ≥ 90%
- **Enhancement identification accuracy**: ≥ 90%
- **Question identification accuracy**: ≥ 90%
- **Relevant content pass rate**: ≥ 95%
- **Irrelevant content rejection rate**: ≥ 85%

## Files

- `golden-eval-data.ts`: Test case data with 50 test cases
- `golden-eval.spec.ts`: E2E test implementation
- `GOLDEN_EVAL_README.md`: This file

## Running the Tests

### Prerequisites

1. Ensure the development server is running or set `BASE_URL` environment variable
2. Configure Dify API credentials in `.env.local`
3. Install Playwright browsers: `bunx playwright install`

### Run All Golden Evaluation Tests

```bash
# From webapp directory
RUN_GOLDEN_EVAL=true bun run test:e2e tests/e2e/golden-eval.spec.ts --workers=1 --retries=0
```

**Note**: Golden evaluation tests are configured with:
- `--workers=1`: Run tests serially to avoid API rate limiting
- `--retries=0`: Disable retries to get accurate failure statistics

### Run Specific Test Categories

By default, only the "All Cases" test suite runs (50 tests total). 

If you want to run specific categories for debugging, you can use the `-g` flag:

```bash
# Run only bug cases (requires uncommenting test.describe.skip)
RUN_GOLDEN_EVAL=true bun run test:e2e tests/e2e/golden-eval.spec.ts -g "Bug Cases"

# Run only enhancement cases
RUN_GOLDEN_EVAL=true bun run test:e2e tests/e2e/golden-eval.spec.ts -g "Enhancement Cases"

# Run only question cases
RUN_GOLDEN_EVAL=true bun run test:e2e tests/e2e/golden-eval.spec.ts -g "Question Cases"
```

**Note**: Category-specific test suites are skipped by default to avoid running tests multiple times. To enable them, edit `golden-eval.spec.ts` and change `test.describe.skip` to `test.describe` for the desired category.

### Run with UI Mode

```bash
RUN_GOLDEN_EVAL=true bun run test:e2e:ui tests/e2e/golden-eval.spec.ts
```

### Run with Headed Mode (See Browser)

```bash
RUN_GOLDEN_EVAL=true bun run test:e2e:headed tests/e2e/golden-eval.spec.ts
```

### Using the Helper Script

```bash
# From webapp directory
./scripts/run-golden-eval.sh
```

This script will:
1. Prompt for confirmation (since it calls real API)
2. Run all golden evaluation tests
3. Generate a timestamped report in `test-reports/golden-eval/`
4. Display summary metrics

## Understanding Test Results

### Console Output

After running the tests, you'll see a detailed report:

```
========================================
Golden Evaluation Report
========================================
Total Tests: 50
Passed: 45
Failed: 5
Accuracy: 90.00%
========================================

BUG Accuracy: 90.00% (9/10)
ENHANCEMENT Accuracy: 90.00% (9/10)
QUESTION Accuracy: 90.00% (9/10)

Relevant Content Pass Rate: 95.00% (28/30)
Irrelevant Content Rejection Rate: 85.00% (17/20)

========================================
Failed Test Cases:
========================================

[BUG-005] bug
Input: 字符计数器显示不准确，输入 100 个字符时显示剩余 4950...
Reason: Expected to pass but failed. Message: 无法分类此反馈
```

### Test Report Files

Reports are saved to `test-reports/golden-eval/report_YYYYMMDD_HHMMSS.txt`

Each report includes:
- Overall accuracy metrics
- Category-specific accuracy
- Relevance validation rates
- Detailed failure analysis

## Interpreting Results

### High Accuracy (≥ 90%)
✅ Workflow is performing well
- Continue monitoring with regular evaluations
- Consider adding more edge cases

### Medium Accuracy (80-89%)
⚠️ Workflow needs improvement
- Review failed cases for patterns
- Adjust LLM prompts or RAG knowledge base
- Re-run tests after improvements

### Low Accuracy (< 80%)
❌ Workflow requires significant work
- Analyze failure patterns systematically
- Consider redesigning workflow logic
- Add more training examples
- Review prompt engineering

## Common Failure Patterns

### Classification Errors

1. **Bug vs Enhancement Confusion**
   - Symptom: Bug reports classified as enhancements
   - Solution: Clarify bug indicators in prompt (error messages, crashes, unexpected behavior)

2. **Question vs Bug Confusion**
   - Symptom: Questions about bugs classified as bugs
   - Solution: Emphasize question keywords (如何, 请问, 是否, etc.)

3. **Enhancement vs Question Confusion**
   - Symptom: Feature requests phrased as questions
   - Solution: Focus on intent (requesting vs asking)

### Relevance Validation Errors

1. **False Positives (Irrelevant content passing)**
   - Symptom: Off-topic content creating issues
   - Solution: Strengthen RAG knowledge base with product-specific content

2. **False Negatives (Relevant content rejected)**
   - Symptom: Valid feedback being rejected
   - Solution: Broaden relevance criteria, review RAG retrieval

## Improving Test Coverage

### Adding New Test Cases

1. Edit `golden-eval-data.ts`
2. Add new test case to `goldenTestCases` array:

```typescript
{
  id: 'BUG-011',
  category: 'bug',
  input: 'Your test input here...',
  expectedType: 'bug',
  shouldPass: true,
  shouldCreateIssue: true,
  tags: ['tag1', 'tag2'],
  description: 'Brief description',
}
```

3. Run tests to validate

### Removing Test Cases

1. Remove or comment out test case in `golden-eval-data.ts`
2. Update documentation if needed

### Modifying Test Cases

1. Update test case properties in `golden-eval-data.ts`
2. Re-run tests to ensure changes work as expected

## Best Practices

1. **Run Regularly**: Execute golden evaluation tests weekly or after workflow changes
2. **Track Trends**: Keep historical reports to track accuracy over time
3. **Analyze Failures**: Don't just look at numbers, understand why tests fail
4. **Update Test Cases**: Add new cases based on real user feedback
5. **Version Control**: Commit test results to track improvements
6. **CI Integration**: Run in CI pipeline for automated monitoring

## Troubleshooting

### Tests Timing Out

**Problem**: Tests exceed 60-second timeout

**Solutions**:
- Check Dify API response time
- Increase timeout in test configuration
- Run tests during off-peak hours

### API Rate Limiting

**Problem**: Tests fail with 429 errors

**Solutions**:
- Run tests serially (already configured)
- Add delays between tests
- Use dedicated test API key with higher limits

### Inconsistent Results

**Problem**: Same test passes sometimes, fails other times

**Solutions**:
- Check for non-deterministic workflow behavior
- Review LLM temperature settings
- Add retry logic for flaky tests

### Environment Issues

**Problem**: Tests fail in CI but pass locally

**Solutions**:
- Verify environment variables in CI
- Check network connectivity
- Ensure Playwright browsers are installed

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Golden Evaluation

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:  # Manual trigger

jobs:
  golden-eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: |
          cd webapp
          bun install
          bunx playwright install --with-deps
      
      - name: Run golden evaluation
        env:
          DIFY_API_ENDPOINT: ${{ secrets.DIFY_API_ENDPOINT }}
          DIFY_API_KEY: ${{ secrets.DIFY_API_KEY }}
          RUN_GOLDEN_EVAL: true
        run: |
          cd webapp
          bun run test:e2e tests/e2e/golden-eval.spec.ts
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: golden-eval-report
          path: webapp/playwright-report/
```

## Related Documentation

- [Golden Evaluation Specification](../../../.kiro/specs/user-feedback/golden_eval.md)
- [Requirements Document](../../../.kiro/specs/user-feedback/requirements.md)
- [Test Coverage Matrix](../../../.kiro/specs/user-feedback/requirement_test.md)
- [Runbook](../../../.kiro/specs/user-feedback/runbook.md)

## Support

For questions or issues:
1. Check this README
2. Review test output and reports
3. Consult the golden evaluation specification
4. Contact the development team
