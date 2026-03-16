/**
 * OCR 服务接口
 * 通过当前活跃 Provider 的 Vision 模型识别图片中的数学题
 */
export interface IOCRService {
  recognize(imageBase64: string): Promise<OCRResult>;
}

export interface OCRResult {
  text: string;
  confidence: number;
}
