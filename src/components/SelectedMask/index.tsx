import React, { useCallback, useEffect, useState } from 'react'
import {createPortal} from 'react-dom'
import {Popconfirm, Button} from 'antd'
import {DeleteOutlined} from '@ant-design/icons'
import { useComponentsStore } from '../../editor/stores/components'
import { useShallow } from 'zustand/react/shallow';


interface SelectedMaskProps {
    containerClassName:string,
    poralWrapperClassName:string,
    componentId:string
}


export default function SelectedMask({containerClassName,poralWrapperClassName,componentId}: SelectedMaskProps) {
    const {deleteComponent, setCurComponentId, curComponentId} = useComponentsStore(
        useShallow((state) => ({
            deleteComponent: state.deleteComponent,
            setCurComponentId: state.setCurComponentId,
            curComponentId: state.curComponentId
        }))
    );
    
    const [position,setPosition] = useState({
        top:0,
        left:0,
        width:0,
        height:0,
        labelTop:0,
        labelLeft:0,
    
    })
    
    const updatePosition = useCallback(() => { 
        if(!componentId){
            return
        }
        try {
            // 获取被选中组件的DOM元素
            const node = document.querySelector(`[data-component-id="${componentId}"]`) as HTMLElement;
            if(!node){
                console.warn(`找不到组件: ${componentId}`);
                return
            }
            // 获取组件相对于视口的绝对位置
            const {top,left,width,height} = node.getBoundingClientRect();
            
            const newPosition = {
                top, // 直接使用绝对位置
                left, // 直接使用绝对位置
                width,
                height,
                labelTop: Math.max(top - 35, 5), // 确保标签不会超出视口顶部
                labelLeft: Math.max(left + width - 80, 5) // 确保标签不会超出视口左侧
            };
            
            // 智能状态更新，只有位置真正变化才更新
            setPosition(prev => {
                const changed = Math.abs(prev.top - newPosition.top) > 1 ||
                               Math.abs(prev.left - newPosition.left) > 1 ||
                               Math.abs(prev.width - newPosition.width) > 1 ||
                               Math.abs(prev.height - newPosition.height) > 1;
                return changed ? newPosition : prev;
            });
        } catch (error) {
            console.warn('更新选中组件位置时出错:', error);
        }
    }, [componentId])
    
    const handleDelete = useCallback(() => {
        if (!curComponentId) {
            console.warn('没有选中的组件ID');
            return;
        }
        
        console.log('删除组件:', curComponentId);
        deleteComponent(curComponentId);
        setCurComponentId(null);
    }, [curComponentId, deleteComponent, setCurComponentId])
    
    useEffect(()=>{ 
        updatePosition()
    },[updatePosition])
    
    // 修复：不要在useEffect内部调用useCallback（Hook必须在顶层调用）
    const resizeHandler = useCallback(() => {
        updatePosition();
    }, [updatePosition]);

    useEffect(()=>{
        window.addEventListener('resize',resizeHandler)
        return () => {
            window.removeEventListener('resize',resizeHandler)
        }
    },[resizeHandler])

   return createPortal((
      <>
          {/* 选中遮罩层 */}
          <div 
              className='selected-mask'
              style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  height: position.height,
                  position: 'fixed', // 使用固定定位
                  backgroundColor: 'rgba(59, 130, 246, 0.2)', // 更深的蓝色背景
                  border: '2px solid #3b82f6', // 实线边框，更明显
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  zIndex: 1010, // 更高的层级
                  pointerEvents: 'none'
              }}
          />
          {/* 右上角标签 */}
          <div 
              className='selected-label'
              style={{
                  position: 'fixed',
                  top: position.labelTop,
                  left: position.labelLeft,
                  backgroundColor: '#1e40af', // 更深的蓝色
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'system-ui, sans-serif',
                 
                  zIndex: 1011, // 最高层级
                  pointerEvents: 'auto', // 允许鼠标事件
              }}
          >
                    <Popconfirm 
                        title="确定要删除这个组件吗？" 
                        description="删除后将无法恢复"
                        okText="确定删除"
                        cancelText="取消"
                        onConfirm={handleDelete}
                        placement="bottomLeft"
                    > 
                        <Button 
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{
                                fontSize: '12px',
                                height: '24px',
                                lineHeight: '1',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                        >
                            删除
                        </Button>
                    </Popconfirm>
          </div>
      </>
   ), document.body)
}