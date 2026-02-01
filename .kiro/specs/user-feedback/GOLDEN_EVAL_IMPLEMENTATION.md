# Golden Evaluation 自动化测试实现说明

本文档说明基于 `golden_eval.md` 生成的 E2E 自动化测试代码的实现细节。

## 创建的文件

### 1. 测试数据文件
**路径**: `webapp/tests/e2e/golden-eval-data.ts`

包含 50 个测试用例的完整数据结构：
- 10 个 Bug 类型测试用例
- 10 个 Enhancement 类型测试用例
- 10 个 Question 类型测试用例
- 10 个无法分类测试用例
- 10 个不相关内容测试用例

每个测试用例包含：
```typescript
{
  id: string;                    // 测试用例 ID (如 BUG-001)
  category: string;              // 类别
  input: string;                 // 输入内容
  expectedType?: string;         // 期望分类类型
  shouldPass: boolean;           // 是否应该通过
  shouldCreateIssue: boolean;    // 是否应该创建 Issue
  tags: string[];               // 标签
  description: string;          // 描述
}
```

辅助函数：
- `getBugCases()` - 获取所有 Bug 测试用例
- `getEnhancementCases()` - 获取所有 Enhancement 测试用例
- `getQuestionCases()` - 获取所有 Question 测试用例
- `getUnclassifiableCases()` - 获取所有无法分类测试用例
- `getIrrelevantCases()` - 获取所有不相关测试用例
- `getPassingCases()` - 获取所有应该通过的测试用例
- `getFailingCases()` - 获取所有应该失败的测试用例

### 2. 测试规范文件
**路径**: `webapp/tests/e2e/golden-eval.spec.ts`

实现了完整的 E2E 测试套件，包含：

#### 测试套件结构
1. **All Cases** - 运行所有 50 个测试用例
2. **Bug Cases** - 仅运行 Bug 类型测试
3. **Enhancement Cases** - 仅运行 Enhancement 类型测试
4. **Question Cases** - 仅运行 Question 类型测试
5. **Unclassifiable Cases** - 仅运行无法分类测试
6. **Irrelevant Cases** - 仅运行不相关内容测试
7. **Accuracy Thresholds** - 验证准确率阈值

#### 核心功能

**submitFeedbackAndGetResult()**
- 提交反馈并获取结果
- 等待响应（最多 60 秒）
- 解析成功/失败状态

**validateTestCase()**
- 验证测试用例结果是否符合预期
- 返回通过/失败状态和原因

**测试报告生成**
- 在所有测试完成后自动生成报告
- 包含总体准确率、分类准确率、相关性验证率
- 列出所有失败的测试用例及原因

### 3. 运行脚本
**路径**: `webapp/scripts/run-golden-eval.sh`

Bash 脚本，用于：
- 提示用户确认（因为会调用真实 API）
- 运行所有黄金评测测试
- 生成带时间戳的报告文件
- 显示测试摘要

### 4. 使用文档
**路径**: `webapp/tests/e2e/GOLDEN_EVAL_README.md`

详细的使用指南，包含：
- 测试概览和目标指标
- 运行测试的各种方法
- 结果解读指南
- 常见失败模式分析
- 故障排查指南
- CI/CD 集成示例

### 5. Package.json 更新
**路径**: `webapp/package.json`

添加了便捷的 npm 脚本：
```json
{
  "test:golden": "运行黄金评测测试",
  "test:golden:ui": "在 UI 模式下运行",
  "test:golden:headed": "在有头模式下运行"
}
```

## 使用方法

### 快速开始

```bash
# 进入 webapp 目录
cd webapp

# 运行所有黄金评测测试
bun run test:golden

# 或使用脚本
./scripts/run-golden-eval.sh
```

### 运行特定类别

```bash
# 仅运行 Bug 测试
bun run test:golden -g "Bug Cases"

# 仅运行 Enhancement 测试
bun run test:golden -g "Enhancement Cases"

# 仅运行 Question 测试
bun run test:golden -g "Question Cases"
```

### 调试模式

```bash
# UI 模式（交互式）
bun run test:golden:ui

# 有头模式（看到浏览器）
bun run test:golden:headed
```

## 测试报告示例

运行测试后，控制台会显示详细报告：

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

[ENH-003] enhancement
Input: 希望增加反馈历史记录功能，让用户可以查看自己之前提交的...
Reason: Expected to pass but failed. Message: 反馈与产品无关
```

## 评测指标

### 目标准确率
- **整体分类准确率**: ≥ 90%
- **Bug 识别准确率**: ≥ 90%
- **Enhancement 识别准确率**: ≥ 90%
- **Question 识别准确率**: ≥ 90%
- **相关内容通过率**: ≥ 95%
- **无关内容拒绝率**: ≥ 85%

### 计算方法

```typescript
// 分类准确率
const classificationAccuracy = 
  correctClassifications / totalClassifiableTests;

// 相关内容通过率
const relevantPassRate = 
  relevantTestsPassed / totalRelevantTests;

// 无关内容拒绝率
const irrelevantRejectRate = 
  irrelevantTestsRejected / totalIrrelevantTests;
```

## 测试配置

### 环境变量

测试需要以下环境变量（在 `.env.local` 中配置）：
```env
DIFY_API_ENDPOINT=https://api.dify.ai/v1
DIFY_API_KEY=app-xxxxxxxxxxxx
DIFY_ENV=test
```

### 运行条件

测试默认在以下情况下运行：
- CI 环境 (`process.env.CI === true`)
- 显式启用 (`RUN_GOLDEN_EVAL=true`)

本地开发时需要显式设置 `RUN_GOLDEN_EVAL=true`。

### 超时设置

- 单个测试超时: 60 秒
- 等待响应超时: 60 秒
- 等待内容超时: 10 秒

## 测试策略

### 串行执行
测试配置为串行执行（`mode: 'serial'`），避免：
- API 速率限制
- 并发请求导致的不稳定
- 资源竞争

### 重试机制
- CI 环境: 自动重试 2 次
- 本地环境: 不自动重试

### 报告生成
- 控制台输出: 实时显示
- 文件报告: 保存到 `test-reports/golden-eval/`
- HTML 报告: Playwright 自动生成

## 维护指南

### 添加新测试用例

1. 编辑 `golden-eval-data.ts`
2. 在 `goldenTestCases` 数组中添加新用例
3. 运行测试验证

```typescript
{
  id: 'BUG-011',
  category: 'bug',
  input: '新的测试输入...',
  expectedType: 'bug',
  shouldPass: true,
  shouldCreateIssue: true,
  tags: ['new-tag'],
  description: '新测试用例描述',
}
```

### 更新测试用例

1. 在 `golden-eval-data.ts` 中找到对应用例
2. 修改属性值
3. 重新运行测试

### 删除测试用例

1. 从 `goldenTestCases` 数组中删除或注释
2. 更新相关文档

## 故障排查

### 测试超时
**问题**: 测试超过 60 秒超时

**解决方案**:
- 检查 Dify API 响应时间
- 检查网络连接
- 在非高峰期运行测试

### API 速率限制
**问题**: 收到 429 错误

**解决方案**:
- 测试已配置为串行执行
- 使用专用测试 API 密钥
- 增加测试间隔

### 结果不一致
**问题**: 同一测试有时通过有时失败

**解决方案**:
- 检查 LLM 温度设置
- 检查 Workflow 是否有非确定性行为
- 多次运行测试确认模式

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: Golden Evaluation

on:
  schedule:
    - cron: '0 0 * * 0'  # 每周日运行
  workflow_dispatch:

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
          bun run test:golden
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: golden-eval-report
          path: webapp/playwright-report/
```

## 最佳实践

1. **定期运行**: 每周或在 Workflow 更改后运行
2. **跟踪趋势**: 保存历史报告以跟踪准确率变化
3. **分析失败**: 不仅看数字，更要理解失败原因
4. **更新用例**: 根据实际用户反馈添加新用例
5. **版本控制**: 提交测试结果以跟踪改进

## 相关文档

- [Golden Evaluation 规范](./golden_eval.md)
- [需求文档](./requirements.md)
- [测试覆盖矩阵](./requirement_test.md)
- [运行手册](./runbook.md)
- [测试使用指南](../../webapp/tests/e2e/GOLDEN_EVAL_README.md)

## 总结

黄金评测自动化测试提供了：
- ✅ 50 个精心设计的测试用例
- ✅ 完整的 E2E 测试实现
- ✅ 详细的测试报告
- ✅ 便捷的运行脚本
- ✅ 全面的使用文档
- ✅ CI/CD 集成支持

通过定期运行这些测试，可以持续监控和改进 Dify Workflow 的分类准确性和产品相关性验证能力。
