// Ambient module declarations for Editor.js tools lacking TypeScript types.
// These are intentionally lightweight to silence TS7016 while preserving basic structure.
// If official type packages are published later, replace this file with proper imports.

declare module '@editorjs/raw' {
  import type { BlockToolConstructable } from '@editorjs/editorjs';
  const RawTool: BlockToolConstructable;
  export default RawTool;
}

declare module '@editorjs/link' {
  import type { BlockToolConstructable } from '@editorjs/editorjs';
  interface LinkToolConfig {
    endpoint?: string;
  }
  const LinkTool: BlockToolConstructable;
  export default LinkTool;
}

// Helper minimal interfaces (fallback) in case editorjs types evolve.
// Extend as needed if you integrate more advanced tool configs.
