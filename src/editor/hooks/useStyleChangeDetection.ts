import { useCallback, useRef } from 'react';

/**
 * 样式变化检测Hook
 * 只有当样式真正发生变化时才执行更新函数
 */
export function useStyleChangeDetection() {
  const lastStyleRef = useRef<Record<string, any>>({});

  /**
   * 检查样式是否发生变化
   * @param newStyle 新的样式对象
   * @returns 是否发生变化
   */
  const hasStyleChanged = useCallback((newStyle: Record<string, any>): boolean => {
    const lastStyle = lastStyleRef.current;
    
    // 检查键的数量是否相同
    const newKeys = Object.keys(newStyle);
    const lastKeys = Object.keys(lastStyle);
    
    if (newKeys.length !== lastKeys.length) {
      return true;
    }
    
    // 检查每个键值对是否相同
    for (const key of newKeys) {
      if (newStyle[key] !== lastStyle[key]) {
        return true;
      }
    }
    
    return false;
  }, []);

  /**
   * 创建带样式变化检测的更新函数
   * @param updateFn 实际的更新函数
   * @returns 包装后的更新函数
   */
  const createStyleUpdateFn = useCallback(<T extends Record<string, any>>(
    updateFn: (style: T) => void
  ) => {
    return (newStyle: T) => {
      if (hasStyleChanged(newStyle)) {
        lastStyleRef.current = { ...newStyle };
        updateFn(newStyle);
      }
    };
  }, [hasStyleChanged]);

  /**
   * 重置样式缓存
   */
  const resetStyleCache = useCallback(() => {
    lastStyleRef.current = {};
  }, []);

  return {
    hasStyleChanged,
    createStyleUpdateFn,
    resetStyleCache
  };
}