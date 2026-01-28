# 设计文档

## 概述

用户反馈系统是一个基于 Next.js 的全栈应用，它接收用户提交的反馈内容（文本和可选图片），通过 Next.js Server Actions 调用 Dify 定义的 Workflow 进行自动分类和产品相关性验证，然后将有效反馈创建为 GitHub Issue。系统支持图片上传功能，用户可以附带截图或其他图片来更好地描述问题。系统确保只有相关且可分类的反馈被持久化，管理员可以直接在 GitHub 中查看和管理所有反馈。

## 技术栈

- **前端**: Next.js (React) with App Router
- **后端**: Next.js Server Actions
- **AI 处理**: Dify 平台定义的 Workflow
  - LLM 实现意图识别和分类
  - RAG 实现产品相关性检查
  - API 工具调用 GitHub API 创建 Issue
- **文件上传**: Dify File Upload API
- **存储**: GitHub Issues
- **部署**: Vercel

## 架构

系统采用 Next.js App Router 架构，使用 Server Actions 处理后端逻辑：

1. **前端层 (Next.js Client Component)** - 用户界面，收集反馈输入和图片上传
2. **Server Actions** - 服务器端函数，处理反馈提交和文件上传逻辑
3. **文件上传层 (Dify File Upload API)** - 处理图片上传到 Dify
4. **AI 处理层 (Dify Workflow)** - 使用 LLM 进行分类，使用 RAG 进行相关性判断，使用 API 工具创建 GitHub Issue

```mermaid
graph TD
    A[Next.js Client Component] --> B{有图片?}
    B -->|是| C[Server Action: uploadFileToDify]
    B -->|否| D[Server Action: submitFeedback]
    C --> E[Dify File Upload API]
    E --> F{上传成功?}
    F -->|否| G[返回错误]
    F -->|是| D
    D --> H[输入验证]
    H --> I{验证通过?}
    I -->|否| G
    I -->|是| J[调用 Dify Workflow]
    J --> K[LLM 意图识别/分类]
    K --> L{能分类?}
    L -->|否| G
    L -->|是| M[RAG 相关性检查]
    M --> N{相关?}
    N -->|否| G
    N -->|是| O[Dify API 工具调用 GitHub API]
    O --> P{创建成功?}
    P -->|否| G
    P -->|是| Q[返回成功和 Issue URL]
    Q --> A
    G --> A
```

## 组件和接口

### 1. 前端组件 (Next.js Client Component)

#### FeedbackForm

用户反馈表单组件。

**文件位置:** `app/components/FeedbackForm.tsx`

**接口:**
```typescript
'use client';

interface FeedbackFormProps {
  // 无需 props，使用 Server Actions
}

interface FeedbackFormState {
  content: string;
  isLoading: boolean;
  message?: string;  // 成功或错误的提示信息
  success?: boolean;
  imageFile?: File;  // 选中的图片文件
  imagePreview?: string;  // 图片预览 URL
  imageFileId?: string;  // 上传后的 Dify 文件 ID
  isUploadingImage?: boolean;  // 图片上传中状态
}
```

**职责:**
- 渲染反馈输入表单和图片上传界面
- 客户端基本验证（非空、长度限制、文件类型和大小验证）
- 处理图片选择和预览
- 调用 uploadFileToDify Server Action 上传图片
- 调用 submitFeedback Server Action 提交反馈（包含图片文件 ID）
- 显示提交状态和结果
- 处理用户交互

### 2. Server Actions

#### submitFeedback

处理反馈提交的服务器端函数。

**文件位置:** `app/actions/feedback.ts`

**接口:**
```typescript
'use server';

export async function submitFeedback(
  content: string,
  imageFileId?: string
): Promise<FeedbackResponse> {
  // 实现逻辑
}

interface FeedbackResponse {
  success: boolean;
  message: string;  // Dify Workflow 返回的完整用户提示信息
}
```

**职责:**
- 接收客户端请求（包含文本内容和可选的图片文件 ID）
- 验证输入
- 调用 FeedbackService 处理反馈
- 返回结果

**优势:**
- 自动序列化和类型安全
- 无需手动定义 API 端点
- 更好的代码组织和复用
- 自动处理 CSRF 保护

#### uploadFileToDify

处理文件上传到 Dify 的服务器端函数。

**文件位置:** `app/actions/fileUpload.ts`

**接口:**
```typescript
'use server';

export async function uploadFileToDify(
  formData: FormData
): Promise<FileUploadResponse> {
  // 实现逻辑
}

interface FileUploadResponse {
  success: boolean;
  fileId?: string;  // Dify 返回的文件 ID
  fileUrl?: string;  // Dify 返回的文件 URL
  message?: string;  // 错误或成功消息
}
```

**职责:**
- 接收客户端上传的文件
- 验证文件类型（只允许图片）和大小（最大 10MB）
- 调用 DifyFileUploadClient 上传文件
- 返回文件 ID 和 URL

### 3. FeedbackValidator

负责验证反馈内容的基本格式和安全性。

**接口:**
```typescript
interface FeedbackValidator {
  validate(content: string): ValidationResult;
  sanitize(content: string): string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}
```

**职责:**
- 检查反馈内容是否为空
- 检查反馈长度是否超过限制（最大 5000 字符）
- 清理恶意脚本和不安全字符

### 4. DifyAgentClient

与 Dify Workflow 交互的客户端。

**文件位置:** `lib/clients/difyClient.ts`

**接口:**
```typescript
interface DifyAgentClient {
  processFeedback(content: string, imageFileId?: string): Promise<DifyAgentResult>;
}

interface DifyAgentResult {
  success: boolean;
  message: string;  // Dify Workflow 返回的完整用户提示信息（包含 Issue 编号或错误说明）
}

interface DifyWorkflowInputs {
  user_input: string;
  feedback_content: string;
  env: string;  // 环境标识（如 'production', 'development'）
  user_image?: {
    type: string;
    transfer_method: string;
    upload_file_id: string;
  };
}

interface DifyWorkflowRequest {
  inputs: DifyWorkflowInputs;
  user: string;
  response_mode: 'blocking';
}
```

**职责:**
- 调用 Dify Workflow API
- 传递反馈内容和可选的图片文件 ID
- 传递环境标识（env）用于区分不同环境
- Dify Workflow 内部完成：
  - LLM 分析和分类（无法分类时返回用户提示信息）
  - RAG 相关性检查（不相关时返回用户提示信息）
  - 调用 GitHub API 创建 Issue（包含图片信息）
- 接收并返回完整结果（Issue 编号和用户提示信息）
- 处理 Dify API 错误（401 认证失败、400 请求格式错误、429 请求过于频繁等）

**Dify Workflow 配置:**
1. **LLM 节点**: 分析反馈内容，识别意图和类型（bug/enhancement/question），如果无法分类则返回用户提示信息
2. **RAG 节点**: 基于产品文档检查相关性，如果不相关则返回用户提示信息
3. **API 工具节点**: 调用 GitHub API 创建 Issue，设置标题、正文（包含图片链接）和标签
4. **输出节点**: 返回 Issue 编号和用户提示信息

### 5. DifyFileUploadClient

与 Dify File Upload API 交互的客户端。

**文件位置:** `lib/clients/difyFileUpload.ts`

**接口:**
```typescript
interface DifyFileUploadClient {
  uploadFile(file: File): Promise<DifyFileUploadResult>;
}

interface DifyFileUploadResult {
  success: boolean;
  fileId?: string;  // Dify 返回的文件 ID
  fileUrl?: string;  // Dify 返回的文件 URL
  message?: string;  // 错误或成功消息
}
```

**职责:**
- 调用 Dify File Upload API
- 上传文件到 Dify
- 返回文件 ID 和 URL
- 处理上传错误（401 认证失败、400 请求格式错误等）

### 6. FeedbackService

协调所有组件的主服务（在 Server Action 中使用）。

**文件位置:** `lib/services/feedbackService.ts`

**接口:**
```typescript
interface FeedbackService {
  submitFeedback(content: string, imageFileId?: string): Promise<SubmissionResult>;
}

interface SubmissionResult {
  success: boolean;
  message: string;  // 用户提示信息
}
```

**职责:**
- 协调整个反馈处理流程
- 调用验证器进行基本验证
- 调用 Dify Workflow 完成分类、相关性检查和 Issue 创建（包含图片信息）
- 返回最终结果

**使用示例:**
```typescript
// app/actions/feedback.ts
'use server';

import { FeedbackService } from '@/lib/services/feedbackService';

export async function submitFeedback(content: string, imageFileId?: string) {
  const service = new FeedbackService();
  return await service.submitFeedback(content, imageFileId);
}
```

## 数据模型

由于所有的分类、相关性检查和 GitHub Issue 创建都由 Dify Agent 完成，系统本身不需要复杂的数据模型。主要的数据交互通过接口定义完成：

### 输入数据

```typescript
// 用户提交的原始反馈
interface FeedbackInput {
  content: string;  // 反馈内容
}
```

### 输出数据

```typescript
// 系统返回给用户的结果
interface FeedbackResponse {
  success: boolean;
  message: string;  // Dify Agent 返回的完整用户提示信息（已包含 Issue 编号等所有信息）
}
```

## 文件结构

```
app/
├── actions/
│   ├── feedback.ts           # Server Action: 提交反馈
│   └── fileUpload.ts         # Server Action: 上传文件
├── components/
│   └── FeedbackForm.tsx      # 反馈表单组件（包含图片上传）
├── page.tsx                  # 主页面
lib/
├── services/
│   └── feedbackService.ts    # 反馈服务
├── clients/
│   ├── difyClient.ts         # Dify Workflow 客户端
│   └── difyFileUpload.ts     # Dify 文件上传客户端
├── validators/
│   └── feedbackValidator.ts  # 输入验证器
└── config.ts                 # 配置管理
```

## 错误处理

系统定义以下错误类型：

1. **ValidationError** - 输入验证失败
   - 空内容
   - 内容过长
   - 包含不安全字符

2. **FileUploadError** - 文件上传失败
   - 文件类型不支持（只支持图片）
   - 文件大小超过限制（最大 10MB）
   - Dify 文件上传 API 错误

3. **DifyWorkflowError** - Dify Workflow 调用失败
   - Workflow 服务不可用
   - 网络错误
   - API 认证失败（401）
   - 请求格式错误（400）
   - 请求过于频繁（429）
   - 超时错误

所有错误都应返回清晰的错误信息，帮助用户理解问题并采取相应行动。对于 Dify Workflow 返回的业务逻辑错误（如无法分类、不相关等），这些会作为成功响应返回，包含在 message 字段中。

## 测试策略

### 单元测试

针对每个组件编写单元测试：
- **FeedbackValidator**: 测试各种输入格式和边界情况（空内容、超长内容、特殊字符等）
- **DifyAgentClient**: 测试 Dify Workflow API 调用和错误处理（模拟成功和失败场景）
- **DifyFileUploadClient**: 测试 Dify 文件上传 API 调用和错误处理（模拟成功和失败场景）
- **FeedbackService**: 测试完整流程（验证 → Dify Workflow → 返回结果）
- **FeedbackForm**: 测试前端组件的用户交互和状态管理（包括图片上传功能）
- **uploadFileToDify Server Action**: 测试文件上传逻辑和验证

### 属性测试

使用属性测试验证系统的通用正确性属性，确保系统在各种输入下都能正确运行。我们将使用 fast-check 库进行属性测试，每个测试运行至少 100 次迭代。


## 正确性属性

属性是一种特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范和机器可验证正确性保证之间的桥梁。

### 属性 1: 输入清理

*对于任何* 包含脚本标签或特殊 HTML 字符的反馈内容，清理后的内容应该不包含这些不安全字符。

**验证: 需求 1.4**

### 属性 2: 有效输入接受

*对于任何* 非空且长度在限制内的反馈内容，如果分类成功且相关性检查通过，系统应该返回成功结果。

**验证: 需求 1.1**

### 属性 3: 空白输入拒绝

*对于任何* 仅由空白字符（空格、制表符、换行符）组成的字符串，系统应该拒绝提交并返回验证错误。

**验证: 需求 1.2**

### 属性 4: 分类结果约束

*对于任何* 反馈内容，分类器返回的类型应该是 'bug'、'enhancement'、'question' 之一，或者是 null（表示无法分类）。

**验证: 需求 2.2**

### 属性 5: Issue 创建完整性

*对于任何* 通过验证、分类和相关性检查的反馈，创建的 GitHub Issue 应该满足：
- 标题是反馈内容的前 50 个字符（如果内容少于 50 字符则使用全部内容）
- 正文是完整的反馈内容
- 包含与分类类型对应的标签
- 包含 "user-feedback" 标签

**验证: 需求 4.1, 4.2, 4.3, 4.4, 6.3**

### 属性 6: 标签映射正确性

*对于任何* 反馈类型和创建的 Issue，标签映射应该满足：
- 类型为 'bug' 时，Issue 包含 'bug' 标签
- 类型为 'enhancement' 时，Issue 包含 'enhancement' 标签
- 类型为 'question' 时，Issue 包含 'question' 标签

**验证: 需求 5.1, 5.2, 5.3**

### 属性 7: 统一标签存在

*对于任何* 通过系统创建的 GitHub Issue，都应该包含 "user-feedback" 标签。

**验证: 需求 5.4**


## 配置管理

系统需要以下配置项（通过 `.env.local` 文件提供）：

```typescript
interface FeedbackConfig {
  validation: {
    maxLength: number;       // 最大反馈长度（默认 5000）
    minLength: number;       // 最小反馈长度（默认 1）
  };
  dify: {
    apiEndpoint: string;     // Dify API 端点 (DIFY_API_ENDPOINT)
    apiKey: string;          // Dify API 密钥 (DIFY_API_KEY)
    env: string;             // 环境标识 (DIFY_ENV)，如 'production', 'development'
    agentId?: string;        // Dify Workflow ID (DIFY_AGENT_ID)，可选
  };
}
```

**环境变量文件 (.env.local):**
```bash
# Dify 配置
DIFY_API_ENDPOINT=https://api.dify.ai/v1
DIFY_API_KEY=app-xxxxxxxxxxxx
DIFY_ENV=production
DIFY_AGENT_ID=workflow-xxxxxxxxxxxx  # 可选，如果 API Key 中已包含 workflow

# 验证配置
FEEDBACK_MAX_LENGTH=5000
```

**配置读取示例:**
```typescript
// lib/config.ts
export const config = {
  validation: {
    maxLength: parseInt(process.env.FEEDBACK_MAX_LENGTH || '5000', 10),
    minLength: 1,
  },
  dify: {
    apiEndpoint: process.env.DIFY_API_ENDPOINT!,
    apiKey: process.env.DIFY_API_KEY!,
    env: process.env.DIFY_ENV!,
    agentId: process.env.DIFY_AGENT_ID, // 可选
  },
};
```

**注意事项:**
- `.env.local` 文件不应提交到版本控制（已在 `.gitignore` 中）
- 生产环境配置通过 Vercel 环境变量设置
- 开发环境使用 `.env.local` 文件
- 所有必需的环境变量应在应用启动时验证

## 性能考虑

1. **Dify Workflow 调用** - LLM 和 RAG 处理可能需要几秒钟，应该设置合理的超时时间（建议 15-30 秒）
2. **文件上传** - 图片上传可能需要额外时间，应该在前端显示上传进度
3. **GitHub API 限流** - 注意 GitHub API 的速率限制（每小时 5000 次），考虑实现重试机制
4. **前端体验** - 使用 loading 状态和进度提示，提升用户体验
5. **并发处理** - Next.js Server Actions 可以处理并发请求，但注意 Dify API 的并发限制
6. **图片优化** - 考虑在客户端压缩大图片，减少上传时间和带宽消耗

## 安全考虑

1. **输入清理** - 必须清理所有用户输入，防止 XSS 攻击
2. **文件上传安全** - 验证文件类型和大小，防止恶意文件上传
3. **API 密钥管理** - Dify API 密钥应该存储在环境变量中，不应暴露在客户端代码或日志中
4. **错误信息** - 错误信息不应泄露系统内部细节（如 API 密钥、内部路径等）
5. **Server Actions 安全** - Server Actions 自动提供 CSRF 保护，确保只能从同源调用
6. **速率限制** - 考虑在 Server Action 层面实现速率限制，防止滥用
7. **环境变量验证** - 在应用启动时验证所有必需的环境变量是否存在
8. **文件存储安全** - 上传的文件存储在 Dify 平台，确保 Dify 的安全配置正确

## 部署

### Vercel 部署

应用将部署到 Vercel 平台，利用其无服务器架构和全球 CDN。

**部署配置:**

1. **环境变量设置** - 在 Vercel 项目设置中配置所有必需的环境变量：
   - `DIFY_API_ENDPOINT`
   - `DIFY_API_KEY`
   - `DIFY_ENV`
   - `DIFY_AGENT_ID`（可选）
   - `FEEDBACK_MAX_LENGTH`

2. **构建设置:**
   - Framework Preset: Next.js
   - Build Command: `npm run build` 或 `yarn build`
   - Output Directory: `.next`
   - Install Command: `npm install` 或 `yarn install`

3. **Server Actions 配置:**
   - Server Actions 在 Vercel 上作为服务器端代码运行
   - 自动处理 CSRF 保护和请求验证
   - 考虑 Dify Workflow 处理时间，确保响应时间在合理范围内
   - 文件上传通过 FormData 处理，注意 Vercel 的请求大小限制

4. **域名配置:**
   - 使用 Vercel 提供的默认域名或配置自定义域名
   - 自动 HTTPS 证书

**部署流程:**

```bash
# 1. 连接 GitHub 仓库到 Vercel
# 2. 配置环境变量
# 3. 触发部署（自动或手动）
# 4. Vercel 自动构建和部署

# 或使用 Vercel CLI
npm install -g vercel
vercel --prod
```

**注意事项:**
- 确保所有环境变量在 Vercel 中正确配置
- 使用 Vercel 的预览部署功能测试变更
- 监控 Vercel 的函数执行时间和错误日志
- 注意 Vercel Serverless Functions 的限制（请求大小、执行时间等）

## 实现注意事项

1. **错误处理** - 实现完善的错误处理和用户友好的错误提示
2. **日志记录** - 记录所有关键操作和错误，便于调试和监控（注意不要记录敏感信息如 API 密钥）
3. **监控指标** - 跟踪成功率、失败原因、处理时间等指标
4. **降级策略** - 当 Dify Workflow 不可用时，考虑是否需要降级方案（如暂存到队列）
5. **TypeScript 类型安全** - 充分利用 TypeScript 的类型系统，确保类型安全
6. **测试环境** - 使用测试仓库进行开发和测试，避免污染生产环境
7. **Vercel 限制** - 注意 Vercel Serverless Functions 的执行时间限制和请求大小限制，确保 Dify Workflow 调用和文件上传在限制内完成
8. **图片处理** - 前端显示图片预览，提升用户体验
9. **环境区分** - 使用 `env` 参数区分不同环境（production/development），便于在 Dify Workflow 中实现不同的处理逻辑
10. **文件 ID 传递** - 确保文件上传成功后，将文件 ID 正确传递给 Dify Workflow
