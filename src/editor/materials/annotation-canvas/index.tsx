import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button, Space, Select, ColorPicker, InputNumber, Tag, message } from 'antd';
import {
    BorderOutlined,
    DeleteOutlined,
    SaveOutlined,
    UndoOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from '@ant-design/icons';
import type { CommonComponentProps } from '../../stores/interface';

interface AnnotationCanvasProps extends CommonComponentProps {
    title?: string;
    imageUrl?: string;
    width?: number;
    height?: number;
}

interface Annotation {
    id: number;
    type: 'rect' | 'circle' | 'polygon';
    label: string;
    color: string;
    points: number[];
}

export default function AnnotationCanvas({
    id,
    title = '标注画布',
    imageUrl = 'https://via.placeholder.com/800x600?text=待标注图像',
    width = 800,
    height = 600,
    style,
    className
}: AnnotationCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [currentTool, setCurrentTool] = useState<'rect' | 'circle' | 'polygon'>('rect');
    const [currentColor, setCurrentColor] = useState<string>('#1677ff');
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(100);

    // 绘制所有标注
    const drawAnnotations = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景图
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 绘制所有标注
            annotations.forEach((annotation) => {
                ctx.strokeStyle = annotation.color;
                ctx.lineWidth = 2;
                ctx.fillStyle = annotation.color + '30'; // 30% 透明度

                if (annotation.type === 'rect' && annotation.points.length === 4) {
                    const [x1, y1, x2, y2] = annotation.points;
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
                    
                    // 绘制标签
                    ctx.fillStyle = annotation.color;
                    ctx.fillRect(x1, y1 - 20, 80, 20);
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px Arial';
                    ctx.fillText(annotation.label, x1 + 5, y1 - 6);
                }
            });
        };
    }, [annotations, imageUrl]);

    useEffect(() => {
        drawAnnotations();
    }, [drawAnnotations]);

    // 处理鼠标按下
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setStartPoint({ x, y });
    }, []);

    // 处理鼠标移动
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPoint) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 重绘画布
        drawAnnotations();

        // 绘制当前标注
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        if (currentTool === 'rect') {
            ctx.strokeRect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y);
        }

        ctx.setLineDash([]);
    }, [isDrawing, startPoint, currentColor, currentTool, drawAnnotations]);

    // 处理鼠标松开
    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPoint) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 创建新标注
        const newAnnotation: Annotation = {
            id: Date.now(),
            type: currentTool,
            label: `标注${annotations.length + 1}`,
            color: currentColor,
            points: [startPoint.x, startPoint.y, x, y]
        };

        setAnnotations([...annotations, newAnnotation]);
        setIsDrawing(false);
        setStartPoint(null);
        
        message.success('标注添加成功');
    }, [isDrawing, startPoint, currentTool, currentColor, annotations]);

    const handleUndo = useCallback(() => {
        if (annotations.length > 0) {
            setAnnotations(annotations.slice(0, -1));
            message.info('已撤销上一步操作');
        }
    }, [annotations]);

    const handleClear = useCallback(() => {
        setAnnotations([]);
        message.info('已清空所有标注');
    }, []);

    const handleSave = useCallback(() => {
        console.log('保存标注数据:', annotations);
        message.success(`已保存 ${annotations.length} 个标注`);
    }, [annotations]);

    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(prev + 10, 200));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => Math.max(prev - 10, 50));
    }, []);

    const baseStyles: React.CSSProperties = {
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
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
                        <BorderOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                        <span>{title}</span>
                        <Tag color="blue">{annotations.length} 个标注</Tag>
                    </Space>
                }
                extra={
                    <Space wrap>
                        <Select
                            value={currentTool}
                            onChange={setCurrentTool}
                            style={{ width: 120 }}
                            options={[
                                { label: '矩形', value: 'rect' },
                                { label: '圆形', value: 'circle' },
                                { label: '多边形', value: 'polygon' }
                            ]}
                        />
                        <ColorPicker
                            value={currentColor}
                            onChange={(color) => setCurrentColor(color.toHexString())}
                        />
                        <Button
                            icon={<ZoomOutOutlined />}
                            onClick={handleZoomOut}
                            disabled={zoom <= 50}
                        />
                        <InputNumber
                            value={zoom}
                            formatter={(value) => `${value}%`}
                            style={{ width: 80 }}
                            readOnly
                        />
                        <Button
                            icon={<ZoomInOutlined />}
                            onClick={handleZoomIn}
                            disabled={zoom >= 200}
                        />
                        <Button
                            icon={<UndoOutlined />}
                            onClick={handleUndo}
                            disabled={annotations.length === 0}
                        >
                            撤销
                        </Button>
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={handleClear}
                            disabled={annotations.length === 0}
                            danger
                        >
                            清空
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                        >
                            保存标注
                        </Button>
                    </Space>
                }
            >
                <div style={{ 
                    textAlign: 'center', 
                    overflow: 'auto',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    padding: '20px'
                }}>
                    <canvas
                        ref={canvasRef}
                        width={width}
                        height={height}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        style={{
                            border: '2px solid #1677ff',
                            borderRadius: '4px',
                            cursor: 'crosshair',
                            backgroundColor: '#fff',
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'center',
                            transition: 'transform 0.2s ease'
                        }}
                    />
                </div>

                <div style={{ marginTop: 16, fontSize: 12, color: '#666', textAlign: 'center' }}>
                    💡 提示: 在画布上按住鼠标左键拖动可以创建标注框
                </div>
            </Card>
        </div>
    );
}