import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';

interface OptimizedColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  onChangeThrottled?: (color: string) => void; // 节流版本的onChange
  showText?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  throttleDelay?: number; // 节流延迟时间，默认100ms
}

/**
 * 优化的颜色选择器组件
 * 特点：
 * 1. 本地状态立即更新 - 保证拖动时的即时视觉反馈
 * 2. 拖拽时使用节流更新全局状态 - 避免过度渲染
 * 3. 松开鼠标时立即更新 - 显示成功提示
 * 4. 用户体验流畅，性能优化显著
 */
export default function OptimizedColorPicker({
  value = '#1677ff',
  onChange,
  onChangeThrottled,
  showText = true,
  disabled = false,
  size = 'middle',
  throttleDelay = 100
}: OptimizedColorPickerProps) {
  // 本地状态：用于ColorPicker的即时显示
  const [localColor, setLocalColor] = useState<string>(value);
  // 拖拽状态：记录是否正在拖拽
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // 使用useRef保存onChange引用，避免依赖变化导致的重新创建
  const onChangeRef = useRef(onChange);
  const onChangeThrottledRef = useRef(onChangeThrottled);
  
  // 更新引用
  useEffect(() => {
    onChangeRef.current = onChange;
    onChangeThrottledRef.current = onChangeThrottled;
  }, [onChange, onChangeThrottled]);

  // 当外部value变化时，同步更新本地状态
  useEffect(() => {
    setLocalColor(value);
  }, [value]);

  // 处理颜色变化（拖拽过程中）- 使用节流更新全局状态
  const handleColorChange = useCallback((color: Color) => {
    const colorString = color.toHexString();
    
    // 1. 立即更新本地状态 - 保证视觉反馈
    setLocalColor(colorString);
    
    // 2. 使用节流版本更新全局状态 - 避免过度渲染
    onChangeThrottledRef.current?.(colorString);
    
    setIsDragging(true);
  }, []); // 空依赖数组

  // 处理颜色选择完成（松开鼠标时）- 立即更新并显示成功提示
  const handleColorChangeComplete = useCallback((color: Color) => {
    const colorString = color.toHexString();
    
    // 更新本地状态
    setLocalColor(colorString);
    
    // 立即同步全局状态（这时会触发成功提示）
    onChangeRef.current?.(colorString);
    
    // 清理状态
    setIsDragging(false);
  }, []); // 空依赖数组

  return (
    <div className="optimized-color-picker">
      <ColorPicker
        value={localColor}
        onChange={handleColorChange}
        onChangeComplete={handleColorChangeComplete}
        showText={showText}
        disabled={disabled}
        size={size}
      />
    </div>
  );
}