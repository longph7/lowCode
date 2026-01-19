import React, { useState, useCallback } from 'react';
import { Card, Button, Space, Tag, List, Progress, Empty, message } from 'antd';
import { 
    RobotOutlined, 
    PlayCircleOutlined, 
    CheckCircleOutlined,
    SyncOutlined,
    EyeOutlined
} from '@ant-design/icons';
import type { CommonComponentProps } from '../../stores/interface';

interface PreAnnotationProps extends CommonComponentProps {
    title?: string;
    autoStart?: boolean;
}

interface DetectionResult {
    id: number;
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
}

export default function PreAnnotation({
    id,
    title = 'AI 预标注',
    autoStart = false,
    style,
    className
}: PreAnnotationProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<DetectionResult[]>([]);
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

    // 模拟 AI 预标注处理
    const handleStartAnnotation = useCallback(() => {
        setIsProcessing(true);
        setStatus('processing');
        setProgress(0);
        setResults([]);

        // 模拟处理进度
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsProcessing(false);
                    setStatus('completed');
                    
                    // 模拟检测结果
                    setResults([
                        { id: 1, label: '人物', confidence: 0.95, bbox: [100, 100, 200, 300] },
                        { id: 2, label: '车辆', confidence: 0.88, bbox: [300, 150, 450, 280] },
                        { id: 3, label: '建筑', confidence: 0.92, bbox: [500, 50, 700, 400] }
                    ]);
                    
                    message.success('AI 预标注完成！');
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    }, []);

    const handleReset = useCallback(() => {
        setStatus('idle');
        setProgress(0);
        setResults([]);
    }, []);

    const getStatusTag = () => {
        switch (status) {
            case 'idle':
                return <Tag color="default">待处理</Tag>;
            case 'processing':
                return <Tag color="processing" icon={<SyncOutlined spin />}>处理中</Tag>;
            case 'completed':
                return <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>;
        }
    };

    const baseStyles: React.CSSProperties = {
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        minHeight: '300px',
        ...style
    };

    return (
        <div
            data-component-id={id}
            style={baseStyles}
            className={className}
        >
            <Card
                title={
                    <Space>
                        <RobotOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                        <span>{title}</span>
                        {getStatusTag()}
                    </Space>
                }
                bordered={false}
                extra={
                    <Space>
                        {status === 'idle' && (
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={handleStartAnnotation}
                            >
                                开始预标注
                            </Button>
                        )}
                        {status === 'completed' && (
                            <Button
                                icon={<SyncOutlined />}
                                onClick={handleReset}
                            >
                                重新标注
                            </Button>
                        )}
                    </Space>
                }
            >
                {status === 'processing' && (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Progress
                            type="circle"
                            percent={progress}
                            status="active"
                        />
                        <p style={{ marginTop: 20, color: '#666' }}>
                            AI 正在分析图像，请稍候...
                        </p>
                    </div>
                )}

                {status === 'idle' && (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="点击开始按钮进行 AI 预标注"
                    />
                )}

                {status === 'completed' && results.length > 0 && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <Tag color="blue">检测到 {results.length} 个目标</Tag>
                        </div>
                        <List
                            size="small"
                            dataSource={results}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button 
                                            type="link" 
                                            icon={<EyeOutlined />}
                                            size="small"
                                        >
                                            查看
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Tag color="cyan">{item.label}</Tag>
                                                <span style={{ fontSize: 12, color: '#666' }}>
                                                    置信度: {(item.confidence * 100).toFixed(1)}%
                                                </span>
                                            </Space>
                                        }
                                        description={
                                            <span style={{ fontSize: 12 }}>
                                                坐标: [{item.bbox.join(', ')}]
                                            </span>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}