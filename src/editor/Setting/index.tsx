import { useState } from 'react';
import { Segmented } from 'antd';
import ComponentProps from './ComponentProps.tsx';
import ComponentStyle from './ComponentStyle.tsx';
import PosterCanvasPanel from './PosterCanvasPanel.tsx';

const TAB_OPTIONS = ['属性', '外观'] as const;
type TabValue = (typeof TAB_OPTIONS)[number];

export default function Setting() {
    const [value, setValue] = useState<TabValue>('属性');

    return (
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
            <div className="shrink-0">
                <PosterCanvasPanel />
            </div>

            <div className="shrink-0 pb-3">
                <Segmented<TabValue>
                    value={value}
                    options={[...TAB_OPTIONS]}
                    onChange={(nextValue) => setValue(nextValue)}
                    block
                />
            </div>

            <div className="flex-1 min-h-0 max-h-full overflow-y-auto overflow-x-hidden pr-1">
                {value === '属性' && <ComponentProps />}
                {value === '外观' && <ComponentStyle />}
            </div>
        </div>
    );
}
