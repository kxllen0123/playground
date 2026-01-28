# 测试指南

本文档提供用户反馈系统测试的快速入门指南。

## 快速开始

### 1. 安装依赖

```bash
cd webapp
npm install
```

### 2. 创建测试资源

```bash
node tests/fixtures/create-test-image.js
```

### 3. 运行测试

```bash
# 运行所有测试（推荐）
./scripts/run-tests.sh all

# 或者单独运行
npm run test              # 单元测试
npm run test:e2e          # E2E 测试
```

## 测试类型

### 单元测试 (Unit Tests)

测试独立的代码单元（函数、类、模块）。

**覆盖范围:**
- ✅ FeedbackValidator - 输入验证和清理
- ✅ DifyAgentClient - Dify API 交互
- ✅ DifyFileUploadClient - 文件上传
- ✅ FeedbackService - 业务逻辑协调
- ✅ Server Actions - 服务器端函数

**运行命令:**
```bash
npm run test              # 运行所有单元测试
npm run test:ui           # 使用 UI 界面
npm run test:coverage     # 生成覆盖率报告
```

### E2E 测试 (End-to-End Tests)

测试完整的用户流程，模拟真实用户操作。

**覆盖范围:**
- ✅ 表单显示和交互
- ✅ 文本输入验证
- ✅ 图片上传功能
- ✅ 表单提交流程
- ✅ 错误处理
- ✅ 可访问性
- ✅ 响应式设计

**运行命令:**
```bash
npm run test:e2e          # 运行所有 E2E 测试
npm run test:e2e:ui       # 使用 Playwright UI
npm run test:e2e:headed   # 显示浏览器
```

### API 集成测试 (Integration Tests)

测试与真实 Dify API 的集成，验证完整的端到端工作流。

**覆盖范围:**
- ✅ Dify Workflow 分类功能
- ✅ GitHub Issue 创建
- ✅ 文件上传到 Dify
- ✅ 错误处理和边界情况

**运行命令:**
```bash
# 需要真实的 API 凭证
export DIFY_API_KEY=your-api-key
export DIFY_API_ENDPOINT=https://api.dify.ai/v1
RUN_INTEGRATION_TESTS=true npm run test:e2e -- api-integration.spec.ts

# 或使用脚本
./scripts/run-tests.sh integration
```

## 测试场景

### 场景 1: 提交 Bug 报告

```typescript
// E2E 测试示例
test('should submit bug report successfully', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('反馈内容').fill('发现一个严重的 bug...');
  await page.getByRole('button', { name: '提交反馈' }).click();
  await expect(page.getByRole('alert')).toContainText('Issue #');
});
```

### 场景 2: 上传图片

```typescript
// E2E 测试示例
test('should upload image with feedback', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('反馈内容').fill('界面显示异常');
  await page.locator('input[type="file"]').setInputFiles('test.png');
  await page.getByRole('button', { name: '提交反馈' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});
```

### 场景 3: 验证输入

```typescript
// 单元测试示例
test('should reject empty content', () => {
  const validator = new FeedbackValidator();
  const result = validator.validate('');
  expect(result.isValid).toBe(false);
  expect(result.error).toBe('反馈内容不能为空');
});
```

## 测试环境

### 本地开发环境

```bash
# .env.local
DIFY_API_ENDPOINT=https://api.dify.ai/v1
DIFY_API_KEY=test-api-key
DIFY_ENV=development
FEEDBACK_MAX_LENGTH=5000
```

### CI/CD 环境

测试在以下情况下自动运行：
- ✅ Push 到 main 或 develop 分支
- ✅ 创建 Pull Request
- ✅ Vercel Preview 部署完成后（集成测试）

### Preview 环境

集成测试在 Vercel Preview 环境中运行，使用真实的 API 凭证。

## 调试测试

### 调试单元测试

```bash
# 使用 Vitest UI
npm run test:ui

# 运行特定测试
npm run test -- feedbackValidator.test.ts

# 运行特定测试用例
npm run test -- -t "should accept valid feedback"
```

### 调试 E2E 测试

```bash
# 使用 Playwright UI（推荐）
npm run test:e2e:ui

# 显示浏览器
npm run test:e2e:headed

# 调试模式
npm run test:e2e -- --debug

# 运行特定测试
npm run test:e2e -- feedback-form.spec.ts
```

### 查看测试报告

```bash
# 单元测试覆盖率报告
open coverage/index.html

# E2E 测试报告
npx playwright show-report
```

## 常见问题

### Q: 测试超时怎么办？

A: 增加超时时间或检查网络连接：
```typescript
await expect(element).toBeVisible({ timeout: 30000 });
```

### Q: Mock 不工作？

A: 确保在测试前清理 mock：
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Q: E2E 测试不稳定？

A: 使用 Playwright 的自动等待，避免硬编码延迟：
```typescript
// ❌ 不好
await page.waitForTimeout(1000);

// ✅ 好
await expect(element).toBeVisible();
```

### Q: 文件上传测试失败？

A: 确保测试图片存在：
```bash
node tests/fixtures/create-test-image.js
```

### Q: 如何跳过某些测试？

A: 使用 `test.skip()`:
```typescript
test.skip('this test is not ready', async ({ page }) => {
  // ...
});
```

## 测试覆盖率目标

- **单元测试**: ≥ 80% 代码覆盖率
- **E2E 测试**: 覆盖所有主要用户流程
- **集成测试**: 覆盖所有 API 交互场景

## 贡献测试

添加新测试时请遵循：

1. **命名约定**: 使用描述性的测试名称
2. **独立性**: 每个测试应该独立运行
3. **清晰性**: 测试应该易于理解和维护
4. **完整性**: 测试应该覆盖正常和异常情况

## 相关资源

- [完整测试文档](./tests/README.md)
- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Testing Library 最佳实践](https://testing-library.com/docs/guiding-principles)

## 获取帮助

如果遇到测试问题：
1. 查看 [tests/README.md](./tests/README.md) 获取详细文档
2. 运行 `./scripts/run-tests.sh` 获取自动化帮助
3. 查看 CI/CD 日志了解失败原因
4. 在团队中寻求帮助
