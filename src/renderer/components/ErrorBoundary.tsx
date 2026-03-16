import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TutorAI] Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#FFF9E6',
        }}>
          <h1 style={{ color: '#E74C3C', marginBottom: '20px' }}>😅 出错了</h1>
          <p style={{ color: '#555', marginBottom: '10px' }}>
            应用遇到了一个问题，请刷新页面重试。
          </p>
          <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', color: '#3498DB' }}>查看错误详情</summary>
            <pre style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
