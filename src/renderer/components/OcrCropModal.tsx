import React, { useRef, useState, useEffect, useCallback } from 'react';

interface Rect { x: number; y: number; w: number; h: number }

interface OcrCropModalProps {
  dataURL: string;       // object URL of original image
  onConfirm: (croppedBase64: string | null) => void; // null = use full image
  onCancel: () => void;
}

/**
 * Image preview modal with optional drag-to-crop selection.
 * User can either confirm the full image or drag a selection rectangle
 * and confirm just that region.
 */
export const OcrCropModal: React.FC<OcrCropModalProps> = ({ dataURL, onConfirm, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const CANVAS_MAX_W = 520;
  const CANVAS_MAX_H = 360;

  // Draw image + selection rect onto canvas
  const draw = useCallback((selection: Rect | null) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (selection && selection.w > 4 && selection.h > 4) {
      // Dim everything outside selection
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, canvas.width, selection.y);
      ctx.fillRect(0, selection.y + selection.h, canvas.width, canvas.height - selection.y - selection.h);
      ctx.fillRect(0, selection.y, selection.x, selection.h);
      ctx.fillRect(selection.x + selection.w, selection.y, canvas.width - selection.x - selection.w, selection.h);
      // Bright border
      ctx.strokeStyle = '#4A90E2';
      ctx.lineWidth = 2;
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      // Corner handles
      const hs = 8;
      ctx.fillStyle = '#4A90E2';
      [[selection.x, selection.y], [selection.x + selection.w, selection.y],
       [selection.x, selection.y + selection.h], [selection.x + selection.w, selection.y + selection.h]]
        .forEach(([hx, hy]) => ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs));
    }
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Scale to fit max size
      const scale = Math.min(CANVAS_MAX_W / img.naturalWidth, CANVAS_MAX_H / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      setImgSize({ w, h });
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
        draw(null);
      }
    };
    img.src = dataURL;
  }, [dataURL, draw]);

  useEffect(() => {
    if (imgSize.w > 0) draw(rect);
  }, [rect, imgSize, draw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    startRef.current = pos;
    setDragging(true);
    setRect(null);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !startRef.current) return;
    const pos = getPos(e);
    const x = Math.min(pos.x, startRef.current.x);
    const y = Math.min(pos.y, startRef.current.y);
    const w = Math.abs(pos.x - startRef.current.x);
    const h = Math.abs(pos.y - startRef.current.y);
    setRect({ x, y, w, h });
  };

  const onMouseUp = () => setDragging(false);

  const cropToBase64 = (): string | null => {
    if (!rect || rect.w < 8 || rect.h < 8) return null;
    const img = imgRef.current!;
    const canvas = canvasRef.current!;
    // Scale factor: original image pixel / canvas display pixel
    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;

    const offscreen = document.createElement('canvas');
    offscreen.width = Math.round(rect.w * scaleX);
    offscreen.height = Math.round(rect.h * scaleY);
    const ctx = offscreen.getContext('2d')!;
    ctx.drawImage(img,
      rect.x * scaleX, rect.y * scaleY, rect.w * scaleX, rect.h * scaleY,
      0, 0, offscreen.width, offscreen.height
    );
    // Return base64 without data: prefix
    return offscreen.toDataURL('image/jpeg', 0.92).split(',')[1];
  };

  const hasSelection = rect && rect.w > 8 && rect.h > 8;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    }}>
      <div style={{
        background: 'var(--bg-sidebar)', borderRadius: 16, padding: 28,
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)', maxWidth: 600, width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>📷 图片预览</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              拖拽选取题目区域，或直接识别整张图片
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>

        {/* Canvas */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, background: 'var(--bg-app)', borderRadius: 8, padding: 8 }}>
          <canvas
            ref={canvasRef}
            style={{ cursor: 'crosshair', maxWidth: '100%', display: 'block', borderRadius: 4 }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(null)}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #4A90E2', background: 'transparent', color: '#4A90E2', cursor: 'pointer', fontWeight: 500 }}
          >
            识别整张图片
          </button>
          <button
            onClick={() => onConfirm(cropToBase64())}
            disabled={!hasSelection}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: hasSelection ? '#4A90E2' : '#ccc', color: '#fff',
              cursor: hasSelection ? 'pointer' : 'not-allowed', fontWeight: 600,
            }}
          >
            识别选区 ✂️
          </button>
        </div>
      </div>
    </div>
  );
};
