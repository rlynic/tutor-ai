/**
 * Phase 8 测试：OCR Factory
 */
import { describe, it, expect } from 'vitest';
import { createOCRService } from '../renderer/core/ocr/OCRFactory';
import { OpenAIVisionService } from '../renderer/core/ocr/OpenAIVisionService';
import { ClaudeVisionService } from '../renderer/core/ocr/ClaudeVisionService';
import { QwenVisionService } from '../renderer/core/ocr/QwenVisionService';

describe('createOCRService()', () => {
  it('openai provider → OpenAIVisionService', () => {
    const svc = createOCRService('openai', 'sk-test', 'gpt-4o');
    expect(svc).toBeInstanceOf(OpenAIVisionService);
  });

  it('claude provider → ClaudeVisionService', () => {
    const svc = createOCRService('claude', 'sk-ant-test', 'claude-3-5-sonnet-20241022');
    expect(svc).toBeInstanceOf(ClaudeVisionService);
  });

  it('qwen provider → QwenVisionService', () => {
    const svc = createOCRService('qwen', 'qwen-test', 'qwen-vl-plus');
    expect(svc).toBeInstanceOf(QwenVisionService);
  });

  it('custom provider 有 baseURL → OpenAIVisionService', () => {
    const svc = createOCRService('custom', 'test', 'my-model', 'https://my.api/v1');
    expect(svc).toBeInstanceOf(OpenAIVisionService);
  });

  it('custom provider 无 baseURL → null', () => {
    const svc = createOCRService('custom', 'test', 'my-model');
    expect(svc).toBeNull();
  });
});
