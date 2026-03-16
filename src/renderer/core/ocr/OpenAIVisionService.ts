import { IOCRService, OCRResult } from './IOCRService';

export class OpenAIVisionService implements IOCRService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(apiKey: string, baseURL = 'https://api.openai.com/v1', model = 'gpt-4o') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = model;
  }

  async recognize(imageBase64: string): Promise<OCRResult> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
              {
                type: 'text',
                text: '请识别这张图片中的数学题目，只输出题目文字，不要解答。如果图片中没有数学题，输出"未识别到数学题"。',
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || '';
    return { text: text.trim(), confidence: 0.9 };
  }
}
