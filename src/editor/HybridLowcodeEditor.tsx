import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import Header from '../components/Header/index.tsx';
import EditorArea from './EditoArea/index.tsx';
import Material from './Materail/index.tsx';
import Setting from './Setting/index.tsx';
import { useComponentsStore } from './stores/new-components';

export default function HybridLowcodeEditor() {
    const { mode } = useComponentsStore(
        useShallow((state) => ({
            mode: state.mode,
        }))
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="h-full flex flex-col px-5">
            <div className="h-[60px] shrink-0 flex items-center border-b-[1px] border-[#000]">
                <Header />
            </div>
            <div className="flex-1 min-h-0">
                <div className="flex h-full min-h-0 gap-4 py-4">
                    {mode === 'edit' && (
                        <aside className="w-[260px] shrink-0 overflow-auto border-r border-gray-200 pr-3">
                            <Material />
                        </aside>
                    )}
                    <main className="min-w-0 flex-1 overflow-hidden">
                        <div className={`h-full ${mode === 'preview' ? 'p-4' : ''}`}>
                            <EditorArea />
                        </div>
                    </main>
                    {mode === 'edit' && (
                        <aside className="w-[300px] h-full min-h-0 shrink-0 overflow-hidden border-l border-gray-200 pl-3">
                            <Setting />
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}
