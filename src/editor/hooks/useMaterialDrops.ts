import {useDrop} from 'react-dnd'
import {message} from 'antd'
import useComponentsStore from '../stores/components.tsx'
import {useComponentConfigStore} from '../stores/component-config.tsx'




export default function useMaterialDrops(accept: string[],id:number) { 
    const {addComponent} = useComponentsStore((state) => state);
    const {componentConfig} = useComponentConfigStore((state) => state);

    const [{canDrop}, dropRef] = useDrop(() =>({
       accept,
       drop:(item: {name: string},monitor)=>{
        // 检查是否已经在其他容器中处理了放置
        const didDrop = monitor.didDrop();
        console.log('didDrop:', didDrop)
        if(didDrop) return
        
        // 获取放置位置相对于视口的坐标
        const clientOffset = monitor.getClientOffset();
        
        // 获取拖放目标的DOM引用
        const dropTargetRef = dropRef.current as HTMLElement;
        
        // 计算相对位置
        let position = { x: 0, y: 0 };
        if (clientOffset && dropTargetRef) {
            const targetRect = dropTargetRef.getBoundingClientRect();
            position = {
                x: clientOffset.x - targetRect.left,
                y: clientOffset.y - targetRect.top
            };
        }
        
        const props = componentConfig?.[item.name]?.defaultProps;
        const desc = componentConfig?.[item.name]?.desc;
        
        // 将位置信息添加到props中
        const positionedProps = {
            ...(props || {}),
            style: {
                ...(props?.style || {}),
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`
            }
        };
        
        message.success(`成功添加 ${item.name} 组件到容器！`);
        addComponent({
            id: Date.now(),
            name: item.name,
            props: positionedProps,
            children: [],
            desc: desc || '',
            position: position // 保存位置信息
        }, id)
        console.log('dropped item to container:', item, 'at position:', position)
       },
       collect: (monitor) => ({
           canDrop: monitor.canDrop(),
       }),//设置移动就显示true，高亮的
     }))
     return {
        canDrop,
        dropRef
     }
}