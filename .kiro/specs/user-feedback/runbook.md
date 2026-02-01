# 项目运行手册 (Runbook)

本文档提供详细的步骤指导，帮助开发者在本地环境中运行和测试用户反馈系统项目。

## 目录

1. [前置要求](#前置要求)
2. [环境准备](#环境准备)
3. [项目安装](#项目安装)
4. [配置设置](#配置设置)
5. [运行开发服务器](#运行开发服务器)
6. [运行测试](#运行测试)
7. [构建和部署](#构建和部署)
8. [故障排查](#故障排查)
9. [常见问题](#常见问题)

---

## 前置要求

在开始之前，请确保你的系统已安装以下软件：

### 必需软件

1. **Bun** (推荐版本 >= 1.0.0)
   - 安装方法：
     ```bash
     # macOS/Linux
     curl -fsSL https://bun.sh/install | bash
     
     # Windows (使用 WSL)
     curl -fsSL https://bun.sh/install | bash
     ```
   - 验证安装：
     ```bash
     bun --version
     ```

2. **Node.js** (可选，作为备用，推荐版本 >= 18.0.0)
   - 下载地址：https://nodejs.org/

3. **Git**
   - 验证安装：
     ```bash
     git --version
     ```

### 可选软件

- **VS Code** 或其他代码编辑器
- **Playwright 浏览器** (用于 E2E 测试，会在安装依赖时自动安装)

---

## 环境准备

### 1. 克隆项目

```bash
# 克隆仓库
git clone <repository-url>
cd <project-directory>
```

### 2. 进入 webapp 目录

```bash
cd webapp
```

所有后续命令都应在 `webapp` 目录下执行。

---

## 项目安装

### 1. 安装项目依赖

使用 Bun 安装所有依赖包：

```bash
bun install
```

这将安装 `package.json` 中定义的所有依赖，包括：
- Next.js 16 (React 框架)
- React 19 (UI 库)
- Tailwind CSS (样式框架)
- Vitest (单元测试框架)
- Playwright (E2E 测试框架)
- 其他开发和生产依赖

### 2. 安装 Playwright 浏览器

如果你计划运行 E2E 测试，需要安装 Playwright 浏览器：

```bash
bunx playwright install
```

这将安装 Chromium、Firefox 和 WebKit 浏览器。

---

## 配置设置

### 1. 创建环境变量文件

复制示例环境变量文件：

```bash
cp .env.example .env.local
```

### 2. 配置环境变量

编辑 `.env.local` 文件，填写以下配置：

```env
# Dify API 配置
DIFY_API_ENDPOINT=https://api.dify.ai/v1
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxx
DIFY_ENV=development

# 可选配置
# DIFY_AGENT_ID=agent-xxxxxxxxxxxx  # 如果使用特定 Agent ID
```

#### 配置说明

- **DIFY_API_ENDPOINT**: Dify API 的基础 URL
  - 生产环境：`https://api.dify.ai/v1`
  - 自托管：`https://your-dify-instance.com/v1`

- **DIFY_API_KEY**: Dify 应用的 API 密钥
  - 在 Dify 控制台中创建应用后获取
  - 格式：`app-` 开头的字符串

- **DIFY_ENV**: 运行环境标识
  - 开发环境：`development`
  - 测试环境：`test`
  - 生产环境：`production`

- **DIFY_AGENT_ID** (可选): 特定 Agent 的 ID
  - 如果不设置，将使用默认的 workflow endpoint

### 3. 验证配置

创建一个测试文件来验证配置是否正确：

```bash
# 检查环境变量是否加载
bun run dev
```

如果配置正确，开发服务器应该能够正常启动。

---

## 运行开发服务器

### 1. 启动开发服务器

```bash
bun run dev
```

服务器将在 `http://localhost:3000` 启动。

### 2. 访问应用

在浏览器中打开：
```
http://localhost:3000
```

你应该能看到用户反馈表单界面。

### 3. 开发服务器特性

- **热重载 (Hot Reload)**: 修改代码后自动刷新页面
- **快速刷新 (Fast Refresh)**: React 组件状态保持
- **错误提示**: 在浏览器中显示详细的错误信息

### 4. 停止服务器

按 `Ctrl + C` 停止开发服务器。

---

## 运行测试

项目包含两种类型的测试：单元测试和 E2E 测试。

### 单元测试

单元测试使用 Vitest 框架，测试独立的函数、类和模块。

#### 运行所有单元测试

```bash
bun run test
```

#### 运行测试并监听文件变化

```bash
bun run test -- --watch
```

#### 运行测试 UI 界面

```bash
bun run test:ui
```

这将打开一个交互式的测试 UI，可以在浏览器中查看测试结果。

#### 生成测试覆盖率报告

```bash
bun run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录下，可以在浏览器中打开 `coverage/index.html` 查看。

#### 运行特定测试文件

```bash
bun run test tests/unit/validators/feedbackValidator.test.ts
```

#### 运行匹配特定模式的测试

```bash
bun run test -- --grep "validation"
```

### E2E 测试

E2E 测试使用 Playwright 框架，测试完整的用户流程。

#### 运行所有 E2E 测试

```bash
bun run test:e2e
```

这将在无头模式下运行所有 E2E 测试。

#### 运行 E2E 测试（有头模式）

```bash
bun run test:e2e:headed
```

这将打开浏览器窗口，可以看到测试执行过程。

#### 运行 E2E 测试 UI 界面

```bash
bun run test:e2e:ui
```

这将打开 Playwright 的交互式测试 UI。

#### 运行特定浏览器的测试

```bash
# 只在 Chromium 中运行
bun run test:e2e --project=chromium

# 只在 Firefox 中运行
bun run test:e2e --project=firefox
```

#### 运行特定测试文件

```bash
bun run test:e2e tests/e2e/feedback-form.spec.ts
```

### 集成测试

集成测试需要真实的 Dify API 连接，默认在 CI 环境中运行。

#### 在本地运行集成测试

```bash
RUN_INTEGRATION_TESTS=true bun run test:e2e
```

**注意**: 集成测试会调用真实的 Dify API，可能会产生费用或消耗配额。

### 测试最佳实践

1. **在提交代码前运行所有测试**
   ```bash
   bun run test && bun run test:e2e
   ```

2. **使用测试覆盖率确保代码质量**
   ```bash
   bun run test:coverage
   ```
   目标覆盖率：> 80%

3. **使用测试 UI 调试失败的测试**
   ```bash
   bun run test:ui
   bun run test:e2e:ui
   ```

---

## 构建和部署

### 1. 构建生产版本

```bash
bun run build
```

这将创建优化的生产构建，输出到 `.next/` 目录。

### 2. 本地运行生产版本

```bash
bun run start
```

生产服务器将在 `http://localhost:3000` 启动。

### 3. 代码检查

运行 ESLint 检查代码质量：

```bash
bun run lint
```

修复可自动修复的问题：

```bash
bun run lint -- --fix
```

### 4. 部署到 Vercel

#### 方法 1: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
bun add -g vercel

# 登录
vercel login

# 部署
vercel
```

#### 方法 2: 通过 GitHub 集成

1. 将代码推送到 GitHub
2. 在 Vercel 控制台中导入项目
3. 配置环境变量
4. 点击部署

#### 环境变量配置

在 Vercel 项目设置中配置以下环境变量：
- `DIFY_API_ENDPOINT`
- `DIFY_API_KEY`
- `DIFY_ENV=production`

---

## 故障排查

### 问题 1: Bun 安装失败

**症状**: `bun install` 命令失败

**解决方案**:
1. 确保 Bun 版本 >= 1.0.0
   ```bash
   bun --version
   ```
2. 清除缓存并重试
   ```bash
   rm -rf node_modules bun.lock
   bun install
   ```
3. 如果仍然失败，尝试使用 npm
   ```bash
   npm install
   ```

### 问题 2: 开发服务器无法启动

**症状**: `bun run dev` 失败或端口被占用

**解决方案**:
1. 检查端口 3000 是否被占用
   ```bash
   # macOS/Linux
   lsof -i :3000
   
   # 杀死占用端口的进程
   kill -9 <PID>
   ```
2. 使用不同的端口
   ```bash
   PORT=3001 bun run dev
   ```

### 问题 3: 环境变量未加载

**症状**: API 调用失败，提示缺少配置

**解决方案**:
1. 确保 `.env.local` 文件存在
   ```bash
   ls -la .env.local
   ```
2. 检查环境变量格式是否正确（无空格、无引号）
3. 重启开发服务器
   ```bash
   # 停止服务器 (Ctrl + C)
   bun run dev
   ```

### 问题 4: Playwright 测试失败

**症状**: E2E 测试无法运行或浏览器启动失败

**解决方案**:
1. 重新安装 Playwright 浏览器
   ```bash
   bunx playwright install --with-deps
   ```
2. 检查是否有足够的系统资源
3. 尝试在有头模式下运行以查看错误
   ```bash
   bun run test:e2e:headed
   ```

### 问题 5: 测试超时

**症状**: E2E 测试因超时而失败

**解决方案**:
1. 确保开发服务器正在运行
2. 检查网络连接
3. 增加超时时间（在测试文件中）
   ```typescript
   test('my test', async ({ page }) => {
     // ...
   }, { timeout: 60000 }); // 60 秒
   ```

### 问题 6: Dify API 调用失败

**症状**: 反馈提交失败，返回 401 或 403 错误

**解决方案**:
1. 验证 API 密钥是否正确
2. 检查 API endpoint 是否可访问
   ```bash
   curl -X POST https://api.dify.ai/v1/workflows/run \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json"
   ```
3. 确认 Dify 应用配置正确

### 问题 7: 构建失败

**症状**: `bun run build` 失败

**解决方案**:
1. 清除缓存
   ```bash
   rm -rf .next
   bun run build
   ```
2. 检查 TypeScript 错误
   ```bash
   bunx tsc --noEmit
   ```
3. 检查 ESLint 错误
   ```bash
   bun run lint
   ```

---

## 常见问题

### Q1: 如何切换到 npm 或 yarn？

**A**: 虽然项目推荐使用 Bun，但也可以使用 npm 或 yarn：

```bash
# 使用 npm
npm install
npm run dev

# 使用 yarn
yarn install
yarn dev
```

### Q2: 如何添加新的依赖？

**A**: 使用 Bun 添加依赖：

```bash
# 添加生产依赖
bun add <package-name>

# 添加开发依赖
bun add -d <package-name>
```

### Q3: 如何调试测试？

**A**: 使用测试 UI 或浏览器开发工具：

```bash
# 单元测试 UI
bun run test:ui

# E2E 测试 UI
bun run test:e2e:ui

# 使用 VS Code 调试器
# 在测试文件中设置断点，然后按 F5
```

### Q4: 如何查看测试覆盖率？

**A**: 运行覆盖率命令并打开报告：

```bash
bun run test:coverage
open coverage/index.html
```

### Q5: 如何在不同环境中运行？

**A**: 使用不同的环境变量文件：

```bash
# 开发环境
cp .env.example .env.local
bun run dev

# 测试环境
cp .env.example .env.test
DIFY_ENV=test bun run dev

# 生产环境
cp .env.example .env.production
bun run build
bun run start
```

### Q6: 如何贡献代码？

**A**: 遵循以下流程：

1. Fork 项目
2. 创建特性分支
   ```bash
   git checkout -b feature/my-feature
   ```
3. 提交更改
   ```bash
   git commit -m "Add my feature"
   ```
4. 运行测试
   ```bash
   bun run test && bun run test:e2e
   ```
5. 推送到分支
   ```bash
   git push origin feature/my-feature
   ```
6. 创建 Pull Request

### Q7: 如何更新依赖？

**A**: 使用 Bun 更新依赖：

```bash
# 更新所有依赖到最新版本
bun update

# 更新特定依赖
bun update <package-name>

# 检查过期的依赖
bunx npm-check-updates
```

### Q8: 如何查看项目文档？

**A**: 项目文档位于以下位置：

- **需求文档**: `.kiro/specs/user-feedback/requirements.md`
- **测试关联文档**: `.kiro/specs/user-feedback/requirement_test.md`
- **运行手册**: `.kiro/specs/user-feedback/runbook.md` (本文档)
- **项目 README**: `webapp/README.md`
- **测试文档**: `webapp/tests/README.md`

---

## 快速参考

### 常用命令

```bash
# 安装依赖
bun install

# 运行开发服务器
bun run dev

# 运行所有测试
bun run test && bun run test:e2e

# 运行测试覆盖率
bun run test:coverage

# 构建生产版本
bun run build

# 运行生产服务器
bun run start

# 代码检查
bun run lint
```

### 项目目录结构

```
webapp/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   ├── components/          # 页面组件
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 主页面
├── lib/                     # 业务逻辑
│   ├── clients/            # API 客户端
│   ├── services/           # 服务层
│   ├── validators/         # 验证器
│   └── config.ts           # 配置管理
├── components/             # 共享组件
│   └── ui/                # shadcn/ui 组件
├── tests/                  # 测试文件
│   ├── unit/              # 单元测试
│   └── e2e/               # E2E 测试
├── .env.local             # 环境变量（本地）
├── .env.example           # 环境变量示例
├── package.json           # 项目配置
├── vitest.config.ts       # Vitest 配置
└── playwright.config.ts   # Playwright 配置
```

### 环境变量

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| DIFY_API_ENDPOINT | 是 | Dify API 端点 | https://api.dify.ai/v1 |
| DIFY_API_KEY | 是 | Dify API 密钥 | app-xxxxxxxxxxxx |
| DIFY_ENV | 否 | 运行环境 | development/test/production |
| DIFY_AGENT_ID | 否 | Agent ID | agent-xxxxxxxxxxxx |

### 测试命令

| 命令 | 说明 |
|------|------|
| `bun run test` | 运行单元测试 |
| `bun run test:ui` | 打开单元测试 UI |
| `bun run test:coverage` | 生成测试覆盖率报告 |
| `bun run test:e2e` | 运行 E2E 测试 |
| `bun run test:e2e:ui` | 打开 E2E 测试 UI |
| `bun run test:e2e:headed` | 运行 E2E 测试（有头模式） |

---

## 获取帮助

如果遇到问题，可以通过以下方式获取帮助：

1. **查看文档**: 阅读项目文档和 README
2. **搜索 Issues**: 在 GitHub Issues 中搜索类似问题
3. **提交 Issue**: 创建新的 Issue 描述问题
4. **联系团队**: 通过团队沟通渠道联系开发团队

---

## 更新日志

- **2024-02-01**: 初始版本，包含完整的运行和测试指南
