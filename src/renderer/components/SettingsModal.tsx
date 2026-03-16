import { useState } from 'react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

export function SettingsModal({ isOpen, onClose, onSave, currentApiKey }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ 设置</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>通义千问 API Key</label>
            <input
              type="password"
              className="api-key-input"
              placeholder="sk-xxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="hint">
              💡 没有 API Key？没关系！我们会使用本地模拟对话演示完整流程。
              <br />
              如需真实 AI 对话，请前往 <a href="https://dashscope.aliyun.com/" target="_blank" rel="noopener noreferrer">通义千问开放平台</a> 获取。
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
