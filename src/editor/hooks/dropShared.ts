export interface ComponentSize {
  width: number;
  height: number;
}

const DEFAULT_COMPONENT_SIZES: Record<string, ComponentSize> = {
  Page: { width: 800, height: 600 },
  Container: { width: 300, height: 200 },
  Text: { width: 200, height: 30 },
  Button: { width: 100, height: 40 },
  Input: { width: 200, height: 40 },
  TextArea: { width: 320, height: 120 },
  Select: { width: 240, height: 40 },
  RadioGroup: { width: 280, height: 120 },
  CheckboxGroup: { width: 280, height: 120 },
  Image: { width: 150, height: 100 },
  Header: { width: 800, height: 80 },
  Title: { width: 520, height: 80 },
  Div: { width: 250, height: 150 },
  Shape: { width: 240, height: 120 },
  Divider: { width: 320, height: 2 },
  Icon: { width: 48, height: 48 }
};

const FALLBACK_SIZE: ComponentSize = { width: 100, height: 50 };

export function getDefaultComponentSize(
  componentType: string,
  overrides?: Record<string, ComponentSize>
): ComponentSize {
  return overrides?.[componentType] || DEFAULT_COMPONENT_SIZES[componentType] || FALLBACK_SIZE;
}
