import { useState, useCallback, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    InputNumber,
    Button,
    Switch,
    Slider,
    Space,
    Row,
    Col,
    Divider,
    message
} from 'antd';
import {
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined
} from '@ant-design/icons';
import OptimizedColorPicker from '../components/OptimizedColorPicker';
import { useComponentsStore } from '../stores/new-components';
import { useShallow } from 'zustand/react/shallow';
import { useStyleChangeDetection } from '../hooks/useStyleChangeDetection';
import type { Color } from 'antd/es/color-picker';

const { Option } = Select;

// 单位选项
const UNIT_OPTIONS = ['px', '%', 'vw', 'vh', 'em', 'rem'];

// 字体选项
const FONT_FAMILY_OPTIONS = [
    'Arial, sans-serif',
    'Helvetica, sans-serif', 
    'Times New Roman, serif',
    'Georgia, serif',
    'Verdana, sans-serif',
    'Microsoft YaHei, sans-serif',
    'SimSun, serif',
    'monospace'
];

// 字重选项
const FONT_WEIGHT_OPTIONS = [
    { label: '细体', value: '300' },
    { label: '正常', value: '400' },
    { label: '中等', value: '500' },
    { label: '粗体', value: '600' },
    { label: '特粗', value: '700' }
];

// 边框样式选项
const BORDER_STYLE_OPTIONS = [
    { label: '实线', value: 'solid' },
    { label: '虚线', value: 'dashed' },
    { label: '点线', value: 'dotted' },
    { label: '双线', value: 'double' },
    { label: '无边框', value: 'none' }
];

export default function ComponentStyle() {
    const { curNode, updateNode, updateNodeThrottled } = useComponentsStore(
        useShallow((state) => ({
            curNode: state.curNode,
            updateNode: state.updateNode,
            updateNodeThrottled: state.updateNodeThrottled
        }))
    );

    // 样式变化检测Hook
    const { createStyleUpdateFn, resetStyleCache } = useStyleChangeDetection();

    // 文字对齐状态
    const [textAlign, setTextAlign] = useState<string>('left');
    // 阴影开关状态
    const [shadowEnabled, setShadowEnabled] = useState<boolean>(false);
    // 边距统一设置状态
    const [paddingUnified, setPaddingUnified] = useState<boolean>(true);

    // 当组件切换时重置样式缓存
    useEffect(() => {
        resetStyleCache();
    }, [curNode?.id, resetStyleCache]);

    // 获取当前组件样式
    const getCurrentStyle = useCallback(() => {
        if (!curNode) return {};
        return curNode.props?.style || {};
    }, [curNode]);

    // 更新组件样式
    const updateStyle = useCallback((newStyle: Record<string, any>) => {
        if (!curNode) {
            message.warning('请先选择一个组件');
            return;
        }

        const currentProps = curNode.props || {};
        const currentStyle = currentProps.style || {};

        const updatedProps = {
            ...currentProps,
            style: {
                ...currentStyle,
                ...newStyle
            }
        };

        updateNode(curNode.id, { props: updatedProps });
        message.success('样式已更新');
    }, [curNode, updateNode]);

    // 节流版本的样式更新（用于拖拽等连续操作）- 带样式变化检测
    const updateStyleThrottled = useCallback(
        createStyleUpdateFn((newStyle: Record<string, any>) => {
            if (!curNode) {
                return;
            }

            const currentStyle = getCurrentStyle();
            const updatedProps = {
                ...curNode.props,
                style: {
                    ...currentStyle,
                    ...newStyle
                }
            };

            // 使用节流版本，不显示成功提示
            updateNodeThrottled(curNode.id, { props: updatedProps });
        }),
        [curNode, updateNodeThrottled, getCurrentStyle, createStyleUpdateFn]
    );

    // 解析尺寸值（如 "100px" -> {value: 100, unit: "px"}）
    const parseSizeValue = useCallback((value: string | undefined) => {
        if (!value) return { value: '', unit: 'px' };
        const match = value.toString().match(/^(\d*\.?\d*)(.*)$/);
        return {
            value: match?.[1] || '',
            unit: match?.[2] || 'px'
        };
    }, []);

    // 生成尺寸值字符串
    const generateSizeValue = useCallback((value: string | number, unit: string) => {
        if (!value) return '';
        return `${value}${unit}`;
    }, []);

    // 处理宽度变化
    const handleWidthChange = useCallback((value: string, unit: string) => {
        const sizeValue = generateSizeValue(value, unit);
        updateStyle({ width: sizeValue });
    }, [generateSizeValue, updateStyle]);

    // 处理高度变化
    const handleHeightChange = useCallback((value: string, unit: string) => {
        const sizeValue = generateSizeValue(value, unit);
        updateStyle({ height: sizeValue });
    }, [generateSizeValue, updateStyle]);

    // 处理背景色变化
    const handleBackgroundColorChange = useCallback((color: Color) => {
        updateStyle({ backgroundColor: color.toHexString() });
    }, [updateStyle]);

    // 通用样式处理函数
    const handleStyleChange = useCallback((property: string, value: any) => {
        updateStyle({ [property]: value });
    }, [updateStyle]);

    // 处理圆角变化
    void handleBackgroundColorChange;
    void handleStyleChange;

    const handleBorderRadiusChange = useCallback((value: number | null) => {
        updateStyle({ borderRadius: value ? `${value}px` : '' });
    }, [updateStyle]);

    // 处理边距变化
    const handlePaddingChange = useCallback((type: string, value: number | null) => {
        const currentStyle = getCurrentStyle();
        let paddingValue;
        
        if (paddingUnified) {
            // 统一设置
            paddingValue = value ? `${value}px` : '';
        } else {
            // 分别设置
            const paddingTop = type === 'top' ? (value ? `${value}px` : '0') : (currentStyle.paddingTop || '0');
            const paddingRight = type === 'right' ? (value ? `${value}px` : '0') : (currentStyle.paddingRight || '0');
            const paddingBottom = type === 'bottom' ? (value ? `${value}px` : '0') : (currentStyle.paddingBottom || '0');
            const paddingLeft = type === 'left' ? (value ? `${value}px` : '0') : (currentStyle.paddingLeft || '0');
            
            updateStyle({
                paddingTop,
                paddingRight,
                paddingBottom,
                paddingLeft,
                padding: undefined // 清除统一padding
            });
            return;
        }
        
        updateStyle({ padding: paddingValue });
    }, [paddingUnified, getCurrentStyle, updateStyle]);

    // 处理字体变化
    const handleFontChange = useCallback((property: string, value: any) => {
        updateStyle({ [property]: value });
    }, [updateStyle]);

    // 处理文字对齐
    const handleTextAlignChange = useCallback((align: string) => {
        setTextAlign(align);
        updateStyle({ textAlign: align });
    }, [updateStyle]);

    // 处理阴影变化
    const handleShadowChange = useCallback((enabled: boolean) => {
        setShadowEnabled(enabled);
        const shadowValue = enabled ? '0 2px 8px rgba(0,0,0,0.15)' : 'none';
        updateStyle({ boxShadow: shadowValue });
    }, [updateStyle]);

    // 处理透明度变化
    const handleOpacityChange = useCallback((value: number) => {
        updateStyle({ opacity: value });
    }, [updateStyle]);

    // 处理边框变化
    const handleBorderChange = useCallback((property: string, value: any) => {
        const currentStyle = getCurrentStyle();
        const borderColor = property === 'borderColor' ? value : (currentStyle.borderColor || '#d9d9d9');
        const borderWidth = property === 'borderWidth' ? `${value}px` : (currentStyle.borderWidth || '1px');
        const borderStyle = property === 'borderStyle' ? value : (currentStyle.borderStyle || 'solid');
        
        updateStyle({
            borderColor,
            borderWidth,
            borderStyle,
            border: `${borderWidth} ${borderStyle} ${borderColor}`
        });
    }, [getCurrentStyle, updateStyle]);

    if (!curNode) {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                请选择一个组件查看样式设置
            </div>
        );
    }

    const currentStyle = getCurrentStyle();
    const widthParsed = parseSizeValue(currentStyle.width);
    const heightParsed = parseSizeValue(currentStyle.height);

    return (
        <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', padding: '16px' }}>
            <Form layout="vertical" size="small">
                {/* 组件信息 */}
                <div style={{
                    marginBottom: '16px',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                }}>
                    <strong>正在编辑：</strong> {curNode.type}
                </div>

                {/* 尺寸设置 */}
                <Divider orientation="left" orientationMargin="0">尺寸</Divider>
                
                {/* 宽度 */}
                <Form.Item label="宽度">
                    <Input.Group compact>
                        <Input 
                            style={{ width: '70%' }}
                            placeholder="100"
                            value={widthParsed.value}
                            onChange={(e) => handleWidthChange(e.target.value, widthParsed.unit)}
                        />
                        <Select 
                            style={{ width: '30%' }}
                            value={widthParsed.unit}
                            onChange={(unit) => handleWidthChange(widthParsed.value, unit)}
                        >
                            {UNIT_OPTIONS.map(unit => (
                                <Option key={unit} value={unit}>{unit}</Option>
                            ))}
                        </Select>
                    </Input.Group>
                </Form.Item>

                {/* 高度 */}
                <Form.Item label="高度">
                    <Input.Group compact>
                        <Input 
                            style={{ width: '70%' }}
                            placeholder="100"
                            value={heightParsed.value}
                            onChange={(e) => handleHeightChange(e.target.value, heightParsed.unit)}
                        />
                        <Select 
                            style={{ width: '30%' }}
                            value={heightParsed.unit}
                            onChange={(unit) => handleHeightChange(heightParsed.value, unit)}
                        >
                            {UNIT_OPTIONS.map(unit => (
                                <Option key={unit} value={unit}>{unit}</Option>
                            ))}
                        </Select>
                    </Input.Group>
                </Form.Item>

                {/* 外观样式 */}
                <Divider orientation="left" orientationMargin="0">外观</Divider>
                
                {/* 背景色 */}
                <Form.Item label="背景色">
                    <OptimizedColorPicker 
                        value={currentStyle.backgroundColor || '#ffffff'}
                        onChange={(color: string) => updateStyle({ backgroundColor: color })}
                        onChangeThrottled={(color: string) => updateStyleThrottled({ backgroundColor: color })}
                        showText
                        throttleDelay={100}
                    />
                </Form.Item>

                {/* 圆角 */}
                <Form.Item label="圆角">
                    <InputNumber 
                        style={{ width: '100%' }}
                        placeholder="8"
                        addonAfter="px"
                        min={0}
                        value={currentStyle.borderRadius ? parseInt(currentStyle.borderRadius) : undefined}
                        onChange={handleBorderRadiusChange}
                    />
                </Form.Item>

                {/* 边距 */}
                <Form.Item label="边距">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <Switch 
                                size="small"
                                checked={paddingUnified}
                                onChange={setPaddingUnified}
                            /> 统一设置
                        </div>
                        {paddingUnified ? (
                            <InputNumber 
                                style={{ width: '100%' }}
                                placeholder="8"
                                addonAfter="px"
                                min={0}
                                value={currentStyle.padding ? parseInt(currentStyle.padding) : undefined}
                                onChange={(value) => handlePaddingChange('all', value)}
                            />
                        ) : (
                            <Row gutter={8}>
                                <Col span={12}>
                                    <InputNumber 
                                        placeholder="上"
                                        addonAfter="px"
                                        min={0}
                                        style={{ width: '100%' }}
                                        value={currentStyle.paddingTop ? parseInt(currentStyle.paddingTop) : undefined}
                                        onChange={(value) => handlePaddingChange('top', value)}
                                    />
                                </Col>
                                <Col span={12}>
                                    <InputNumber 
                                        placeholder="右"
                                        addonAfter="px"
                                        min={0}
                                        style={{ width: '100%' }}
                                        value={currentStyle.paddingRight ? parseInt(currentStyle.paddingRight) : undefined}
                                        onChange={(value) => handlePaddingChange('right', value)}
                                    />
                                </Col>
                                <Col span={12}>
                                    <InputNumber 
                                        placeholder="下"
                                        addonAfter="px"
                                        min={0}
                                        style={{ width: '100%' }}
                                        value={currentStyle.paddingBottom ? parseInt(currentStyle.paddingBottom) : undefined}
                                        onChange={(value) => handlePaddingChange('bottom', value)}
                                    />
                                </Col>
                                <Col span={12}>
                                    <InputNumber 
                                        placeholder="左"
                                        addonAfter="px"
                                        min={0}
                                        style={{ width: '100%' }}
                                        value={currentStyle.paddingLeft ? parseInt(currentStyle.paddingLeft) : undefined}
                                        onChange={(value) => handlePaddingChange('left', value)}
                                    />
                                </Col>
                            </Row>
                        )}
                    </Space>
                </Form.Item>

                {/* 字体设置 */}
                <Divider orientation="left" orientationMargin="0">字体</Divider>
                
                {/* 字体大小 */}
                <Form.Item label="字体大小">
                    <InputNumber 
                        style={{ width: '100%' }}
                        placeholder="14"
                        addonAfter="px"
                        min={8}
                        max={72}
                        value={currentStyle.fontSize ? parseInt(currentStyle.fontSize) : undefined}
                        onChange={(value) => handleFontChange('fontSize', value ? `${value}px` : undefined)}
                    />
                </Form.Item>

                {/* 字体族 */}
                <Form.Item label="字体族">
                    <Select 
                        style={{ width: '100%' }}
                        placeholder="选择字体"
                        value={currentStyle.fontFamily}
                        onChange={(value) => handleFontChange('fontFamily', value)}
                    >
                        {FONT_FAMILY_OPTIONS.map(font => (
                            <Option key={font} value={font}>{font.split(',')[0]}</Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* 字重 */}
                <Form.Item label="字重">
                    <Select 
                        style={{ width: '100%' }}
                        placeholder="选择字重"
                        value={currentStyle.fontWeight}
                        onChange={(value) => handleFontChange('fontWeight', value)}
                    >
                        {FONT_WEIGHT_OPTIONS.map(weight => (
                            <Option key={weight.value} value={weight.value}>{weight.label}</Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* 文字对齐 */}
                <Form.Item label="文字对齐">
                    <Button.Group style={{ width: '100%' }}>
                        <Button 
                            type={textAlign === 'left' ? 'primary' : 'default'}
                            icon={<AlignLeftOutlined />}
                            onClick={() => handleTextAlignChange('left')}
                            style={{ width: '33.33%' }}
                        />
                        <Button 
                            type={textAlign === 'center' ? 'primary' : 'default'}
                            icon={<AlignCenterOutlined />}
                            onClick={() => handleTextAlignChange('center')}
                            style={{ width: '33.33%' }}
                        />
                        <Button 
                            type={textAlign === 'right' ? 'primary' : 'default'}
                            icon={<AlignRightOutlined />}
                            onClick={() => handleTextAlignChange('right')}
                            style={{ width: '33.33%' }}
                        />
                    </Button.Group>
                </Form.Item>

                {/* 特效设置 */}
                <Divider orientation="left" orientationMargin="0">特效</Divider>
                
                {/* 阴影 */}
                <Form.Item label="阴影">
                    <Space>
                        <Switch 
                            checked={shadowEnabled}
                            onChange={handleShadowChange}
                        />
                        <span style={{ color: '#999', fontSize: '12px' }}>
                            {shadowEnabled ? '0 2px 8px rgba(0,0,0,0.15)' : '无阴影'}
                        </span>
                    </Space>
                </Form.Item>

                {/* 透明度 */}
                <Form.Item label="透明度">
                    <Slider 
                        min={0}
                        max={1}
                        step={0.1}
                        value={currentStyle.opacity || 1}
                        onChange={handleOpacityChange}
                        marks={{
                            0: '0',
                            0.5: '0.5',
                            1: '1'
                        }}
                    />
                </Form.Item>

                {/* 边框设置 */}
                <Divider orientation="left" orientationMargin="0">边框</Divider>
                
                {/* 边框颜色 */}
                <Form.Item label="边框颜色">
                    <OptimizedColorPicker 
                        value={currentStyle.borderColor || '#d9d9d9'}
                        onChange={(color: string) => handleBorderChange('borderColor', color)}
                        onChangeThrottled={(color: string) => updateStyleThrottled({ borderColor: color })}
                        showText
                        throttleDelay={100}
                    />
                </Form.Item>

                {/* 边框粗细 */}
                <Form.Item label="边框粗细">
                    <InputNumber 
                        style={{ width: '100%' }}
                        placeholder="1"
                        addonAfter="px"
                        min={0}
                        max={20}
                        value={currentStyle.borderWidth ? parseInt(currentStyle.borderWidth) : undefined}
                        onChange={(value) => handleBorderChange('borderWidth', value)}
                    />
                </Form.Item>

                {/* 边框样式 */}
                <Form.Item label="边框样式">
                    <Select 
                        style={{ width: '100%' }}
                        placeholder="选择边框样式"
                        value={currentStyle.borderStyle || 'solid'}
                        onChange={(value) => handleBorderChange('borderStyle', value)}
                    >
                        {BORDER_STYLE_OPTIONS.map(style => (
                            <Option key={style.value} value={style.value}>{style.label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </div>
    );
}
