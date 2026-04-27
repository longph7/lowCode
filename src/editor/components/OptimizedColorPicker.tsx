import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';

interface OptimizedColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  onChangeThrottled?: (color: string) => void;
  showText?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  throttleDelay?: number;
}

export default function OptimizedColorPicker({
  value = '#1677ff',
  onChange,
  onChangeThrottled,
  showText = true,
  disabled = false,
  size = 'middle',
  throttleDelay: _throttleDelay = 100,
}: OptimizedColorPickerProps) {
  const [localColor, setLocalColor] = useState<string>(value);
  const onChangeRef = useRef(onChange);
  const onChangeThrottledRef = useRef(onChangeThrottled);

  useEffect(() => {
    onChangeRef.current = onChange;
    onChangeThrottledRef.current = onChangeThrottled;
  }, [onChange, onChangeThrottled]);

  useEffect(() => {
    setLocalColor(value);
  }, [value]);

  const handleColorChange = useCallback((color: Color) => {
    const colorString = color.toHexString();
    setLocalColor(colorString);
    onChangeThrottledRef.current?.(colorString);
  }, []);

  const handleColorChangeComplete = useCallback((color: Color) => {
    const colorString = color.toHexString();
    setLocalColor(colorString);
    onChangeRef.current?.(colorString);
  }, []);

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
