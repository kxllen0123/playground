import { config } from '@/lib/config';

export interface DifyFileUploadResult {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  message?: string;
}

export class DifyFileUploadClient {
  /**
   * 上传文件到 Dify
   */
  async uploadFile(file: File): Promise<DifyFileUploadResult> {
    try {
      // Dify 文件上传 API 端点
      const uploadEndpoint = `${config.dify.apiEndpoint}/files/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', 'user-feedback-system');

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.dify.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorText = '';
        let errorData: Record<string, unknown> | null = null;
        
        try {
          errorText = await response.text();
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // 如果不是 JSON，使用原始文本
          }
        } catch {
          errorText = '无法读取错误信息';
        }

        console.error('Dify 文件上传错误:', {
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
          const errorMessage = errorData?.message || errorData?.error || errorText || '请求格式错误';
          return {
            success: false,
            message: `文件上传失败：${errorMessage}`,
          };
        }

        const errorMessage = errorData?.message || errorData?.error || errorText || '未知错误';
        return {
          success: false,
          message: `文件上传失败（错误代码: ${response.status}，详情: ${errorMessage}）`,
        };
      }

      const data = await response.json();

      // 打印完整的 Dify 文件上传响应数据
      console.log('=== Dify 文件上传完整响应 ===');
      console.log('响应状态:', response.status);
      console.log('响应数据 (JSON):', JSON.stringify(data, null, 2));
      console.log('响应数据结构:', {
        'data': data,
        'data.id': data.id,
        'data.file_id': data.file_id,
        'id': data.id,
        'file_id': data.file_id,
        'url': data.url,
        'file_url': data.file_url,
        'download_url': data.download_url,
        'name': data.name,
        'size': data.size,
        'extension': data.extension,
        'mime_type': data.mime_type,
      });
      console.log('=== Dify 文件上传响应结束 ===');

      // Dify 文件上传 API 返回的数据结构
      // 通常包含 id 和 url 字段
      const fileId = data.id || data.file_id;
      const fileUrl = data.url || data.file_url || data.download_url;

      console.log('提取的文件 ID:', fileId);
      console.log('提取的文件 URL:', fileUrl);

      if (!fileId) {
        console.error('警告: 未能从响应中提取文件 ID');
        console.error('完整响应数据:', data);
        return {
          success: false,
          message: '文件上传成功，但未能获取文件 ID。请检查 Dify API 响应格式。',
        };
      }

      return {
        success: true,
        fileId,
        fileUrl,
      };
    } catch (error) {
      console.error('Dify 文件上传失败:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: '网络错误，请检查网络连接',
        };
      }

      return {
        success: false,
        message: '文件上传失败，请稍后再试',
      };
    }
  }
}
