import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// 深度比较对象是否相等
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

// 节流函数实现（带样式变化检测）
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    // 检查参数是否真正发生变化（特别是样式对象）
    if (lastArgs && deepEqual(args, lastArgs)) {
      // 如果参数没有变化，直接返回，不执行函数
      return;
    }
    
    if (now - lastCall >= delay) {
      lastCall = now;
      lastArgs = args;
      func(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        // 在延迟执行前再次检查参数是否变化
        if (!lastArgs || !deepEqual(args, lastArgs)) {
          lastCall = Date.now();
          lastArgs = args;
          func(...args);
        }
        timeoutId = null;
      }, delay - (now - lastCall));
    }
  };
}


export interface Component {
    id: number;
    name: string;
    props: any;
    desc: string;
    children?: Component[];
    parentId?: number;
    position?: { x: number; y: number }; // 添加位置属性
}


export interface State {
    components: Component[];
    curComponentId: number | null;
    curComponent: Component | null;
    mode: 'edit' | 'preview';
}

export interface Actions {
    addComponent: (component: any,parentId?:number) => void;
    deleteComponent: (componentId: number) => void;
    updateComponent: (componentId: number, props: any) => void;
    updateComponentThrottled: (componentId: number, props: any) => void; // 节流版本
    setCurComponentId: (componentId: number | null) => void;
    setMode: (mode: 'edit' | 'preview') => void;
}



export const useComponentsStore = create<State & Actions>()(
    subscribeWithSelector(
    (set,get) => ({
        components: [{
            id: 1,
            name: 'Page',
            props: {},
            desc: '页面',
            children: []
        }
        ],
        curComponentId:null,
        curComponent:null,
        mode: 'edit',
        addComponent: (component,parentId) => {
            set((state) => {
               if(parentId){
                const parentComponent = getComponentById(parentId,state.components);
                if(parentComponent){
                    parentComponent.children?parentComponent.children.push(component):parentComponent.children=[component];
                }
                component.parentId = parentId;
                return {
                    components: [...state.components],//添加到父组件
                }

               }
               return{
                components: [...state.components, component],//添加到最外面组件

               }
            })
        },
        deleteComponent: (componentId) => {
            if(!componentId){
                return;
            }
            const Component = getComponentById(componentId, get().components);//查找要删除的组件
            if(Component && Component.parentId){
              const parentComponent = getComponentById(Component.parentId, get().components);//查找要删除的组件的父组件
              if(parentComponent){
                parentComponent.children = parentComponent.children?.filter((component) => component.id !== componentId) || [];
              }
            } else {
              // 处理根级组件删除（没有parentId的组件）
              const updatedComponents = get().components.filter((component) => component.id !== componentId);
              set({
                components: updatedComponents
              });
              return;
            }
            set({
                components:[...get().components]//为了实现视口更新的效果

            })

        },
        updateComponent: (componentId, props) => {
            set((state) => {
                const Component = getComponentById(componentId, state.components);//查找要更新的组件
                if (Component) {
                    // 检查新的props是否与当前props相同
                    const newProps = { ...Component.props, ...props };
                    
                    // 如果props没有变化，直接返回当前状态，避免不必要的重渲染
                    if (deepEqual(Component.props, newProps)) {
                        return { components: state.components };
                    }
                    
                    Component.props = newProps;//更新组件的props
                    return { 
                        components: [...state.components] 
                    };
                }
                return { components: state.components };
                
            })
        },
        // 节流版本的updateComponent，避免过度渲染
        updateComponentThrottled: throttle((componentId: number, props: any) => {
            const { updateComponent } = get();
            updateComponent(componentId, props);
        }, 100), // 100ms节流
        //修改组件的id
        setCurComponentId: (componentId) => {
            set((state) => {
                // 如果新的ID与当前ID相同，避免不必要的更新
                if (state.curComponentId === componentId) {
                    return state;
                }
                
                const newComponent = getComponentById(componentId, state.components);
                return {
                    ...state,
                    curComponentId: componentId,
                    curComponent: newComponent
                };
            })
        },
        // 设置模式
        setMode: (mode) => {
            set((state) => {
                // 如果切换到预览模式，清除当前选中的组件
                if (mode === 'preview') {
                    return {
                        ...state,
                        mode,
                        curComponentId: null,
                        curComponent: null
                    };
                }
                return {
                    ...state,
                    mode
                };
            })
        },
    })
    )
)

export function getComponentById(id:number | null,components:Component[]): Component | null{
    if(id === null){
        return null;
    }
    for(const component of components){//从根组件开始查找
        if(component.id === id){
            return component;
        }
        if(component.children && component.children.length > 0){
            const result = getComponentById(id,component.children);
            if(result){
                return result;
            }
        }
    }
    return null;
}


export default useComponentsStore;
