declare module 'class-variance-authority' {
  // Very small stub to satisfy imports used in the repo.
  export function cva(base?: string, config?: any): (...args: any[]) => string;
  export type VariantProps<T> = any;
}

declare module 'nativewind' {
  // cssInterop is used to register className interop for native components
  export function cssInterop(component: any, options?: any): void;
}

declare module 'react-native-uitextview' {
  import * as React from 'react';
  // Minimal UITextView component type
  export const UITextView: React.ComponentType<any>;
  export default UITextView;
}
