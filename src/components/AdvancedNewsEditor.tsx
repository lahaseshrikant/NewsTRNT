"use client";

import React, { useEffect, useRef, useCallback, useMemo, useState, KeyboardEvent } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Gapcursor from '@tiptap/extension-gapcursor';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
  Upload,
  X,
  Palette,
  Table as TableIcon,
  Code,

  Eye,
  EyeOff,
  MoreHorizontal,
  Settings,
  FileText,
  Camera,
  Youtube,
  Paperclip,
  Hash,
  AtSign,
  Calendar,
  MapPin,
  Target,
  Zap,
  Save,
  Send
} from 'lucide-react';

interface AdvancedNewsEditorProps {
  value: string;
  onChange: (html: string, plainText: string, wordCount: number) => void;
  placeholder?: string;
  disabled?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  showWordTarget?: boolean;
  wordTarget?: number;
  autoSave?: boolean;
  readingTime?: number;
}

const ToolbarSection: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
  <div
    className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg shadow-sm border border-border transition-colors"
    title={title}
  >
    {children}
  </div>
);

const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  variant?: 'default' | 'primary' | 'secondary';
  children: React.ReactNode;
}> = ({ onClick, isActive, disabled, title, variant = 'default', children }) => {
  const baseClasses = "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200";
  const variantClasses = {
    default: isActive
      ? 'bg-vermillion text-white shadow-md'
      : 'text-foreground hover:bg-muted hover:text-foreground',
    primary: 'bg-vermillion text-white hover:bg-vermillion/90 shadow-sm',
    secondary: 'bg-muted text-foreground hover:bg-muted/80'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={title}
    >
      {children}
    </button>
  );
};

const MenuBar: React.FC<{ 
  editor: any; 
  onImageUpload?: (file: File) => Promise<string>;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  onSave?: () => void;
  onPublish?: () => void;
}> = ({ editor, onImageUpload, showAdvanced, onToggleAdvanced, onSave, onPublish }) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const addLink = () => {
    const { selection } = editor.state;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
    setLinkText(selectedText);
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (linkUrl.trim()) {
      if (linkText.trim()) {
        editor.chain().focus().insertContent(`<a href="${linkUrl.trim()}">${linkText.trim()}</a>`).run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
      }
    }
    setLinkUrl('');
    setLinkText('');
    setShowLinkDialog(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) {
      const objectUrl = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src: objectUrl }).run();
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await onImageUpload(file);
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageFromUrl = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const toggleHeading = (level: number) => {
    if (editor.isActive('heading', { level })) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const insertCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  return (
    <>
      {/* Main Toolbar */}
  <div className="flex flex-wrap items-center gap-2 p-4 bg-card border-b border-border transition-colors">
        {/* Save & Publish Actions */}
        <ToolbarSection title="Actions">
          <ToolbarButton onClick={onSave || (() => {})} variant="secondary" title="Save Draft">
            <Save className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={onPublish || (() => {})} variant="primary" title="Publish">
            <Send className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarSection>

  <div className="h-6 w-px mx-2 bg-border/70" />

        {/* Text Formatting */}
        <ToolbarSection title="Text Formatting">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Palette className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarSection>

        {/* Headings */}
        <ToolbarSection title="Headings">
          <ToolbarButton
            onClick={() => toggleHeading(1)}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleHeading(2)}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleHeading(3)}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Paragraph"
          >
            <Type className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarSection>

        {/* Lists & Structure */}
        <ToolbarSection title="Lists & Structure">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <MoreHorizontal className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarSection>

        {/* Alignment */}
        <ToolbarSection title="Alignment">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarSection>

        {/* Links & Media */}
        <ToolbarSection title="Links & Media">
          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={removeLink}
            title="Remove Link"
          >
            <Unlink className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-vermillion border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setShowImageDialog(true)}
            title="Insert Image from URL"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarSection>

        {/* Advanced Features */}
        {showAdvanced && (
          <>
            <ToolbarSection title="Advanced">
              <ToolbarButton
                onClick={insertTable}
                title="Insert Table"
              >
                <TableIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={insertCodeBlock}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
              >
                <FileText className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
              >
                <MoreHorizontal className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={clearFormatting}
                title="Clear Formatting"
                variant="secondary"
              >
                <X className="w-4 h-4" />
              </ToolbarButton>
            </ToolbarSection>
            
            <ToolbarSection title="More Headings">
              <ToolbarButton
                onClick={() => toggleHeading(4)}
                isActive={editor.isActive('heading', { level: 4 })}
                title="Heading 4"
              >
                <span className="text-xs font-bold">H4</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => toggleHeading(5)}
                isActive={editor.isActive('heading', { level: 5 })}
                title="Heading 5"
              >
                <span className="text-xs font-bold">H5</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => toggleHeading(6)}
                isActive={editor.isActive('heading', { level: 6 })}
                title="Heading 6"
              >
                <span className="text-xs font-bold">H6</span>
              </ToolbarButton>
            </ToolbarSection>
          </>
        )}

        {/* Undo/Redo */}
        <ToolbarSection title="History">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarSection>

        {/* Toggle Advanced & Clear */}
        <div className="ml-auto flex items-center gap-2">
          <ToolbarButton
            onClick={onToggleAdvanced}
            title={showAdvanced ? "Hide Advanced Tools" : "Show Advanced Tools"}
            variant="secondary"
          >
            <Settings className="w-4 h-4" />
          </ToolbarButton>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors"
            title="Clear All Formatting"
          >
            Clear Format
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-border transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Link</h3>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="text-stone hover:text-stone dark:hover:text-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text (optional)"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-vermillion focus:border-transparent bg-background dark:bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-vermillion focus:border-transparent bg-background dark:bg-background text-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  disabled={!linkUrl.trim()}
                  className="px-4 py-2 bg-vermillion text-white rounded-lg hover:bg-vermillion/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image URL Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-border transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Insert Image</h3>
              <button
                onClick={() => setShowImageDialog(false)}
                className="text-stone hover:text-stone dark:hover:text-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-vermillion focus:border-transparent bg-background dark:bg-background text-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && handleImageFromUrl()}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImageDialog(false)}
                  className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageFromUrl}
                  disabled={!imageUrl.trim()}
                  className="px-4 py-2 bg-vermillion text-white rounded-lg hover:bg-vermillion/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AdvancedNewsEditor: React.FC<AdvancedNewsEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Start writing your story...', 
  disabled,
  onImageUpload,
  showWordTarget = true,
  wordTarget = 500,
  autoSave = true,
  readingTime
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const lastHtmlRef = useRef<string>(value || '');
  const isApplyingExternalRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const onChangeRef = useRef(onChange);

  // Keep onChange reference stable
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Memoize the extensions to prevent recreation
  const extensions = useMemo(() => [
    StarterKit.configure({ 
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: {
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto',
        },
      }
    }),
    Underline,
    Highlight.configure({ 
      multicolor: true,
      HTMLAttributes: {
        class: 'bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded',
      }
    }),
    Typography,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg shadow-md my-4 cursor-pointer',
      },
    }),
    Link.configure({ 
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-vermillion hover:text-vermillion/80 underline transition-colors cursor-pointer'
      }
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse border border-border my-4',
      },
    }),
    TableRow,
    TableHeader.configure({
      HTMLAttributes: {
        class: 'bg-muted font-semibold',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-border p-2 min-w-[100px]',
      },
    }),
    Gapcursor,
    Placeholder.configure({ placeholder })
  ], [placeholder]);

  // Stable onChange callback
  const handleUpdate = useCallback(({ editor }: any) => {
    if (isApplyingExternalRef.current) {
      return;
    }
    
    const html = editor.getHTML();
    if (html === lastHtmlRef.current) return;
    
    const text = editor.getText();
    const words = text.split(/\s+/).filter((w: string) => w.length > 0).length;
    const chars = text.length;
    
    setWordCount(words);
    setCharCount(chars);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce the onChange callback
    debounceTimerRef.current = setTimeout(() => {
      lastHtmlRef.current = html;
      onChangeRef.current(html, text, words);
      if (autoSave) {
        setLastSaved(new Date());
      }
    }, 300);
  }, [autoSave]);

  const editor = useEditor({
    extensions,
    content: value || '',
    editable: !disabled,
    autofocus: false,
    immediatelyRender: false,
    onUpdate: handleUpdate
  }, [extensions, disabled]);

  // Handle external content changes
  useEffect(() => {
    if (!editor) return;
    
    if (!initializedRef.current) {
      if (value) {
        editor.commands.setContent(value, { emitUpdate: false });
        lastHtmlRef.current = value;
        const text = editor.getText();
        const words = text.split(/\s+/).filter((w: string) => w.length > 0).length;
        setWordCount(words);
        setCharCount(text.length);
      }
      initializedRef.current = true;
      return;
    }

    const currentEditorContent = editor.getHTML();
    if (value && value !== lastHtmlRef.current && value !== currentEditorContent && value.trim() !== currentEditorContent.trim()) {
      isApplyingExternalRef.current = true;
      editor.commands.setContent(value, { emitUpdate: false });
      lastHtmlRef.current = value;
      setTimeout(() => {
        isApplyingExternalRef.current = false;
      }, 50);
    }
  }, [value, editor]);

  // Handle disabled state
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editor) return;
      
      // Ctrl/Cmd + K for link
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger link dialog from toolbar
      }
      
      // Ctrl/Cmd + Shift + F for focus mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, [editor, focusMode]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Calculate reading time
  const estimatedReadingTime = useMemo(() => {
    const wordsPerMinute = 200; // Average reading speed
    return Math.ceil(wordCount / wordsPerMinute) || 1;
  }, [wordCount]);

  // Word target progress
  const wordProgress = showWordTarget && wordTarget ? Math.min((wordCount / wordTarget) * 100, 100) : 0;

  if (!editor) {
    return (
      <div className="border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-vermillion border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-slate-700 dark:text-slate-300">Loading advanced editor...</span>
        </div>
      </div>
    );
  }

  return (
  <div className={`border border-border rounded-xl overflow-hidden bg-card shadow-lg transition-all duration-300 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Toolbar */}
      {!focusMode && (
        <MenuBar 
          editor={editor} 
          onImageUpload={onImageUpload}
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        />
      )}

      {/* Editor Area */}
      <div className="relative">
        {/* Note: BubbleMenu and FloatingMenu will be added in future versions when available */}

        <EditorContent 
          editor={editor} 
          className={`prose dark:prose-invert prose-lg max-w-none p-8 ${focusMode ? 'min-h-[80vh]' : 'min-h-[400px]'} max-h-none overflow-y-auto focus:outline-none
                     prose-headings:text-foreground prose-headings:font-bold prose-headings:leading-tight
                     prose-h1:text-4xl prose-h1:mt-10 prose-h1:mb-6
                     prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                     prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                     prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2 prose-h4:font-semibold
                     prose-h5:text-base prose-h5:mt-4 prose-h5:mb-2 prose-h5:font-semibold
                     prose-h6:text-sm prose-h6:mt-3 prose-h6:mb-1 prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide
                     prose-p:text-foreground prose-p:leading-relaxed prose-p:text-lg prose-p:mb-4
                     prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                     prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                     prose-li:text-foreground prose-li:text-lg prose-li:mb-1 prose-li:leading-relaxed
                     prose-a:text-vermillion dark:prose-a:text-vermillion/70 prose-a:underline hover:prose-a:no-underline
                     prose-blockquote:border-l-4 prose-blockquote:border-vermillion prose-blockquote:bg-vermillion/10 dark:prose-blockquote:bg-vermillion/20
                     prose-blockquote:text-ink dark:prose-blockquote:text-vermillion/70 prose-blockquote:not-italic prose-blockquote:pl-6 prose-blockquote:py-4
                     prose-strong:text-foreground prose-strong:font-bold
                     prose-em:text-foreground prose-em:italic
                     prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
                     prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                     prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
                     prose-hr:border-border prose-hr:my-8
                     prose-table:border-collapse prose-table:border prose-table:border-border prose-table:my-6
                     prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:text-foreground prose-th:font-semibold
                     prose-td:border prose-td:border-border prose-td:p-3 prose-td:text-foreground
                     selection:bg-vermillion/10 dark:selection:bg-vermillion/20
                     text-foreground
                     [&_.ProseMirror]:text-foreground [&_.ProseMirror]:min-h-[380px]
                     [&_.ProseMirror_h1]:text-foreground [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:mb-6
                     [&_.ProseMirror_h2]:text-foreground [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-3
                     [&_.ProseMirror_h3]:text-foreground [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2
                     [&_.ProseMirror_h4]:text-foreground [&_.ProseMirror_h4]:text-lg [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_h4]:mt-3 [&_.ProseMirror_h4]:mb-2
                     [&_.ProseMirror_h5]:text-foreground [&_.ProseMirror_h5]:text-base [&_.ProseMirror_h5]:font-semibold [&_.ProseMirror_h5]:mt-3 [&_.ProseMirror_h5]:mb-1
                     [&_.ProseMirror_h6]:text-foreground [&_.ProseMirror_h6]:text-sm [&_.ProseMirror_h6]:font-semibold [&_.ProseMirror_h6]:uppercase [&_.ProseMirror_h6]:tracking-wide [&_.ProseMirror_h6]:mt-2 [&_.ProseMirror_h6]:mb-1
                     [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6
                     [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6
                     [&_.ProseMirror_li]:text-foreground [&_.ProseMirror_li]:mb-1
                     [&_.ProseMirror_strong]:text-foreground [&_.ProseMirror_strong]:font-bold
                     [&_.ProseMirror_em]:text-foreground [&_.ProseMirror_em]:italic
                     [&_.ProseMirror_p]:text-foreground [&_.ProseMirror_p]:leading-relaxed
                     [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-sm
                     ${focusMode ? 'prose-xl' : ''}`}
        />
        
        {/* Focus Mode Toggle */}
        <button
          onClick={() => setFocusMode(!focusMode)}
          className="absolute top-4 right-4 p-2 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all"
          title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
        >
          {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Status Bar */}
      {!focusMode && (
        <div className="px-6 py-3 bg-muted border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {charCount.toLocaleString()} characters • {wordCount.toLocaleString()} words
              </span>
              
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                ~{estimatedReadingTime} min read
              </span>

              {showWordTarget && wordTarget && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">Target: {wordCount}/{wordTarget}</span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        wordProgress >= 100 ? 'bg-green-500' : wordProgress >= 75 ? 'bg-vermillion' : 'bg-slate-400 dark:bg-slate-500'
                      }`}
                      style={{ width: `${wordProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {autoSave && lastSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <Zap className="w-3 h-3" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Ready to publish
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdvancedNewsEditor);