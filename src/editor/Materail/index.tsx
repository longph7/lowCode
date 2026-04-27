import { useMemo } from 'react';
import { Collapse } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useShallow } from 'zustand/react/shallow';
import { useComponentConfigStore } from '../stores/component-config';
import MaterialItem from '../../components/Mateialltem';
import { IMAGE_MATERIALS } from '../materials/image-materials';

const POSTER_MATERIALS = new Set([
  'Title',
]);

const IMAGE_CATEGORY_LABEL = '\u56fe\u7247\u7d20\u6750';

export default function Material() {
  const { componentConfig } = useComponentConfigStore(
    useShallow((state) => ({
      componentConfig: state.componentConfig,
    }))
  );

  const groupedComponents = useMemo(() => {
    const groups: Record<string, any[]> = {};

    Object.values(componentConfig).forEach((item) => {
      if (!POSTER_MATERIALS.has(item.name)) return;

      const category = item.category || 'Poster';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [componentConfig]);

  const collapseItems = useMemo(() => {
    const componentItems = Object.entries(groupedComponents).map(([category, items]) => ({
      key: category,
      label: (
        <span style={{ fontWeight: 500, fontSize: 14 }}>
          <AppstoreOutlined />
          <span style={{ marginLeft: 8 }}>{category}</span>
          <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
            ({items.length})
          </span>
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item, index) => (
            <MaterialItem key={item.name} name={item.name} index={index} />
          ))}
        </div>
      ),
    }));

    const imageCategory = {
      key: IMAGE_CATEGORY_LABEL,
      label: (
        <span style={{ fontWeight: 500, fontSize: 14 }}>
          <AppstoreOutlined />
          <span style={{ marginLeft: 8 }}>{IMAGE_CATEGORY_LABEL}</span>
          <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
            ({IMAGE_MATERIALS.length})
          </span>
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {IMAGE_MATERIALS.map((item, index) => (
            <MaterialItem
              key={item.id}
              name={item.name}
              index={index}
              componentType={item.componentType}
              previewSrc={item.previewSrc}
              dragProps={item.props}
            />
          ))}
        </div>
      ),
    };

    return [imageCategory, ...componentItems];
  }, [groupedComponents]);

  return (
    <div style={{ padding: 0 }}>
      <Collapse
        defaultActiveKey={[IMAGE_CATEGORY_LABEL, ...Object.keys(groupedComponents)]}
        ghost
        expandIconPosition="end"
        items={collapseItems}
      />
    </div>
  );
}
