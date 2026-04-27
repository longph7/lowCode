import { useMemo, useState } from 'react';
import { Alert, Button, Input, Modal, Space, Typography, message } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { useComponentsStore, type ComponentNode } from '../../editor/stores/new-components';
import { exportPosterAsPng } from '../../editor/utils/poster-export';
import { validateComponents } from '../../editor/utils/component-injector';

const SAMPLE_JSON = JSON.stringify(
    [
        {
            id: 'root_page',
            type: 'Page',
            props: {
                preset: 'poster_story',
                backgroundColor: '#ffffff',
            },
            position: { x: 0, y: 0, width: 1080, height: 1920 },
        },
        {
            id: 'title_demo',
            type: 'Title',
            props: {
                text: '新年快乐',
                color: '#D4382A',
                fontSize: 72,
                textAlign: 'center',
            },
            position: { x: 140, y: 180, width: 800, height: 120 },
            parentId: 'root_page',
        },
    ],
    null,
    2
);

export default function Header() {
    const [messageApi, contextHolder] = message.useMessage();
    const [jsonModalOpen, setJsonModalOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [validationStatus, setValidationStatus] = useState<'success' | 'error' | 'info'>('info');

    const { mode, setMode, replaceNodes } = useComponentsStore(
        useShallow((state) => ({
            mode: state.mode,
            setMode: state.setMode,
            replaceNodes: state.replaceNodes,
        }))
    );

    const parsedPreview = useMemo(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) {
                return { valid: false, message: 'JSON 顶层必须是数组。' };
            }

            const result = validateComponents(parsed as ComponentNode[]);
            if (!result.valid) {
                return { valid: false, message: result.errors.join('\n') };
            }

            if (result.warnings.length > 0) {
                return { valid: true, message: result.warnings.join('\n') };
            }

            return { valid: true, message: `校验通过，共 ${parsed.length} 个节点。` };
        } catch (error) {
            return {
                valid: false,
                message: error instanceof Error ? error.message : 'JSON 解析失败',
            };
        }
    }, [jsonInput]);

    const handleExport = async () => {
        try {
            await exportPosterAsPng();
            messageApi.success('导出成功');
        } catch (error) {
            console.error('[Poster Export] Failed:', error);
            messageApi.error('导出失败');
        }
    };

    const handleValidateJson = () => {
        setValidationStatus(parsedPreview.valid ? 'success' : 'error');
        setValidationMessage(parsedPreview.message);
    };

    const handleApplyJson = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) {
                setValidationStatus('error');
                setValidationMessage('JSON 顶层必须是数组。');
                return;
            }

            const result = validateComponents(parsed as ComponentNode[]);
            if (!result.valid) {
                setValidationStatus('error');
                setValidationMessage(result.errors.join('\n'));
                return;
            }

            replaceNodes(parsed as ComponentNode[]);
            setValidationStatus('success');
            setValidationMessage(`已加载 ${parsed.length} 个节点到画布。`);
            messageApi.success('JSON 已加载到画布');
            setJsonModalOpen(false);
        } catch (error) {
            setValidationStatus('error');
            setValidationMessage(error instanceof Error ? error.message : 'JSON 解析失败');
        }
    };

    return (
        <div className="w-[100%] h-[100%]">
            {contextHolder}
            <div className="h-[50px] flex items-center justify-between">
                <div>AI 海报编辑器</div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setJsonModalOpen(true)}>导入 JSON</Button>
                    <Button onClick={handleExport}>导出 PNG</Button>
                    {mode === 'edit' ? (
                        <Button onClick={() => setMode('preview')}>预览</Button>
                    ) : (
                        <Button onClick={() => setMode('edit')}>返回编辑</Button>
                    )}
                </div>
            </div>

            <Modal
                title="导入页面 JSON"
                open={jsonModalOpen}
                width={760}
                onCancel={() => setJsonModalOpen(false)}
                footer={
                    <Space>
                        <Button onClick={handleValidateJson}>检查结构</Button>
                        <Button type="primary" onClick={handleApplyJson}>
                            加载到画布
                        </Button>
                    </Space>
                }
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Typography.Text type="secondary">
                        这里直接粘贴 `ComponentNode[]` JSON。点击“检查结构”只做校验，点击“加载到画布”会替换当前页面。
                    </Typography.Text>
                    <Input.TextArea
                        value={jsonInput}
                        onChange={(event) => setJsonInput(event.target.value)}
                        rows={18}
                        spellCheck={false}
                    />
                    {validationMessage && (
                        <Alert
                            type={validationStatus}
                            message={validationStatus === 'success' ? '校验结果' : '错误信息'}
                            description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{validationMessage}</pre>}
                            showIcon
                        />
                    )}
                </Space>
            </Modal>
        </div>
    );
}
