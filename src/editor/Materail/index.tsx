import { useMemo } from 'react'
import { Collapse } from 'antd'
import { AppstoreOutlined, RobotOutlined } from '@ant-design/icons'
import { useComponentConfigStore } from '../stores/component-config'
import MaterialItem from '../../components/Mateialltem'
import { useShallow } from 'zustand/react/shallow';

const { Panel } = Collapse;

export default function Material() {
    const { componentConfig } = useComponentConfigStore(
        useShallow((state) => ({
            componentConfig: state.componentConfig
        }))
    );
    
    // 按分类分组组件
    const groupedComponents = useMemo(() => {
        const groups: Record<string, any[]> = {};
        
        Object.values(componentConfig).forEach((item) => {
            if (item.name === 'Page') return; // 过滤掉Page组件
            
            const category = item.category || '其他';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });
        
        return groups;
    }, [componentConfig]);
    
    // 获取分类图标
    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'AI 标注':
                return <RobotOutlined />;
            case '基础组件':
                return <AppstoreOutlined />;
            default:
                return <AppstoreOutlined />;
        }
    };
    
    return (
        <div style={{ padding: '0' }}>
            <Collapse 
                defaultActiveKey={Object.keys(groupedComponents)}
                ghost
                expandIconPosition="end"
            >
                {Object.entries(groupedComponents).map(([category, items]) => (
                    <Panel 
                        header={
                            <span style={{ fontWeight: 500, fontSize: 14 }}>
                                {getCategoryIcon(category)}
                                <span style={{ marginLeft: 8 }}>{category}</span>
                                <span style={{ 
                                    marginLeft: 8, 
                                    color: '#999', 
                                    fontSize: 12 
                                }}>
                                    ({items.length})
                                </span>
                            </span>
                        }
                        key={category}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {items.map((item, index) => (
                                <MaterialItem 
                                    key={item.name} 
                                    name={item.name} 
                                    index={index} 
                                />
                            ))}
                        </div>
                    </Panel>
                ))}
            </Collapse>
        </div>
    )
}