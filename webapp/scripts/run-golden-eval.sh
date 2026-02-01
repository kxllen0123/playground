#!/bin/bash

# Golden Evaluation Test Runner
# This script runs the golden evaluation tests and generates a detailed report

set -e

echo "=========================================="
echo "Golden Evaluation Test Runner"
echo "=========================================="
echo ""

# Check if RUN_GOLDEN_EVAL is set
if [ -z "$RUN_GOLDEN_EVAL" ]; then
  echo "⚠️  Warning: RUN_GOLDEN_EVAL is not set"
  echo "   These tests will call the real Dify API"
  echo ""
  read -p "Do you want to continue? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
  export RUN_GOLDEN_EVAL=true
fi

# Create reports directory if it doesn't exist
REPORTS_DIR="./test-reports/golden-eval"
mkdir -p "$REPORTS_DIR"

# Generate timestamp for report
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORTS_DIR/report_$TIMESTAMP.txt"

echo "📊 Running golden evaluation tests..."
echo "   Report will be saved to: $REPORT_FILE"
echo ""

# Run the tests and capture output
if RUN_GOLDEN_EVAL=true bun run test:e2e tests/e2e/golden-eval.spec.ts --reporter=list 2>&1 | tee "$REPORT_FILE"; then
  echo ""
  echo "✅ Golden evaluation tests completed successfully"
else
  echo ""
  echo "❌ Some golden evaluation tests failed"
  echo "   Check the report for details: $REPORT_FILE"
fi

# Generate summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Report saved to: $REPORT_FILE"
echo ""

# Extract key metrics from report if available
if [ -f "$REPORT_FILE" ]; then
  echo "Key Metrics:"
  grep -E "(Total Tests|Passed|Failed|Accuracy|Pass Rate|Rejection Rate)" "$REPORT_FILE" || echo "  (Metrics will be available after test completion)"
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo "1. Review the detailed report: $REPORT_FILE"
echo "2. Check failed test cases and analyze patterns"
echo "3. Update Dify Workflow if accuracy is below target"
echo "4. Re-run tests after making improvements"
echo ""
