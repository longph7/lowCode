import React, { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // 更新 state 使下一次渲染能够显示降级UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // 可以将错误日志上报给服务器
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 自定义的错误页面
            return this.props.fallback || (
                <div style={{
                    padding: '20px',
                    border: '1px solid #ff6b6b',
                    borderRadius: '4px',
                    backgroundColor: '#ffe0e0',
                    color: '#d63031',
                    margin: '10px'
                }}>
                    <h3>组件渲染出错</h3>
                    <p>错误信息: {this.state.error?.message}</p>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: undefined })}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#d63031',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        重试
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;