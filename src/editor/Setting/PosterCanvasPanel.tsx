import { Card, Form, InputNumber, Select } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import OptimizedColorPicker from '../components/OptimizedColorPicker';
import { useComponentsStore } from '../stores/new-components';

const POSTER_PRESETS = [
    { label: '小红书封面 1242 x 1660', value: 'xiaohongshu', width: 1242, height: 1660 },
    { label: '竖版海报 1080 x 1920', value: 'poster_story', width: 1080, height: 1920 },
    { label: '方形海报 1080 x 1080', value: 'square', width: 1080, height: 1080 },
    { label: '横版横幅 1920 x 1080', value: 'banner', width: 1920, height: 1080 },
    { label: 'A4 打印 2480 x 3508', value: 'a4', width: 2480, height: 3508 },
    { label: '自定义', value: 'custom', width: 0, height: 0 },
];

export default function PosterCanvasPanel() {
    const { canvasNode, updateCanvas } = useComponentsStore(
        useShallow((state) => ({
            canvasNode: state.nodes.find((node) => node.id === 'root_page') || null,
            updateCanvas: state.updateCanvas,
        }))
    );

    if (!canvasNode) {
        return null;
    }

    const currentPreset = canvasNode.props?.preset || 'custom';

    return (
        <Card size="small" title="海报画布" style={{ marginBottom: 16 }}>
            <Form layout="vertical" size="small">
                <Form.Item label="尺寸预设">
                    <Select
                        value={currentPreset}
                        options={POSTER_PRESETS.map((preset) => ({
                            label: preset.label,
                            value: preset.value,
                        }))}
                        onChange={(value) => {
                            const preset = POSTER_PRESETS.find((item) => item.value === value);
                            if (!preset) {
                                return;
                            }

                            updateCanvas({
                                preset: value,
                                ...(value !== 'custom'
                                    ? { width: preset.width, height: preset.height }
                                    : {}),
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="画布宽度">
                    <InputNumber
                        min={200}
                        max={4000}
                        value={canvasNode.position.width}
                        addonAfter="px"
                        style={{ width: '100%' }}
                        onChange={(value) => {
                            if (typeof value === 'number') {
                                updateCanvas({ width: value, preset: 'custom' });
                            }
                        }}
                    />
                </Form.Item>
                <Form.Item label="画布高度">
                    <InputNumber
                        min={200}
                        max={6000}
                        value={canvasNode.position.height}
                        addonAfter="px"
                        style={{ width: '100%' }}
                        onChange={(value) => {
                            if (typeof value === 'number') {
                                updateCanvas({ height: value, preset: 'custom' });
                            }
                        }}
                    />
                </Form.Item>
                <Form.Item label="画布背景">
                    <OptimizedColorPicker
                        value={canvasNode.props?.backgroundColor || '#ffffff'}
                        onChange={(color: string) => updateCanvas({ backgroundColor: color })}
                        onChangeThrottled={(color: string) =>
                            updateCanvas({ backgroundColor: color })
                        }
                        showText
                        throttleDelay={100}
                    />
                </Form.Item>
            </Form>
        </Card>
    );
}
