import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getComponentById, useComponentsStore } from '../../editor/stores/components';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
interface HoverMaskProps {
    containerClassName?: string;
    componentId?: string;
    poralWrapperClassName?: string;
}


export default function Hover({containerClassName,componentId,poralWrapperClassName}:HoverMaskProps) {

    const [position,setPosition]=useState({
        top:0,
        left:0,
        width:0,
        height:0,
        labelTop:0,
        labelLeft:0
    })
    
    const updatePosition = useCallback(() => {
        if(!componentId){
            return
        }
        try {
            const container = document.querySelector(`.${containerClassName}`)
            if(!container){
                console.warn(`找不到容器: ${containerClassName}`);
                return
            }
            const node = document.querySelector(`[data-component-id="${componentId}"]`)
            if(!node){
                console.warn(`找不到组件: ${componentId}`);
                return
            }
            const {top,left,width,height} = node.getBoundingClientRect()
            const {top:containerTop,left:containerLeft} = container.getBoundingClientRect()

            const newPosition = {
                top:top-containerTop+container.scrollTop,
                left:left-containerLeft+container.scrollLeft,    
                width,
                height,
                labelTop:top-containerTop+container.scrollTop,
                labelLeft:left-containerLeft+container.scrollLeft
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
            console.warn('更新位置时出错:', error);
        }
    }, [componentId, containerClassName])
    useEffect(()=>{ 
        updatePosition()
    },[updatePosition])
    const el = useMemo(()=> {
        try {
            return document.querySelector(`.${poralWrapperClassName}`);
        } catch (error) {
            console.warn('Portal容器查询失败:', error);
            return null;
        }
    }, [poralWrapperClassName])
    const { components } = useComponentsStore(
        useShallow((state) => ({
            components: state.components
        }))
    );
    
    const curComponent = useMemo(() => {
        if (!componentId) return null;
        return getComponentById(componentId ? parseInt(componentId) : null, components);
    }, [componentId, components])


    if (!componentId || !el) {
        return null
    }

    return createPortal((
        <>
            {/* 悬停遮罩层 */}
            <div style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                width: position.width,
                height: position.height,
                background: 'rgba(59, 130, 246, 0.05)', // 非常浅的蓝色背景
                border: '1px dashed rgba(59, 130, 246, 0.3)', // 浅蓝色虚线边框
                borderRadius: '4px',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 999 // 比选中状态层级低
            }}>
            </div>
            
            {/* 组件名称标签 */}
            {curComponent?.name && (
                <div style={{
                    position: 'absolute',
                    top: position.labelTop - 20,
                    left: position.labelLeft,
                    background: 'rgba(59, 130, 246, 0.7)', // 半透明蓝色背景
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    lineHeight: '16px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    {curComponent.name}
                </div>
            )}
        </>
    ),el)
}