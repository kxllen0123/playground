# 用户反馈系统

基于 Next.js 的用户反馈系统，支持自动分类、产品相关性验证和 GitHub Issue 创建。

## 功能特性

- ✅ 用户反馈提交
- ✅ 自动分类（bug/enhancement/question）
- ✅ 产品相关性验证（基于 RAG）
- ✅ 自动创建 GitHub Issue
- ✅ 移动端优化界面
- ✅ 输入验证和安全清理

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **包管理器**: Bun
- **AI Agent**: Dify Platform
- **存储**: GitHub Issues

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 配置环境变量

复制 `env.example` 文件为 `.env.local` 并填写配置：

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，填写以下配置：

```env
# GitHub 配置
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo

# Dify 配置
DIFY_API_ENDPOINT=https://api.dify.ai/v1
DIFY_API_KEY=app-xxxxxxxxxxxx
DIFY_AGENT_ID=agent-xxxxxxxxxxxx

# 验证配置（可选，默认 5000）
FEEDBACK_MAX_LENGTH=5000
```

### 3. 运行开发服务器

```bash
bun dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
webapp/
├── app/
│   ├── actions/
│   │   └── feedback.ts          # Server Action
│   ├── components/
│   │   └── FeedbackForm.tsx     # 反馈表单组件
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 主页面
├── lib/
│   ├── clients/
│   │   └── difyClient.ts        # Dify Agent 客户端
│   ├── services/
│   │   └── feedbackService.ts   # 反馈服务
│   ├── validators/
│   │   └── feedbackValidator.ts # 输入验证器
│   ├── config.ts                # 配置管理
│   └── utils.ts                 # 工具函数
└── components/
    └── ui/                      # shadcn/ui 组件
```

## Dify Agent 配置

系统依赖 Dify Platform 上配置的 Agent，该 Agent 需要完成以下工作：

1. **LLM 节点**: 分析反馈内容，识别意图和类型（bug/enhancement/question）
2. **RAG 节点**: 基于产品文档检查相关性
3. **API 工具节点**: 调用 GitHub API 创建 Issue
4. **输出节点**: 返回 Issue 编号和用户提示信息

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（参考 `.env.local`）
4. 部署

### 环境变量配置

在 Vercel 项目设置中配置所有必需的环境变量。

## 开发

### 构建

```bash
bun build
```

### 生产运行

```bash
bun start
```

### 代码检查

```bash
bun lint
```

## 许可证

MIT
