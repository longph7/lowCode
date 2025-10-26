import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Hover from '../../components/Hover/index.tsx';
import  useComponentsStore  from '../stores/components.tsx';
import type { Component } from '../stores/components.tsx';
import { useComponentConfigStore } from '../stores/component-config.tsx';
import SelectedMask from '../../components/SelectedMask/index.tsx';
import ErrorBoundary from '../../components/ErrorBoundary/index.tsx';
import { useShallow } from 'zustand/react/shallow';


export default function EditorArea() {
    const {components,addComponent,deleteComponent,mode} = useComponentsStore(
        useShallow((state) => ({
            components: state.components,
            addComponent: state.addComponent,
            deleteComponent: state.deleteComponent,
            mode: state.mode
        }))
    );
   const {componentConfig} = useComponentConfigStore(
       useShallow((state) => ({
           componentConfig: state.componentConfig
       }))
   );
    const [hoverComponentId,sethoverComponentId] = useState('');
    const {setCurComponentId,curComponentId} = useComponentsStore(
        useShallow((state) => ({
            setCurComponentId: state.setCurComponentId,
            curComponentId: state.curComponentId
        }))
    );

    useEffect(()=>{
        // addComponent({
        //     id: 2,
        //     name: 'Container',
        //     props: {},
        //     desc: '容器',
        //     // children: []
        // },1)
        // addComponent({
        //     id: 3,
        //     name: 'Button',
        //     props: {
        //         text:'上传'

        //     },
        //     desc: '按钮',
        //     children: []
        // },2)
    },[])

    //渲染组件
    const renderComponent = useCallback((components: Component[]): (React.ReactElement | null)[] => {
        return components.map((component: Component) => {
            const config = componentConfig[component.name];
            if(!config?.component){//没有对应组件
                return null;
            }
            return React.createElement(
                config.component,
                {
                    key: `component-${component.id}`, // 添加唯一的key属性
                    id:component.id,
                    name:component.name,
                    'data-component-id': component.id, // 添加data属性用于DOM查询
                    ...config.defaultProps,//默认属性
                    ...component.props//用户属性
                },
                component.children && component.children.length > 0 ? renderComponent(component.children) : undefined)
           
        }).filter(Boolean) // 过滤掉null值
    }, [componentConfig])
    const handleMouseOver:React.MouseEventHandler = useCallback((e:any) => {
            // 预览模式下不响应鼠标事件
            if (mode === 'preview') {
                return;
            }
            try {
                const path = e.nativeEvent.composedPath();
                for(let i=0;i<path.length;i++){
                    const ele = path[i];
                    // 检查元素是否为HTMLElement且有dataset属性
                    if(ele && ele instanceof HTMLElement && ele.dataset && ele.dataset.componentId){
                        const componentId = ele.dataset.componentId;
                        if(componentId){
                            sethoverComponentId(prev => {
                                // 只有当ID真正变化时才更新
                                return prev !== componentId ? componentId : prev;
                            });
                            return
                        }
                    }
                }
            } catch (error) {
                console.warn('处理鼠标悬停事件时出错:', error);
            }
    }, [mode])
    const handleClick:React.MouseEventHandler = useCallback((e:any) => {
        // 预览模式下不响应点击事件
        if (mode === 'preview') {
            return;
        }
        try {
          //把点击会经历的所有元素全列出来
            const path = e.nativeEvent.composedPath();
            for(let i=0;i<path.length;i++){//从点击的元素开始遍历，找到第一个有componentId的元素
                const ele = path[i];
                // 检查元素是否为HTMLElement且有dataset属性和componentId
                if(ele && ele instanceof HTMLElement && ele.dataset && ele.dataset.componentId){
                    const componentId = ele.dataset.componentId;
                    if(componentId){
                        const newId = Number(componentId);
                        // 只有当ID真正变化时才更新
                        if (curComponentId !== newId) {
                            setCurComponentId(newId);
                        }
                        return
                    }
                }
            }
        } catch (error) {
            console.warn('处理点击事件时出错:', error);
        }
    }, [setCurComponentId, curComponentId, mode])

    const handleMouseOut = useCallback(() => {
        // 预览模式下不响应鼠标事件
        if (mode === 'preview') {
            return;
        }
        sethoverComponentId(prev => prev ? '' : prev);
    }, [mode])

    return (
        <ErrorBoundary>
        <>
        <div className={`w-[100%] h-[100%] editor-area ${
            mode === 'preview' ? 'preview-mode' : 'edit-mode'
        }`} 
        onMouseOver={handleMouseOver} 
        onMouseOut={handleMouseOut} 
        onClick={handleClick}>
             {renderComponent(components)}
             {mode === 'edit' && hoverComponentId && hoverComponentId !== curComponentId?.toString() && (
                <ErrorBoundary>
                    <Hover componentId={hoverComponentId} 
                    containerClassName='editor-area'
                    poralWrapperClassName='portal-wrapper'
                    />
                </ErrorBoundary>
             )}
             {mode === 'edit' && curComponentId && (
                <ErrorBoundary>
                    <SelectedMask 
                    containerClassName='editor-area'
                    poralWrapperClassName='portal-wrapper'//放到这个容器中实现
                    componentId={curComponentId.toString()} />
                </ErrorBoundary>
             )}
           
        </div>
        <div className='portal-wrapper'>
            
        </div>
        </>
        </ErrorBoundary>
    )
}