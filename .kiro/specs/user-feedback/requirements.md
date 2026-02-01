# 需求文档

## 简介

用户反馈功能允许用户提交反馈意见、建议或问题报告（支持文本和可选图片），系统通过 Dify Workflow 自动识别分类、验证产品相关性，并将有效反馈创建为 GitHub Issue，帮助产品团队收集用户声音并改进产品体验。

## 术语表

- **System**: 用户反馈系统
- **User**: 提交反馈的用户
- **Feedback**: 用户提交的反馈内容（文本和可选图片）
- **Dify_Workflow**: Dify 平台定义的工作流，负责分类、相关性检查和 Issue 创建
- **LLM**: 大语言模型，用于意图识别和分类
- **RAG**: 检索增强生成，用于产品相关性验证
- **GitHub_API**: GitHub API 接口，由 Dify Workflow 调用以创建和管理 Issue
- **Issue**: GitHub Issue，用于存储反馈数据
- **Admin**: 管理员，通过 GitHub Issue 查看和管理反馈
- **File_Upload_API**: Dify 文件上传 API，用于上传图片文件

## 需求

### 需求 1: 提交反馈

**用户故事:** 作为用户，我想要提交反馈（文本和可选图片），以便向产品团队表达我的意见和建议。

#### 验收标准

1. WHEN 用户提供有效的反馈内容并提交 THEN THE System SHALL 在 30 秒内接受反馈并返回成功确认
2. WHEN 用户尝试提交空白反馈（长度 < 1 字符）THEN THE System SHALL 在 100 毫秒内拒绝提交并返回错误信息
3. WHEN 反馈内容超过最大长度限制（5000 字符）THEN THE System SHALL 在 100 毫秒内拒绝提交并返回错误信息
4. THE System SHALL 清理反馈内容中的恶意脚本和不安全字符，处理时间 < 50 毫秒
5. WHEN 用户选择上传图片 THEN THE System SHALL 支持常见图片格式（JPEG、PNG、GIF、WebP 等）
6. WHEN 图片文件大小超过 10MB THEN THE System SHALL 在 50 毫秒内拒绝上传并返回错误信息
7. WHEN 用户上传非图片文件 THEN THE System SHALL 在 50 毫秒内拒绝上传并返回错误信息
8. THE System SHALL 在用户输入时实时显示剩余字符数（5000 - 当前字符数）

### 需求 2: 图片上传

**用户故事:** 作为用户，我想要上传图片附件，以便更清晰地描述问题或建议。

#### 验收标准

1. WHEN 用户选择图片文件 THEN THE System SHALL 在 200 毫秒内显示图片预览
2. WHEN 用户提交反馈前 THEN THE System SHALL 在 10 秒内完成图片上传到 File_Upload_API
3. WHEN 图片上传成功 THEN THE System SHALL 获取文件 ID 并在提交反馈时传递
4. WHEN 图片上传失败 THEN THE System SHALL 在 1 秒内显示错误信息并阻止反馈提交
5. THE System SHALL 允许用户在提交前移除已选择的图片，操作响应时间 < 100 毫秒
6. THE System SHALL 在图片上传过程中显示加载状态
7. WHEN 反馈提交成功 THEN THE System SHALL 将图片文件 ID 传递给 Dify_Workflow
8. THE System SHALL 支持最大图片尺寸为 10MB，最小尺寸为 1KB

### 需求 3: 自动分类反馈

**用户故事:** 作为系统，我需要通过 Dify_Workflow 自动识别反馈类型，以便产品团队更好地理解和处理反馈。

#### 验收标准

1. WHEN 接收到反馈内容 THEN THE Dify_Workflow SHALL 在 30 秒内使用 LLM 分析内容并识别反馈类型
2. THE Dify_Workflow SHALL 将反馈分类为以下 3 种类型之一：bug（程序错误）、enhancement（功能建议）、question（疑问）
3. WHEN Dify_Workflow 无法确定类型 THEN THE System SHALL 在 1 秒内拒绝反馈并返回错误信息
4. THE Dify_Workflow SHALL 基于反馈内容的关键词和语义进行分类判断，分类准确率目标 ≥ 90%
5. WHEN 反馈包含图片 THEN THE Dify_Workflow SHALL 能够访问图片内容辅助分类，处理时间增加 < 10 秒

### 需求 4: 产品相关性验证

**用户故事:** 作为系统，我需要通过 Dify_Workflow 验证反馈是否与产品相关，以便过滤无关内容。

#### 验收标准

1. WHEN 接收到反馈内容 THEN THE Dify_Workflow SHALL 在 20 秒内使用 RAG 基于产品定义判断反馈是否与产品相关
2. WHEN 反馈与产品定义无关 THEN THE System SHALL 在 5 秒内拒绝反馈并返回错误信息
3. THE Dify_Workflow SHALL 使用产品文档和定义作为 RAG 知识库
4. WHEN 反馈通过相关性验证 THEN THE Dify_Workflow SHALL 继续处理反馈
5. WHEN 反馈包含图片 THEN THE Dify_Workflow SHALL 能够访问图片内容辅助相关性判断，处理时间增加 < 10 秒
6. THE Dify_Workflow SHALL 达到相关性判断准确率目标 ≥ 85%

### 需求 5: 创建 GitHub Issue

**用户故事:** 作为系统，我需要通过 Dify_Workflow 将反馈创建为 GitHub Issue，以便管理员可以在 GitHub 中管理反馈。

#### 验收标准

1. WHEN 反馈通过验证和分类 THEN THE Dify_Workflow SHALL 在 10 秒内使用 API 工具调用 GitHub_API 创建新 Issue
2. WHEN 创建 Issue THEN THE Dify_Workflow SHALL 使用反馈内容作为 Issue 正文，保留原始格式
3. WHEN 创建 Issue THEN THE Dify_Workflow SHALL 根据识别的类型添加对应的 1-2 个标签
4. WHEN 反馈包含图片 THEN THE Dify_Workflow SHALL 在 Issue 中包含图片引用或链接
5. IF GitHub_API 调用失败 THEN THE System SHALL 在 3 次重试后返回错误并通知用户重试
6. WHEN Issue 创建成功 THEN THE System SHALL 在 2 秒内返回包含 Issue 编号或 URL 的成功消息
7. THE System SHALL 确保端到端反馈提交流程（包含图片）在 60 秒内完成

### 需求 6: GitHub Issue 标签管理

**用户故事:** 作为系统，我需要为 Issue 添加合适的标签，以便管理员可以快速筛选和识别反馈类型。

#### 验收标准

1. WHEN 反馈类型为 "bug" THEN THE Dify_Workflow SHALL 为 Issue 添加 "bug" 标签（共 1 个类型标签）
2. WHEN 反馈类型为 "enhancement" THEN THE Dify_Workflow SHALL 为 Issue 添加 "enhancement" 标签（共 1 个类型标签）
3. WHEN 反馈类型为 "question" THEN THE Dify_Workflow SHALL 为 Issue 添加 "question" 标签（共 1 个类型标签）
4. THE Dify_Workflow SHALL 为所有反馈 Issue 添加统一的 "user-feedback" 标签（共 1 个通用标签）
5. THE System SHALL 确保每个 Issue 至少有 2 个标签（1 个类型标签 + 1 个通用标签）

### 需求 7: 管理员查看反馈

**用户故事:** 作为管理员，我想要在 GitHub Issue 中查看所有用户反馈，以便了解用户需求和问题。

#### 验收标准

1. WHEN Admin 访问 GitHub 仓库 THEN THE Admin SHALL 能够查看所有带有 "user-feedback" 标签的 Issue
2. WHEN Admin 使用标签筛选 THEN THE Admin SHALL 能够按 3 种反馈类型（bug、enhancement、question）查看 Issue
3. WHEN Admin 查看 Issue THEN THE Issue SHALL 包含完整的反馈内容（≤ 5000 字符）和至少 2 个自动添加的标签
4. WHEN Issue 包含图片 THEN THE Admin SHALL 能够在 Issue 中查看图片（支持 ≤ 10MB 的图片）
5. THE System SHALL 确保 Issue 按创建时间倒序排列（最新的在最前面）

### 需求 8: 错误处理和用户反馈

**用户故事:** 作为用户，我想要在操作失败时收到清晰的错误提示，以便了解问题并采取相应行动。

#### 验收标准

1. WHEN 网络请求失败 THEN THE System SHALL 在 2 秒内显示 "网络错误，请检查网络连接"
2. WHEN API 认证失败（HTTP 401）THEN THE System SHALL 在 1 秒内显示 "认证失败，请检查 API 密钥配置"
3. WHEN 请求频率超限（HTTP 429）THEN THE System SHALL 在 1 秒内显示 "请求过于频繁，请稍后再试"
4. WHEN 服务不可用（HTTP 5xx）THEN THE System SHALL 在 2 秒内显示 "服务暂时不可用，请稍后再试"
5. WHEN 操作成功 THEN THE System SHALL 在 30 秒内显示包含 Issue 信息的成功消息（长度 ≥ 20 字符）
6. THE System SHALL 在处理过程中显示加载状态
7. THE System SHALL 确保所有错误消息长度在 10-200 字符之间，便于用户理解
8. THE System SHALL 在 99% 的情况下在 60 秒内完成反馈提交或返回明确错误
