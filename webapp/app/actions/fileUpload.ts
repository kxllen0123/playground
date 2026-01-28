'use server';

import { DifyFileUploadClient } from '@/lib/clients/difyFileUpload';

export interface FileUploadResponse {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  message?: string;
}

/**
 * Server Action: 上传文件到 Dify
 */
export async function uploadFileToDify(
  formData: FormData
): Promise<FileUploadResponse> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        message: '请选择要上传的文件',
      };
    }

    // 验证文件类型（只允许图片）
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        message: '只支持上传图片文件',
      };
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: '图片大小不能超过 10MB',
      };
    }

    const uploadClient = new DifyFileUploadClient();
    
    console.log('=== 开始上传文件到 Dify ===');
    console.log('文件名:', file.name);
    console.log('文件大小:', file.size);
    console.log('文件类型:', file.type);
    
    const result = await uploadClient.uploadFile(file);
    
    console.log('=== 文件上传结果 ===');
    console.log('成功状态:', result.success);
    console.log('文件 ID:', result.fileId);
    console.log('文件 URL:', result.fileUrl);
    console.log('消息:', result.message);
    console.log('=== 文件上传结果结束 ===');

    return {
      success: result.success,
      fileId: result.fileId,
      fileUrl: result.fileUrl,
      message: result.message,
    };
  } catch (error) {
    console.error('文件上传失败:', error);
    
    return {
      success: false,
      message: error instanceof Error 
        ? error.message 
        : '文件上传失败，请稍后再试',
    };
  }
}
