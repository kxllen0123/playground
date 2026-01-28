import { config } from '@/lib/config';

export interface DifyAgentResult {
  success: boolean;
  message: string; // Dify Agent 返回的完整用户提示信息（包含 Issue 编号或错误说明）
}

interface DifyWorkflowInputs {
  user_input: string;
  feedback_content: string;
  env: string;
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

export class DifyAgentClient {
  /**
   * 调用 Dify Agent 处理反馈
   */
  async processFeedback(content: string, imageFileId?: string): Promise<DifyAgentResult> {
    try {
      // 使用 Dify Workflow API
      // 如果配置了 workflow ID，使用 /workflows/{workflow_id}/run
      // 否则使用 /workflows/run（workflow ID 在 API Key 中）
      const workflowEndpoint = config.dify.agentId 
        ? `${config.dify.apiEndpoint}/workflows/${config.dify.agentId}/run`
        : `${config.dify.apiEndpoint}/workflows/run`;

      const requestBody: DifyWorkflowRequest = {
        inputs: {
          user_input: content, // Dify Workflow API 要求 user_input 字段
          env: config.dify.env,
          feedback_content: content, // 同时提供 feedback_content 以兼容自定义 workflow
        },
        user: 'user-feedback-system',
        response_mode: 'blocking' as const,
      };

      // 如果有图片文件 ID，添加到 inputs 中，参数名为 user_image
      if (imageFileId) {
        console.log('=== 准备传递图片文件到 Workflow ===');
        console.log('图片文件 ID:', imageFileId);
        console.log('文件 ID 类型:', typeof imageFileId);
        
        requestBody.inputs.user_image = {
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: imageFileId,
        }
        
        console.log('Workflow 请求体中的 inputs:', JSON.stringify(requestBody.inputs, null, 2));
        console.log('=== 图片文件传递准备结束 ===');
      }

      const response = await fetch(
        workflowEndpoint,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.dify.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        let errorText = '';
        let errorData: Record<string, unknown> | null = null;
        
        try {
          errorText = await response.text();
          // 尝试解析 JSON 错误信息
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // 如果不是 JSON，使用原始文本
          }
        } catch {
          errorText = '无法读取错误信息';
        }
        
        console.error('Dify API 错误:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          errorData,
        });
        
        if (response.status === 401) {
          return {
            success: false,
            message: '认证失败，请检查 API 密钥配置',
          };
        }
        
        if (response.status === 400) {
          // 400 错误通常是请求格式问题
          const errorMessage = errorData?.message || errorData?.error || errorText || '请求格式错误';
          return {
            success: false,
            message: `请求格式错误：${errorMessage}。请检查 Dify Agent 配置和 API 端点。`,
          };
        }
        
        if (response.status === 429) {
          return {
            success: false,
            message: '请求过于频繁，请稍后再试',
          };
        }

        const errorMessage = errorData?.message || errorData?.error || errorText || '未知错误';
        return {
          success: false,
          message: `服务暂时不可用，请稍后再试（错误代码: ${response.status}，详情: ${errorMessage}）`,
        };
      }

      const data = await response.json();

      // 打印完整的 Dify API 响应数据
      console.log('=== Dify API 完整响应 ===');
      console.log('响应数据:', JSON.stringify(data, null, 2));
      console.log('响应数据结构:', {
        'outputs': data.outputs,
        'outputs.content': data.outputs?.content,
        'data.outputs': data.data?.outputs,
        'data.outputs.content': data.data?.outputs?.content,
        'data.answer': data.data?.answer,
        'answer': data.answer,
        'message': data.message,
      });

      // Dify Workflow API 返回的数据结构
      // Workflow 内部会完成分类、相关性检查和 GitHub Issue 创建
      // 返回的消息应该包含 Issue 编号或错误说明
      // 优先使用 data.outputs.content 作为反馈结果
      const message = 
        data.outputs?.content ||           // 优先使用 outputs.content
        data.data?.outputs?.content ||    // 兼容 data.data.outputs.content
        data.data?.outputs?.message || 
        data.data?.outputs?.text ||
        data.outputs?.message ||
        data.outputs?.text ||
        data.data?.answer ||
        data.answer || 
        data.message || 
        '反馈已提交';

      console.log('提取的消息:', message);
      console.log('=== Dify API 响应结束 ===');

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('Dify Agent 调用失败:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: '网络错误，请检查网络连接',
        };
      }

      return {
        success: false,
        message: '服务暂时不可用，请稍后再试',
      };
    }
  }
}
