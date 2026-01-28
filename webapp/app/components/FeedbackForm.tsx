'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { submitFeedback, type FeedbackResponse } from '@/app/actions/feedback';
import { uploadFileToDify } from '@/app/actions/fileUpload';
import { Loader2, X, Upload } from 'lucide-react';

interface FeedbackFormState {
  content: string;
  isLoading: boolean;
  message?: string;
  success?: boolean;
  imageFile?: File;
  imagePreview?: string;
  imageFileId?: string;
  isUploadingImage?: boolean;
}

// 客户端最大长度限制（与服务器端保持一致）
const MAX_LENGTH = 5000;

export function FeedbackForm() {
  const [state, setState] = useState<FeedbackFormState>({
    content: '',
    isLoading: false,
  });
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setState((prev) => ({
        ...prev,
        message: '只支持上传图片文件',
        success: false,
      }));
      return;
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setState((prev) => ({
        ...prev,
        message: '图片大小不能超过 10MB',
        success: false,
      }));
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setState((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result as string,
        imageFileId: undefined, // 重置文件 ID，需要重新上传
        message: undefined,
      }));
    };
    reader.readAsDataURL(file);
  };

  // 移除图片
  const handleRemoveImage = () => {
    setState((prev) => ({
      ...prev,
      imageFile: undefined,
      imagePreview: undefined,
      imageFileId: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 当消息出现时，滚动到按钮位置
  useEffect(() => {
    if (state.message && !state.isLoading && submitButtonRef.current) {
      setTimeout(() => {
        submitButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [state.message, state.isLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 客户端基本验证
    const trimmedContent = state.content.trim();
    if (!trimmedContent) {
      setState((prev) => ({
        ...prev,
        message: '请输入反馈内容',
        success: false,
      }));
      return;
    }

    if (trimmedContent.length > MAX_LENGTH) {
      setState((prev) => ({
        ...prev,
        message: `反馈内容不能超过 ${MAX_LENGTH} 个字符`,
        success: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, message: undefined }));

    try {
      let imageFileId = state.imageFileId;

      // 如果有图片但还没有上传，先上传图片
      if (state.imageFile && !imageFileId) {
        setState((prev) => ({ ...prev, isUploadingImage: true }));
        
        const formData = new FormData();
        formData.append('file', state.imageFile);
        
        const uploadResult = await uploadFileToDify(formData);
        
        if (!uploadResult.success) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isUploadingImage: false,
            message: uploadResult.message || '图片上传失败',
            success: false,
          }));
          return;
        }

        imageFileId = uploadResult.fileId;
        setState((prev) => ({ ...prev, imageFileId, isUploadingImage: false }));
      }

      // 提交反馈
      const result: FeedbackResponse = await submitFeedback(state.content, imageFileId);
      
      console.log('=== 前端收到响应 ===');
      console.log('成功状态:', result.success);
      console.log('消息内容:', result.message);
      console.log('图片文件 ID:', imageFileId);
      console.log('=== 前端响应结束 ===');
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        message: result.message || '反馈已提交', // 确保有消息显示
        success: result.success,
        // 不清空表单，保留用户输入的内容和图片
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isUploadingImage: false,
        message: '提交失败，请稍后再试',
        success: false,
      }));
    }
  };

  const remainingChars = MAX_LENGTH - state.content.length;
  const isNearLimit = remainingChars < 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardDescription>
          请分享您的功能增强建议、程序错误或提问<br/>我们会认真对待每一条反馈
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-content">反馈内容</Label>
            <Textarea
              id="feedback-content"
              placeholder="请输入您的反馈内容..."
              value={state.content}
              onChange={(e) =>
                setState((prev) => ({ ...prev, content: e.target.value }))
              }
              disabled={state.isLoading}
              rows={12}
              className={`resize-none min-h-[200px] sm:min-h-[250px] ${
                state.isLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              maxLength={MAX_LENGTH}
              aria-invalid={state.message && !state.success ? true : undefined}
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                最多 {MAX_LENGTH} 个字符
              </span>
              <span
                className={
                  isNearLimit
                    ? 'text-destructive font-medium'
                    : 'text-muted-foreground'
                }
              >
                剩余 {remainingChars} 字符
              </span>
            </div>
          </div>

          {/* 图片上传区域 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-image">上传图片（可选）</Label>
            {!state.imagePreview ? (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="feedback-image"
                  className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    state.isLoading || state.isUploadingImage
                      ? 'border-muted-foreground/50 cursor-not-allowed opacity-50'
                      : 'border-muted-foreground hover:border-primary'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center py-2">
                    <Upload className="w-5 h-5 mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">点击上传</span> 或拖拽图片（最大 10MB）
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="feedback-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={state.isLoading || state.isUploadingImage}
                  />
                </label>
              </div>
            ) : (
              <div className="relative">
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                  <img
                    src={state.imagePreview}
                    alt="预览"
                    className="w-full h-full object-contain bg-muted"
                  />
                  {state.isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={handleRemoveImage}
                  disabled={state.isLoading || state.isUploadingImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {state.message && (
            <div
              className={`p-3 rounded-md text-sm ${
                state.success
                  ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border border-red-200 dark:border-red-800'
              }`}
              role="alert"
            >
              {state.message}
            </div>
          )}

          <Button
            ref={submitButtonRef}
            type="submit"
            disabled={state.isLoading || state.isUploadingImage || !state.content.trim()}
            className="w-full"
            size="lg"
          >
            {state.isLoading || state.isUploadingImage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {state.isUploadingImage ? '上传图片中...' : '提交中...'}
              </>
            ) : (
              '提交反馈'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
