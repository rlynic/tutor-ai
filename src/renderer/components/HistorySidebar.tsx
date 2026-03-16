import React, { useEffect, useState } from 'react';
import { useSessionStore, SessionSummary } from '../store/sessionStore';
import { KnowledgePoint } from '../core/knowledge/KnowledgeService';

interface HistorySidebarProps {
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ onClose }) => {
  const { sessions, setSessions, removeSession } = useSessionStore();
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'knowledge'>('history');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAllSessions().then((data) => {
        setSessions(data);
      });
      window.electronAPI.getAllKnowledgePoints().then((data) => {
        setKnowledgePoints(data as KnowledgePoint[]);
      });
    }
  }, [setSessions]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条学习记录？')) return;
    if (window.electronAPI) {
      await window.electronAPI.deleteSession(id);
    }
    removeSession(id);
  };

  const masteryColor = (level: number) => {
    if (level >= 80) return '#4caf50';
    if (level >= 60) return '#ff9800';
    return '#f44336';
  };

  const masteryLabel = (level: number) => {
    if (level >= 80) return '掌握';
    if (level >= 60) return '熟悉';
    return '薄弱';
  };

  return (
    <div className="history-sidebar">
      {/* Header — matches main title-bar height and style */}
      <div className="history-sidebar-header">
        <div className="history-sidebar-title">📚 学习中心</div>
        <button onClick={onClose} className="history-sidebar-close">✕</button>
      </div>

      {/* Tabs */}
      <div className="history-sidebar-tabs">
        {(['history', 'knowledge'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`history-tab-btn${activeTab === tab ? ' history-tab-btn--active' : ''}`}
          >
            {tab === 'history' ? '📖 历史记录' : '🧠 知识掌握'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="history-sidebar-content">
        {activeTab === 'history' && (
          sessions.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">📝</div>
              暂无学习记录
            </div>
          ) : (
            sessions.map((session: SessionSummary) => (
              <div key={session.id} className="history-item">
                <div className="history-item-text">
                  {session.questionText || '无题目'}
                </div>
                <div className="history-item-date">
                  {new Date(session.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
                  className="history-item-delete"
                  title="删除"
                >
                  ×
                </button>
              </div>
            ))
          )
        )}

        {activeTab === 'knowledge' && (
          knowledgePoints.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">🧠</div>
              完成学习后这里会显示<br />知识点掌握情况
            </div>
          ) : (
            knowledgePoints.map(kp => (
              <div key={kp.id} className="knowledge-item">
                <div className="knowledge-item-header">
                  <div className="knowledge-item-concept">{kp.concept}</div>
                  <span
                    className="knowledge-item-badge"
                    style={{ color: masteryColor(kp.mastery_level), background: masteryColor(kp.mastery_level) + '22' }}
                  >
                    {masteryLabel(kp.mastery_level)}
                  </span>
                </div>
                <div className="knowledge-item-topic">{kp.topic}</div>
                <div className="knowledge-progress-bar">
                  <div
                    className="knowledge-progress-fill"
                    style={{ width: `${kp.mastery_level}%`, background: masteryColor(kp.mastery_level) }}
                  />
                </div>
                <div className="knowledge-item-pct">{kp.mastery_level}%</div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
