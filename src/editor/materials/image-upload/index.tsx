import React, { useState, useCallback } from 'react';
import { Upload, message, Card } from 'antd';
import { InboxOutlined, PictureOutlined } from '@ant-design/icons';
import type { CommonComponentProps } from '../../stores/interface';

const { Dragger } = Upload;

interface ImageUploadProps extends CommonComponentProps {
    maxSize?: number; // 最大文件大小（MB）
    accept?: string; // 接受的文件类型
    multiple?: boolean; // 是否支持多选
    showPreview?: boolean; // 是否显示预览
}

export default function ImageUpload({
    id,
    maxSize = 5,
    accept = 'image/*',
    multiple = false,
    showPreview = true,
    style,
    className
}: ImageUploadProps) {
    const [fileList, setFileList] = useState<any[]>([]);
    const [previewImage, setPreviewImage] = useState<string>('');

    const handleBeforeUpload = useCallback((file: any) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件！');
            return false;
        }

        const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
        if (!isLtMaxSize) {
            message.error(`图片大小不能超过 ${maxSize}MB！`);
            return false;
        }

        // 预览图片
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        return false; // 阻止自动上传
    }, [maxSize]);

    const handleChange = useCallback((info: any) => {
        setFileList(info.fileList);
        
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 文件上传成功`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上传失败`);
        }
    }, []);

    const handleRemove = useCallback(() => {
        setPreviewImage('');
    }, []);

    const baseStyles: React.CSSProperties = {
        padding: '20px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        minHeight: '200px',
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
                    <span>
                        <PictureOutlined style={{ marginRight: 8 }} />
                        图像上传
                    </span>
                }
                bordered={false}
            >
                <Dragger
                    name="file"
                    multiple={multiple}
                    accept={accept}
                    fileList={fileList}
                    beforeUpload={handleBeforeUpload}
                    onChange={handleChange}
                    onRemove={handleRemove}
                    style={{ backgroundColor: '#fff' }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: 48, color: '#1677ff' }} />
                    </p>
                    <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                    <p className="ant-upload-hint">
                        支持单个或批量上传，最大支持 {maxSize}MB
                    </p>
                </Dragger>

                {showPreview && previewImage && (
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <img 
                            src={previewImage} 
                            alt="预览图" 
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '300px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }} 
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}