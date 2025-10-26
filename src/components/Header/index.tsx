import React from 'react'
import { Button } from "antd";
import  useComponentsStore  from '../../editor/stores/components.tsx';
import { useShallow } from 'zustand/react/shallow';

export default function Header() {
    const {mode, setMode} = useComponentsStore(
        useShallow((state) => ({
            mode: state.mode,
            setMode: state.setMode
        }))
    );

    return (
        <div className='w-[100%] h-[100%]'>
            <div className='h-[50px] flex items-center justify-between'>
                <div>低代码编辑器</div>
                {
                    mode === 'edit' ? (
                        <Button type="primary" onClick={() => setMode('preview')}>
                           预览
                        </Button>
                    ) : (
                        <Button type="default" onClick={() => setMode('edit')}>
                            退出预览
                        </Button>
                    )
                }
            </div>
        </div>
    )
}