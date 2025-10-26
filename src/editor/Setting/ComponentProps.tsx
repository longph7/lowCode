import { Form, Input, InputNumber, Select, Switch, message } from "antd";
import useComponentsStore from '../stores/components.tsx';
import { useComponentConfigStore } from '../stores/component-config.tsx';
import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import OptimizedColorPicker from '../components/OptimizedColorPicker';

const { Option } = Select;

export default function ComponentProps() {
    // 订阅当前选中的组件和更新方法（使用节流版本）
    const { curComponent, updateComponent, updateComponentThrottled } = useComponentsStore(
        useShallow((state) => ({
            curComponent: state.curComponent,
            updateComponent: state.updateComponent,
            updateComponentThrottled: state.updateComponentThrottled
        }))
    );
    
    // 订阅组件配置信息
    const { componentConfig } = useComponentConfigStore(
        useShallow((state) => ({
            componentConfig: state.componentConfig
        }))
    );
    
    // 获取当前组件的配置信息
    const currentConfig = useMemo(() => {
        if (!curComponent) return null;
        return componentConfig[curComponent.name] || null;
    }, [curComponent, componentConfig]);

    // 立即更新组件属性（用于点击、输入等操作）
    const updateProps = useCallback((newProps: Record<string, any>) => {
        if (!curComponent) {
            message.warning('请先选择一个组件');
            return;
        }
        
        const updatedProps = {
            ...curComponent.props,
            ...newProps
        };
        
        updateComponent(curComponent.id, updatedProps);
        message.success('属性已更新');
    }, [curComponent, updateComponent]);

    // 节流更新组件属性（用于拖拽、连续操作）
    const updatePropsThrottled = useCallback((newProps: Record<string, any>) => {
        if (!curComponent) {
            return;
        }
        
        const updatedProps = {
            ...curComponent.props,
            ...newProps
        };
        
        // 使用节流版本，避免频繁更新
        updateComponentThrottled(curComponent.id, updatedProps);
    }, [curComponent, updateComponentThrottled]);
    
    // 如果没有选中组件，显示提示信息
    if (!curComponent) {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                请选择一个组件查看属性
            </div>
        );
    }

    // 根据组件类型渲染不同的属性编辑器
    const renderPropsEditor = () => {
        const props = curComponent.props || {};
        
        switch (curComponent.name) {
            case 'Button':
                return (
                    <>
                        <Form.Item label="按钮文本">
                            <Input 
                                value={props.text || '按钮'} 
                                onChange={(e) => updateProps({ text: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="按钮类型">
                            <Select 
                                value={props.type || 'default'} 
                                onChange={(value) => updateProps({ type: value })}
                            >
                                <Option value="default">默认</Option>
                                <Option value="primary">主要</Option>
                                <Option value="dashed">虚线</Option>
                                <Option value="text">文本</Option>
                                <Option value="link">链接</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="按钮大小">
                            <Select 
                                value={props.size || 'middle'} 
                                onChange={(value) => updateProps({ size: value })}
                            >
                                <Option value="small">小</Option>
                                <Option value="middle">中</Option>
                                <Option value="large">大</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="危险按钮">
                            <Switch 
                                checked={props.danger || false} 
                                onChange={(checked) => updateProps({ danger: checked })}
                            />
                        </Form.Item>
                        <Form.Item label="禁用状态">
                            <Switch 
                                checked={props.disabled || false} 
                                onChange={(checked) => updateProps({ disabled: checked })}
                            />
                        </Form.Item>
                    </>
                );
            
            case 'Text':
                return (
                    <>
                        <Form.Item label="文本内容">
                            <Input.TextArea 
                                value={props.content || '这是一段文本'} 
                                onChange={(e) => updateProps({ content: e.target.value })}
                                rows={3}
                            />
                        </Form.Item>
                        <Form.Item label="字体大小">
                            <InputNumber 
                                value={props.fontSize || 14} 
                                onChange={(value) => updateProps({ fontSize: value })}
                                addonAfter="px"
                                min={8}
                                max={72}
                            />
                        </Form.Item>
                        <Form.Item label="文字颜色">
                            <OptimizedColorPicker 
                                value={props.color || '#333333'} 
                                onChange={(color: string) => updateProps({ color })}
                                onChangeThrottled={(color: string) => updatePropsThrottled({ color })}
                                showText
                                throttleDelay={100}
                            />
                        </Form.Item>
                        <Form.Item label="字重">
                            <Select 
                                value={props.fontWeight || 'normal'} 
                                onChange={(value) => updateProps({ fontWeight: value })}
                            >
                                <Option value="normal">正常</Option>
                                <Option value="bold">粗体</Option>
                                <Option value="300">细体</Option>
                                <Option value="500">中等</Option>
                                <Option value="600">半粗</Option>
                                <Option value="700">粗体</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="文字对齐">
                            <Select 
                                value={props.textAlign || 'left'} 
                                onChange={(value) => updateProps({ textAlign: value })}
                            >
                                <Option value="left">左对齐</Option>
                                <Option value="center">居中</Option>
                                <Option value="right">右对齐</Option>
                                <Option value="justify">两端对齐</Option>
                            </Select>
                        </Form.Item>
                    </>
                );
            
            case 'Header':
                return (
                    <>
                        <Form.Item label="标题文本">
                            <Input 
                                value={props.title || '标题'} 
                                onChange={(e) => updateProps({ title: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="标题级别">
                            <Select 
                                value={props.level || 1} 
                                onChange={(value) => updateProps({ level: value })}
                            >
                                <Option value={1}>H1</Option>
                                <Option value={2}>H2</Option>
                                <Option value={3}>H3</Option>
                                <Option value={4}>H4</Option>
                                <Option value={5}>H5</Option>
                                <Option value={6}>H6</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="对齐方式">
                            <Select 
                                value={props.align || 'left'} 
                                onChange={(value) => updateProps({ align: value })}
                            >
                                <Option value="left">左对齐</Option>
                                <Option value="center">居中</Option>
                                <Option value="right">右对齐</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="文字颜色">
                            <OptimizedColorPicker 
                                value={props.color || '#1f2937'} 
                                onChange={(color: string) => updateProps({ color })}
                                onChangeThrottled={(color: string) => updatePropsThrottled({ color })}
                                showText
                                throttleDelay={100}
                            />
                        </Form.Item>
                    </>
                );
            
            case 'Input':
                return (
                    <>
                        <Form.Item label="占位符">
                            <Input 
                                value={props.placeholder || '请输入内容'} 
                                onChange={(e) => updateProps({ placeholder: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="默认值">
                            <Input 
                                value={props.value || ''} 
                                onChange={(e) => updateProps({ value: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="输入框大小">
                            <Select 
                                value={props.size || 'middle'} 
                                onChange={(value) => updateProps({ size: value })}
                            >
                                <Option value="small">小</Option>
                                <Option value="middle">中</Option>
                                <Option value="large">大</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="禁用状态">
                            <Switch 
                                checked={props.disabled || false} 
                                onChange={(checked) => updateProps({ disabled: checked })}
                            />
                        </Form.Item>
                        <Form.Item label="允许清除">
                            <Switch 
                                checked={props.allowClear !== false} 
                                onChange={(checked) => updateProps({ allowClear: checked })}
                            />
                        </Form.Item>
                        <Form.Item label="最大长度">
                            <InputNumber 
                                value={props.maxLength} 
                                onChange={(value) => updateProps({ maxLength: value })}
                                min={1}
                                placeholder="不限制"
                            />
                        </Form.Item>
                    </>
                );
            
            case 'Image':
                return (
                    <>
                        <Form.Item label="图片地址">
                            <Input 
                                value={props.src || 'https://via.placeholder.com/300x200?text=图片'} 
                                onChange={(e) => updateProps({ src: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="替代文本">
                            <Input 
                                value={props.alt || '图片'} 
                                onChange={(e) => updateProps({ alt: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="宽度">
                            <Input 
                                value={props.width || '100%'} 
                                onChange={(e) => updateProps({ width: e.target.value })}
                                placeholder="如: 300px, 100%, auto"
                            />
                        </Form.Item>
                        <Form.Item label="高度">
                            <Input 
                                value={props.height || 'auto'} 
                                onChange={(e) => updateProps({ height: e.target.value })}
                                placeholder="如: 200px, 100%, auto"
                            />
                        </Form.Item>
                        <Form.Item label="适应方式">
                            <Select 
                                value={props.objectFit || 'cover'} 
                                onChange={(value) => updateProps({ objectFit: value })}
                            >
                                <Option value="cover">覆盖</Option>
                                <Option value="contain">包含</Option>
                                <Option value="fill">填充</Option>
                                <Option value="scale-down">缩小</Option>
                                <Option value="none">原始</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="圆角">
                            <InputNumber 
                                value={props.borderRadius || 0} 
                                onChange={(value) => updateProps({ borderRadius: value })}
                                addonAfter="px"
                                min={0}
                            />
                        </Form.Item>
                    </>
                );
            
            case 'Div':
                return (
                    <>
                        <Form.Item label="背景颜色">
                            <OptimizedColorPicker 
                                value={props.backgroundColor || 'transparent'} 
                                onChange={(color: string) => updateProps({ backgroundColor: color })}
                                onChangeThrottled={(color: string) => updatePropsThrottled({ backgroundColor: color })}
                                showText
                                throttleDelay={100}
                            />
                        </Form.Item>
                        <Form.Item label="内边距">
                            <InputNumber 
                                value={props.padding || 10} 
                                onChange={(value) => updateProps({ padding: value })}
                                addonAfter="px"
                                min={0}
                            />
                        </Form.Item>
                        <Form.Item label="外边距">
                            <InputNumber 
                                value={props.margin || 0} 
                                onChange={(value) => updateProps({ margin: value })}
                                addonAfter="px"
                                min={0}
                            />
                        </Form.Item>
                        <Form.Item label="圆角">
                            <InputNumber 
                                value={props.borderRadius || 0} 
                                onChange={(value) => updateProps({ borderRadius: value })}
                                addonAfter="px"
                                min={0}
                            />
                        </Form.Item>
                        <Form.Item label="最小高度">
                            <InputNumber 
                                value={props.minHeight || 50} 
                                onChange={(value) => updateProps({ minHeight: value })}
                                addonAfter="px"
                                min={0}
                            />
                        </Form.Item>
                        <Form.Item label="显示方式">
                            <Select 
                                value={props.display || 'block'} 
                                onChange={(value) => updateProps({ display: value })}
                            >
                                <Option value="block">块级</Option>
                                <Option value="flex">弹性布局</Option>
                                <Option value="inline-block">行内块</Option>
                                <Option value="inline-flex">行内弹性</Option>
                            </Select>
                        </Form.Item>
                        {(props.display === 'flex' || props.display === 'inline-flex') && (
                            <>
                                <Form.Item label="主轴方向">
                                    <Select 
                                        value={props.flexDirection || 'column'} 
                                        onChange={(value) => updateProps({ flexDirection: value })}
                                    >
                                        <Option value="row">水平</Option>
                                        <Option value="column">垂直</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item label="主轴对齐">
                                    <Select 
                                        value={props.justifyContent || 'flex-start'} 
                                        onChange={(value) => updateProps({ justifyContent: value })}
                                    >
                                        <Option value="flex-start">起始</Option>
                                        <Option value="center">居中</Option>
                                        <Option value="flex-end">末尾</Option>
                                        <Option value="space-between">两端对齐</Option>
                                        <Option value="space-around">环绕对齐</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item label="交叉轴对齐">
                                    <Select 
                                        value={props.alignItems || 'flex-start'} 
                                        onChange={(value) => updateProps({ alignItems: value })}
                                    >
                                        <Option value="flex-start">起始</Option>
                                        <Option value="center">居中</Option>
                                        <Option value="flex-end">末尾</Option>
                                        <Option value="stretch">拉伸</Option>
                                    </Select>
                                </Form.Item>
                            </>
                        )}
                    </>
                );
            
            default:
                return (
                    <Form.Item label="组件属性 (JSON)">
                        <Input.TextArea 
                            value={JSON.stringify(props, null, 2)} 
                            rows={6}
                            disabled 
                        />
                    </Form.Item>
                );
        }
    };
    
    return (
        <div style={{ padding: '16px' }}>
            {/* 组件类型信息 */}
            <div style={{ 
                marginBottom: '16px', 
                padding: '8px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px' 
            }}>
                <strong>组件类型：</strong> {curComponent.name} ({currentConfig?.desc || '未知'})
            </div>
            
            {/* 组件属性表单 */}
            <Form layout="vertical" size="small">
                <Form.Item label="组件ID">
                    <Input value={curComponent.id} disabled />
                </Form.Item>
                
                {renderPropsEditor()}
            </Form>
        </div>
    );
}