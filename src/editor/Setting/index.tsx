import useComponentsStore from '../stores/components.tsx'
import { Segmented } from 'antd';
import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import ComponentProps from './ComponentProps.tsx'
import ComponentStyle from './ComponentStyle.tsx'
import ComponentEvent from './ComponentEvent.tsx'


export default function Setting() {
    const { components } = useComponentsStore(
        useShallow((state) => ({
            components: state.components
        }))
    )
    const [value, setValue] = useState('属性')
    return (
        <div>
            <Segmented<string>
                value={value}
                options={['属性', '外观', '事件', ]}
                onChange={(value) => {
                   setValue(value)
                }}
                block
            />
            <div>
                {
                    value === '属性' &&<ComponentProps />
                }
                {
                    value === '外观' &&<ComponentStyle />
                }
                {
                    value === '事件' &&<ComponentEvent />
                }
            </div>
           
        </div>
    )
}