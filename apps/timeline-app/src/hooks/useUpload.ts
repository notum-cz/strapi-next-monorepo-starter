import { useState, useCallback } from 'react';
import { API_ENDPOINTS, UPLOAD_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import { validateUploadFile } from '@/lib/fact-check';
import type { UploadProgress, UploadResult } from '@/lib/types';

/**
 * Hook for handling file uploads with progress tracking
 */
export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (
      file: File,
      stageId: string,
      type: 'gallery' | 'document',
      caption?: string
    ): Promise<UploadResult> => {
      // Validate file
      const validation = validateUploadFile(
        file,
        UPLOAD_CONFIG.allowedTypes,
        UPLOAD_CONFIG.maxFileSize
      );

      if (!validation.valid) {
        setError(validation.issues.join(', '));
        return {
          success: false,
          file_id: '',
          url: '',
          error: validation.issues.join(', '),
        };
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('stage_id', stageId);
        if (caption) formData.append('caption', caption);

        // Determine endpoint
        const endpoint =
          type === 'gallery'
            ? API_ENDPOINTS.upload.gallery(stageId)
            : API_ENDPOINTS.upload.documents(stageId);

        // Upload with progress tracking
        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } else {
              reject(new Error(ERROR_MESSAGES.upload.uploadFailed));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error(ERROR_MESSAGES.upload.networkError));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
          });

          xhr.open('POST', endpoint);
          xhr.send(formData);
        });

        const result = await uploadPromise;

        setUploading(false);
        setProgress(100);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : ERROR_MESSAGES.upload.uploadFailed;
        setError(errorMessage);
        setUploading(false);
        setProgress(0);

        return {
          success: false,
          file_id: '',
          url: '',
          error: errorMessage,
        };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadFile,
    uploading,
    progress,
    error,
    reset,
  };
}

/**
 * Hook for batch file uploads
 */
export function useBatchUpload() {
  const [uploading, setUploading] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [completedFiles, setCompletedFiles] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const { uploadFile } = useUpload();

  const uploadFiles = useCallback(
    async (
      files: File[],
      stageId: string,
      type: 'gallery' | 'document'
    ): Promise<UploadResult[]> => {
      setUploading(true);
      setTotalFiles(files.length);
      setCompletedFiles(0);
      setErrors([]);

      const results: UploadResult[] = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const result = await uploadFile(files[i], stageId, type);
          results.push(result);

          if (!result.success && result.error) {
            setErrors((prev) => [...prev, `${files[i].name}: ${result.error}`]);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          setErrors((prev) => [...prev, `${files[i].name}: ${errorMessage}`]);
        } finally {
          setCompletedFiles((prev) => prev + 1);
        }
      }

      setUploading(false);
      return results;
    },
    [uploadFile]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setTotalFiles(0);
    setCompletedFiles(0);
    setErrors([]);
  }, []);

  return {
    uploadFiles,
    uploading,
    progress: totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0,
    totalFiles,
    completedFiles,
    errors,
    reset,
  };
}
