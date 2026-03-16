import { IOCRService } from './IOCRService';
import { OpenAIVisionService } from './OpenAIVisionService';
import { ClaudeVisionService } from './ClaudeVisionService';
import { QwenVisionService } from './QwenVisionService';
import { ProviderType } from '../../store/configStore';

export function createOCRService(provider: ProviderType, apiKey: string, model: string, baseURL?: string): IOCRService | null {
  switch (provider) {
    case 'openai':
      return new OpenAIVisionService(apiKey, baseURL || 'https://api.openai.com/v1', model);
    case 'claude':
      return new ClaudeVisionService(apiKey, model);
    case 'qwen':
      return new QwenVisionService(apiKey, model);
    case 'custom':
      if (baseURL) return new OpenAIVisionService(apiKey, baseURL, model);
      return null;
    default:
      return null;
  }
}

/**
 * Convert a File object to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
