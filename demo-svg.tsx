import React from 'react';
import { createRoot } from 'react-dom/client';
import SvgLowcodeEditor from './src/editor/SvgLowcodeEditor';
import { useComponentsStore } from './src/editor/stores/new-components';

// 初始化示例数据
const initializeDemoData = () => {
  const { addNode, nodes } = useComponentsStore.getState();

  // 如果还没有初始化数据，则添加一些示例组件
  if (nodes.length <= 1) { // 只有默认的Page节点
    // 添加一个容器
    const containerNode = {
      type: 'Container',
      props: { 
        backgroundColor: '#f9fafb',
        padding: 20
      },
      position: { x: 50, y: 50, width: 400, height: 300 }
    };
    
    const containerResult = addNode(containerNode);
    
    // 添加一个按钮
    const buttonNode = {
      type: 'Button',
      props: { 
        text: '点击我',
        type: 'primary',
        fontSize: 16
      },
      position: { x: 80, y: 80, width: 100, height: 40 }
    };
    
    addNode(buttonNode);
    
    // 添加一段文本
    const textNode = {
      type: 'Text',
      props: { 
        content: '这是一个 SVG 渲染的文本组件',
        fontSize: 16,
        color: '#333333'
      },
      position: { x: 80, y: 150, width: 200, height: 30 }
    };
    
    addNode(textNode);
  }
};

// 示例应用组件
const DemoApp = () => {
  // 初始化示例数据
  React.useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <div className="demo-app">
      <h1>SVG 渲染低代码编辑器演示</h1>
      <div style={{ width: '100%', height: '80vh' }}>
        <SvgLowcodeEditor />
      </div>
    </div>
  );
};

// 如果在浏览器环境中，渲染应用
if (typeof document !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<DemoApp />);
  } else {
    // 创建一个容器元素用于演示
    const demoContainer = document.createElement('div');
    demoContainer.id = 'root';
    demoContainer.style.width = '100%';
    demoContainer.style.height = '100vh';
    document.body.appendChild(demoContainer);
    
    const root = createRoot(demoContainer);
    root.render(<DemoApp />);
  }
}

export default DemoApp;