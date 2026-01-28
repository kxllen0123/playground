import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadFileToDify } from '@/app/actions/fileUpload';

// Mock DifyFileUploadClient
vi.mock('@/lib/clients/difyFileUpload', () => ({
  DifyFileUploadClient: vi.fn(),
}));

describe('uploadFileToDify Server Action', () => {
  let mockClient: {
    uploadFile: ReturnType<typeof vi.fn>;
  };
  let mockFormData: FormData;
  let mockFile: File;

  beforeEach(async () => {
    mockClient = {
      uploadFile: vi.fn(),
    };

    const { DifyFileUploadClient } = await import('@/lib/clients/difyFileUpload');
    (DifyFileUploadClient as any).mockImplementation(() => mockClient);

    mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
    mockFormData = new FormData();
    mockFormData.append('file', mockFile);

    vi.clearAllMocks();
  });

  it('should successfully upload a file', async () => {
    mockClient.uploadFile.mockResolvedValue({
      success: true,
      fileId: 'file-123',
      fileUrl: 'https://example.com/file-123.png',
    });

    const result = await uploadFileToDify(mockFormData);

    expect(result.success).toBe(true);
    expect(result.fileId).toBe('file-123');
    expect(result.fileUrl).toBe('https://example.com/file-123.png');
    expect(mockClient.uploadFile).toHaveBeenCalledWith(mockFile);
  });

  it('should reject missing file', async () => {
    const emptyFormData = new FormData();

    const result = await uploadFileToDify(emptyFormData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('请选择要上传的文件');
    expect(mockClient.uploadFile).not.toHaveBeenCalled();
  });

  it('should reject non-image file', async () => {
    const textFile = new File(['text'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', textFile);

    const result = await uploadFileToDify(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('只支持上传图片文件');
    expect(mockClient.uploadFile).not.toHaveBeenCalled();
  });

  it('should reject file exceeding size limit', async () => {
    const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
    const largeFile = new File([largeContent], 'large.png', {
      type: 'image/png',
    });
    const formData = new FormData();
    formData.append('file', largeFile);

    const result = await uploadFileToDify(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('图片大小不能超过 10MB');
    expect(mockClient.uploadFile).not.toHaveBeenCalled();
  });

  it('should accept file at size limit boundary', async () => {
    const maxContent = new Array(10 * 1024 * 1024).fill('a').join('');
    const maxFile = new File([maxContent], 'max.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', maxFile);

    mockClient.uploadFile.mockResolvedValue({
      success: true,
      fileId: 'file-456',
    });

    const result = await uploadFileToDify(formData);

    expect(result.success).toBe(true);
    expect(mockClient.uploadFile).toHaveBeenCalled();
  });

  it('should handle upload client failure', async () => {
    mockClient.uploadFile.mockResolvedValue({
      success: false,
      message: '文件上传失败',
    });

    const result = await uploadFileToDify(mockFormData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('文件上传失败');
  });

  it('should handle upload client error', async () => {
    // Suppress expected console.error output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockClient.uploadFile.mockRejectedValue(new Error('Network error'));

    const result = await uploadFileToDify(mockFormData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network error');
    
    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should handle unknown error', async () => {
    // Suppress expected console.error output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockClient.uploadFile.mockRejectedValue('Unknown error');

    const result = await uploadFileToDify(mockFormData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('文件上传失败，请稍后再试');
    
    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should accept various image types', async () => {
    const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

    for (const type of imageTypes) {
      const file = new File(['content'], `test.${type.split('/')[1]}`, {
        type,
      });
      const formData = new FormData();
      formData.append('file', file);

      mockClient.uploadFile.mockResolvedValue({
        success: true,
        fileId: 'file-123',
      });

      const result = await uploadFileToDify(formData);
      expect(result.success).toBe(true);
    }
  });
});
