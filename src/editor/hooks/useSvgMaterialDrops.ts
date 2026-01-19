import { useDrop } from 'react-dnd'
import { message } from 'antd'
import { useComponentsStore } from '../stores/new-components'
import { useComponentConfigStore } from '../stores/component-config'

export default function useSvgMaterialDrops(accept: string[], nodeId: string) { 
    const { addNode } = useComponentsStore((state) => state);
    const { componentConfig } = useComponentConfigStore((state) => state);

    const [{ canDrop, isOver }, dropRef] = useDrop(() => ({
        accept,
        drop: (item: { name: string }, monitor) => {
            // 检查是否已经在其他容器中处理了放置
            const didDrop = monitor.didDrop();
            console.log('didDrop:', didDrop)
            if (didDrop) return

            // 获取放置位置相对于视口的坐标
            const clientOffset = monitor.getClientOffset();
            
            // 通过 document 查询特定的元素
            // 由于我们在组件中传递了 nodeId，我们可以通过 data-node-id 属性查找元素
            const dropTargetRef = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
            
            // 计算相对位置
            let position = { x: 20, y: 20, width: 200, height: 50 }; // 默认位置和尺寸
            if (clientOffset && dropTargetRef) {
                const targetRect = dropTargetRef.getBoundingClientRect();
                position = {
                    x: clientOffset.x - targetRect.left,
                    y: clientOffset.y - targetRect.top,
                    width: 200, // 默认宽度
                    height: 50   // 默认高度
                };
                
                // 特定组件类型的默认尺寸
                switch (item.name) {
                    case 'Button':
                        position.width = 100;
                        position.height = 40;
                        break;
                    case 'Text':
                        position.width = 200;
                        position.height = 30;
                        break;
                    case 'Header':
                        position.width = 300;
                        position.height = 40;
                        break;
                    case 'Input':
                        position.width = 200;
                        position.height = 32;
                        break;
                    case 'Container':
                        position.width = 300;
                        position.height = 200;
                        break;
                    case 'Div':
                        position.width = 250;
                        position.height = 100;
                        break;
                }
            }
            
            const props = componentConfig?.[item.name]?.defaultProps;
            const desc = componentConfig?.[item.name]?.desc;
            
            message.success(`成功添加 ${item.name} 组件到容器！`);
            addNode({
                type: item.name, // 使用 type 而不是 name
                props: props || {},
                position: position,
                parentId: nodeId
            })
            console.log('dropped item to container:', item, 'at position:', position)
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver({ shallow: true }),
        }),//设置移动就显示true，高亮的
    }))

    return {
        canDrop,
        isOver,
        dropRef
    }
}