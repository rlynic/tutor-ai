import Anthropic from '@anthropic-ai/sdk';
import { IOCRService, OCRResult } from './IOCRService';

export class ClaudeVisionService implements IOCRService {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    this.model = model;
  }

  async recognize(imageBase64: string): Promise<OCRResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: '请识别这张图片中的数学题目，只输出题目文字，不要解答。如果图片中没有数学题，输出"未识别到数学题"。',
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return { text: text.trim(), confidence: 0.9 };
  }
}
