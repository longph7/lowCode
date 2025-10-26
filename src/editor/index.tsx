import React from 'react'
import { Allotment } from "allotment";
import Header from '../components/Header/index.tsx';
import EditorArea from './EditoArea/index.tsx';
import Material from './Materail/index.tsx';
import Setting from './Setting/index.tsx';
import "allotment/dist/style.css";
import { useComponentsStore } from './stores/components.tsx';
import { useShallow } from 'zustand/react/shallow';


export default function LowcodeEditor() {
    const { mode } = useComponentsStore(
        useShallow((state) => ({
            mode: state.mode
        }))
    );
    
    return (
        <div className="h-[100vh] flex flex-col px-5">
            <div className="h-[60px]' flex items-center border-b-[1px] border-[#000]">
                <Header />
            </div>
            {mode === 'preview' ? (
                // 预览模式：只显示编辑区域
                <div className="flex-1 p-4">
                    <EditorArea />
                </div>
            ) : (
                // 编辑模式：显示完整布局
                <Allotment>
                    <Allotment.Pane preferredSize="20%">
                        <Material />
                    </Allotment.Pane>
                    <Allotment.Pane>
                        <EditorArea />
                    </Allotment.Pane>
                    <Allotment.Pane>
                        <Setting />
                    </Allotment.Pane>
                </Allotment>
            )}
        </div>  
    );
}