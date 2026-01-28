interface FeedbackConfig {
  validation: {
    maxLength: number;
    minLength: number;
  };
  dify: {
    apiEndpoint: string;
    apiKey: string;
    env: string;
    agentId?: string; // Workflow ID（可选，如果 API Key 中已包含 workflow，可以留空）
  };
}

function getConfig(): FeedbackConfig {
  // 在测试环境中，如果环境变量未设置，使用默认值
  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  
  const requiredEnvVars = {
    DIFY_API_ENDPOINT: process.env.DIFY_API_ENDPOINT,
    DIFY_API_KEY: process.env.DIFY_API_KEY,
  };

  // 验证必需的环境变量（DIFY_ENV 和 DIFY_AGENT_ID 是可选的）
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0 && !isTest) {
    throw new Error(
      `缺少必需的环境变量: ${missingVars.join(', ')}`
    );
  }

  return {
    validation: {
      maxLength: parseInt(process.env.FEEDBACK_MAX_LENGTH || '5000', 10),
      minLength: 1,
    },
    dify: {
      apiEndpoint: requiredEnvVars.DIFY_API_ENDPOINT || 'https://api.dify.ai/v1',
      apiKey: requiredEnvVars.DIFY_API_KEY || 'test-api-key',
      env: process.env.DIFY_ENV || (isTest ? 'test' : 'dev'),
      agentId: process.env.DIFY_AGENT_ID, // 可选
    },
  };
}

export const config = getConfig();
