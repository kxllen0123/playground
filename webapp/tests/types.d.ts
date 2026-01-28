/// <reference types="vitest" />
/// <reference types="@playwright/test" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DIFY_API_ENDPOINT: string;
      DIFY_API_KEY: string;
      DIFY_ENV: string;
      DIFY_AGENT_ID?: string;
      FEEDBACK_MAX_LENGTH?: string;
      BASE_URL?: string;
      CI?: string;
      RUN_INTEGRATION_TESTS?: string;
    }
  }
}

export {};
