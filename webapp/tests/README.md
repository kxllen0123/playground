# 测试文档

本项目包含全面的单元测试和 E2E 测试，确保用户反馈系统的质量和可靠性。

## 测试结构

```
tests/
├── setup.ts                          # 测试环境设置
├── fixtures/                         # 测试数据和资源
│   ├── test-image.png               # 测试用图片
│   └── create-test-image.js         # 生成测试图片的脚本
├── unit/                            # 单元测试
│   ├── validators/
│   │   └── feedbackValidator.test.ts
│   ├── clients/
│   │   ├── difyClient.test.ts
│   │   └── difyFileUpload.test.ts
│   ├── services/
│   │   └── feedbackService.test.ts
│   └── actions/
│       ├── feedback.test.ts
│       └── fileUpload.test.ts
└── e2e/                             # E2E 测试
    ├── feedback-form.spec.ts        # 表单功能测试
    └── api-integration.spec.ts      # API 集成测试
```

## 运行测试

### 单元测试

```bash
# 运行所有单元测试
npm run test

# 运行测试并显示 UI
npm run test:ui

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式（开发时使用）
npm run test -- --watch
```

### E2E 测试

```bash
# 运行所有 E2E 测试
npm run test:e2e

# 运行 E2E 测试并显示 UI
npm run test:e2e:ui

# 运行 E2E 测试（显示浏览器）
npm run test:e2e:headed

# 运行特定测试文件
npm run test:e2e -- feedback-form.spec.ts

# 运行特定浏览器
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
```

### API 集成测试

API 集成测试默认在 CI 环境中运行。如果要在本地运行：

```bash
# 设置环境变量并运行
RUN_INTEGRATION_TESTS=true npm run test:e2e -- api-integration.spec.ts
```

**注意**: API 集成测试需要真实的 Dify API 凭证和网络连接。

## 测试覆盖范围

### 单元测试

#### FeedbackValidator (`feedbackValidator.test.ts`)
- ✅ 验证有效的反馈内容
- ✅ 拒绝空内容
- ✅ 拒绝仅包含空白字符的内容
- ✅ 拒绝超过最大长度的内容
- ✅ 接受边界值（最大长度）
- ✅ 清理脚本标签
- ✅ 清理事件处理器
- ✅ 清理 JavaScript 协议
- ✅ 转义 HTML 特殊字符
- ✅ 处理复杂的 XSS 攻击

#### DifyAgentClient (`difyClient.test.ts`)
- ✅ 成功处理不带图片的反馈
- ✅ 成功处理带图片的反馈
- ✅ 处理 401 认证错误
- ✅ 处理 400 请求错误
- ✅ 处理 429 速率限制错误
- ✅ 处理 500 服务器错误
- ✅ 处理网络错误
- ✅ 从不同响应格式提取消息
- ✅ 包含环境参数
- ✅ 使用正确的 API 端点

#### DifyFileUploadClient (`difyFileUpload.test.ts`)
- ✅ 成功上传文件
- ✅ 处理不同的响应字段格式
- ✅ 处理缺失文件 ID
- ✅ 处理认证错误
- ✅ 处理请求错误
- ✅ 处理服务器错误
- ✅ 处理网络错误
- ✅ 发送正确的请求格式

#### FeedbackService (`feedbackService.test.ts`)
- ✅ 成功提交不带图片的反馈
- ✅ 成功提交带图片的反馈
- ✅ 拒绝无效反馈
- ✅ 处理验证错误
- ✅ 处理 Dify 客户端失败
- ✅ 在发送前清理内容
- ✅ 处理长反馈内容
- ✅ 处理特殊字符

#### Server Actions (`feedback.test.ts`, `fileUpload.test.ts`)
- ✅ 成功提交反馈
- ✅ 成功上传文件
- ✅ 拒绝缺失文件
- ✅ 拒绝非图片文件
- ✅ 拒绝超大文件
- ✅ 处理服务失败
- ✅ 处理错误

### E2E 测试

#### 表单显示 (`feedback-form.spec.ts`)
- ✅ 显示所有表单元素
- ✅ 显示字符计数器
- ✅ 显示图片上传区域
- ✅ 显示提交按钮

#### 文本输入验证
- ✅ 输入内容时启用提交按钮
- ✅ 更新字符计数器
- ✅ 接近限制时显示警告
- ✅ 强制执行最大字符限制
- ✅ 不允许提交仅空白内容

#### 图片上传
- ✅ 允许选择图片并显示预览
- ✅ 允许移除选中的图片
- ✅ 显示非图片文件错误
- ✅ 显示超大文件错误

#### 表单提交
- ✅ 成功提交不带图片的反馈
- ✅ 成功提交带图片的反馈
- ✅ 提交期间禁用表单
- ✅ 提交后保留内容
- ✅ 优雅处理提交错误

#### 可访问性
- ✅ 具有适当的 ARIA 标签
- ✅ 验证错误时显示 aria-invalid
- ✅ 支持键盘导航

#### 响应式设计
- ✅ 在移动设备上正确显示
- ✅ 在平板设备上正确显示
- ✅ 在桌面设备上正确显示

### API 集成测试 (`api-integration.spec.ts`)

#### Dify Workflow 集成
- ✅ 成功分类和创建 Bug 报告 Issue
- ✅ 成功分类和创建功能请求 Issue
- ✅ 成功分类和创建问题 Issue
- ✅ 拒绝无法分类的反馈
- ✅ 拒绝不相关的反馈

#### 文件上传集成
- ✅ 成功上传图片并创建 Issue
- ✅ 优雅处理文件上传失败

#### 错误处理
- ✅ 处理 API 速率限制

#### 端到端工作流
- ✅ 完成完整工作流：输入 → 上传 → 提交 → 成功

## 测试最佳实践

### 单元测试
1. **隔离性**: 每个测试应该独立运行，不依赖其他测试
2. **Mock 依赖**: 使用 mock 隔离被测试的单元
3. **清晰的命名**: 测试名称应该清楚地描述测试的内容
4. **AAA 模式**: Arrange（准备）、Act（执行）、Assert（断言）

### E2E 测试
1. **真实场景**: 测试应该模拟真实用户行为
2. **等待策略**: 使用 Playwright 的自动等待，避免硬编码延迟
3. **选择器策略**: 优先使用语义化选择器（role, label）
4. **清理**: 每个测试后清理状态

## CI/CD 集成

### GitHub Actions 配置示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  integration-tests:
    runs-on: ubuntu-latest
    environment: preview
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e -- api-integration.spec.ts
        env:
          BASE_URL: ${{ secrets.PREVIEW_URL }}
          DIFY_API_KEY: ${{ secrets.DIFY_API_KEY }}
          DIFY_API_ENDPOINT: ${{ secrets.DIFY_API_ENDPOINT }}
```

## 环境变量

测试需要以下环境变量：

### 单元测试
```bash
DIFY_API_ENDPOINT=https://api.dify.ai/v1
DIFY_API_KEY=test-api-key
DIFY_ENV=test
FEEDBACK_MAX_LENGTH=5000
```

### E2E 测试
```bash
BASE_URL=http://localhost:3000  # 或 preview URL
```

### API 集成测试
```bash
BASE_URL=https://your-preview-url.vercel.app
DIFY_API_KEY=your-real-api-key
DIFY_API_ENDPOINT=https://api.dify.ai/v1
DIFY_ENV=preview
RUN_INTEGRATION_TESTS=true
```

## 调试测试

### 单元测试调试
```bash
# 使用 Vitest UI
npm run test:ui

# 运行特定测试文件
npm run test -- feedbackValidator.test.ts

# 运行特定测试用例
npm run test -- -t "should accept valid feedback"
```

### E2E 测试调试
```bash
# 使用 Playwright UI 模式
npm run test:e2e:ui

# 显示浏览器运行测试
npm run test:e2e:headed

# 调试特定测试
npm run test:e2e -- --debug feedback-form.spec.ts
```

## 测试报告

### 单元测试覆盖率报告
运行 `npm run test:coverage` 后，覆盖率报告将生成在 `coverage/` 目录：
- `coverage/index.html` - HTML 格式的覆盖率报告
- `coverage/coverage-final.json` - JSON 格式的覆盖率数据

### E2E 测试报告
运行 E2E 测试后，报告将生成在 `playwright-report/` 目录：
- `playwright-report/index.html` - HTML 格式的测试报告

查看报告：
```bash
npx playwright show-report
```

## 故障排除

### 常见问题

1. **测试超时**
   - 增加超时时间：`await expect(element).toBeVisible({ timeout: 30000 })`
   - 检查网络连接
   - 检查 API 响应时间

2. **Mock 不工作**
   - 确保在测试前清理 mock：`vi.clearAllMocks()`
   - 检查 mock 的导入路径
   - 使用 `vi.mock()` 在文件顶部

3. **E2E 测试不稳定**
   - 使用 Playwright 的自动等待
   - 避免使用 `page.waitForTimeout()`
   - 使用更具体的选择器

4. **文件上传测试失败**
   - 确保测试图片存在：`tests/fixtures/test-image.png`
   - 运行 `node tests/fixtures/create-test-image.js` 创建测试图片

## 贡献指南

添加新测试时：
1. 遵循现有的测试结构和命名约定
2. 确保测试是独立的和可重复的
3. 添加清晰的测试描述
4. 更新此 README 文档
5. 确保所有测试通过后再提交

## 参考资料

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Testing Library 文档](https://testing-library.com/)
