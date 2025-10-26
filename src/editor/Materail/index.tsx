import { useMemo } from 'react'
import { useComponentConfigStore } from '../stores/component-config'
import MaterialItem from '../../components/Mateialltem'
import { useShallow } from 'zustand/react/shallow';

export default function Material() {
    const { componentConfig } = useComponentConfigStore(
        useShallow((state) => ({
            componentConfig: state.componentConfig
        }))
    );
    const comonents = useMemo(
        () => {
            return Object.values(componentConfig).filter((item) => item.name !== 'Page') //[{xx},{xx},{xx}]也就是取出里面的值啊
        }, [componentConfig]
    );
    
    return (
        <div>
            {
                comonents.map((item, index) => {
                    return <MaterialItem key={item.name} name={item.name} index={index} />
                })
            }
        </div>
    )
}