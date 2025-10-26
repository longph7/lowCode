import { useCallback, useRef } from 'react';

/**
 * 节流Hook - 限制函数执行频率
 * @param callback 要节流的函数
 * @param delay 节流延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      // 如果距离上次执行时间超过delay，立即执行
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callback(...args);
      } else {
        // 否则清除之前的定时器，设置新的定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          callback(...args);
          timeoutRef.current = null;
        }, delay - (now - lastRun.current));
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * 防抖Hook - 延迟执行函数
 * @param callback 要防抖的函数
 * @param delay 防抖延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        timeoutRef.current = null;
      }, delay);
    }) as T,
    [callback, delay]
  );
}