"use client";

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
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
  ImageIcon,
  Upload,
  X
} from 'lucide-react';

interface BeautifulEditorProps {
  value: string;
  onChange: (html: string, plainText: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

const MenuBar: React.FC<{ editor: any, onImageUpload?: (file: File) => Promise<string> }> = ({ editor, onImageUpload }) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) {
      // Fallback: create object URL for local preview
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

  const buttonClass = (isActive: boolean) =>
    `inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-blue-500 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
    }`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={buttonClass(editor.isActive('bold'))}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={buttonClass(editor.isActive('italic'))}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={buttonClass(editor.isActive('underline'))}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={buttonClass(editor.isActive('strike'))}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={buttonClass(editor.isActive('heading', { level: 2 }))}
            title="Heading 2"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={buttonClass(editor.isActive('heading', { level: 3 }))}
            title="Heading 3"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={buttonClass(editor.isActive('paragraph'))}
            title="Paragraph"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quote */}
        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={buttonClass(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={buttonClass(editor.isActive('orderedList'))}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={buttonClass(editor.isActive('blockquote'))}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={addLink}
            className={buttonClass(editor.isActive('link'))}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={removeLink}
            className={buttonClass(false)}
            title="Remove Link"
          >
            <Unlink className="w-4 h-4" />
          </button>
        </div>

        {/* Images */}
        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={buttonClass(false)}
            title="Upload Image"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowImageDialog(true)}
            className={buttonClass(false)}
            title="Insert Image from URL"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className={buttonClass(false)}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className={buttonClass(false)}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image URL Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insert Image</h3>
              <button
                onClick={() => setShowImageDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleImageFromUrl()}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImageDialog(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageFromUrl}
                  disabled={!imageUrl.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

const BeautifulEditor: React.FC<BeautifulEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Start writing your amazing article...', 
  disabled,
  onImageUpload
}) => {
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
      heading: { levels: [2, 3] },
      codeBlock: false
    }),
    Underline,
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg shadow-md my-4',
      },
    }),
    Link.configure({ 
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 hover:text-blue-800 underline transition-colors'
      }
    }),
    Placeholder.configure({ placeholder })
  ], [placeholder]);

  // Stable onChange callback - now uses ref to avoid dependencies
  const handleUpdate = useCallback(({ editor }: any) => {
    if (isApplyingExternalRef.current) {
      return;
    }
    
    const html = editor.getHTML();
    if (html === lastHtmlRef.current) return;
    
    const text = editor.getText();
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce the onChange callback
    debounceTimerRef.current = setTimeout(() => {
      lastHtmlRef.current = html;
      onChangeRef.current(html, text);
    }, 150);
  }, []); // Empty dependency array - completely stable

  const editor = useEditor({
    extensions,
    content: value || '',
    editable: !disabled,
    autofocus: false,
    immediatelyRender: false,
    onUpdate: handleUpdate
  }, [extensions, disabled]); // Only recreate if extensions or disabled state changes

  // Handle external content changes
  useEffect(() => {
    if (!editor) return;
    
    // Initial load only
    if (!initializedRef.current) {
      if (value) {
        editor.commands.setContent(value, { emitUpdate: false });
        lastHtmlRef.current = value;
      }
      initializedRef.current = true;
      return;
    }

    // Only update if the external value is significantly different from current content
    const currentEditorContent = editor.getHTML();
    if (value && value !== lastHtmlRef.current && value !== currentEditorContent && value.trim() !== currentEditorContent.trim()) {
      isApplyingExternalRef.current = true;
      editor.commands.setContent(value, { emitUpdate: false });
      lastHtmlRef.current = value;
      // Reset the flag after a short delay
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  if (!editor) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading beautiful editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="prose dark:prose-invert prose-lg max-w-none p-6 min-h-[320px] max-h-[600px] overflow-y-auto focus:outline-none
                     prose-headings:text-foreground prose-headings:font-bold prose-headings:leading-tight
                     prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                     prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                     prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                     prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                     prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                     prose-li:text-foreground prose-li:mb-1 prose-li:leading-relaxed
                     prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:no-underline
                     prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/10
                     prose-blockquote:text-blue-900 dark:prose-blockquote:text-blue-200 prose-blockquote:not-italic prose-blockquote:pl-6 prose-blockquote:py-2
                     prose-strong:text-foreground prose-strong:font-bold
                     prose-em:text-foreground prose-em:italic
                     prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
                     prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-md prose-img:my-4
                     selection:bg-blue-100 dark:selection:bg-blue-900/30
                     [&_.ProseMirror]:text-foreground [&_.ProseMirror]:min-h-[280px]
                     [&_.ProseMirror_h2]:text-foreground [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-3
                     [&_.ProseMirror_h3]:text-foreground [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2
                     [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6
                     [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6
                     [&_.ProseMirror_li]:text-foreground [&_.ProseMirror_li]:mb-1
                     [&_.ProseMirror_strong]:text-foreground [&_.ProseMirror_strong]:font-bold
                     [&_.ProseMirror_em]:text-foreground [&_.ProseMirror_em]:italic
                     [&_.ProseMirror_p]:text-foreground [&_.ProseMirror_p]:leading-relaxed"
        />
      </div>
      
      {/* Character count and status */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {editor.getText().length} characters • {editor.getText().split(/\s+/).filter(w => w.length).length} words
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Ready to publish
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BeautifulEditor);