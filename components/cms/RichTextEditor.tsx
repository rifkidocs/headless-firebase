"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  Code2,
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-gray-900",
      },
    },
  });

  if (!isMounted || !editor) {
    return (
      <div
        className={clsx(
          "border border-gray-300 rounded-lg overflow-hidden h-[250px] bg-gray-50 flex items-center justify-center text-gray-400 text-sm",
          className
        )}>
        Loading editor...
      </div>
    );
  }

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div
      className={clsx(
        "border border-gray-300 rounded-lg overflow-hidden",
        className
      )}>
      {/* Toolbar */}
      <div className='bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1'>
        {/* Text formatting */}
        <div className='flex items-center gap-0.5 pr-2 border-r border-gray-200'>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title='Bold'>
            <Bold className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title='Italic'>
            <Italic className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title='Strikethrough'>
            <Strikethrough className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title='Inline Code'>
            <Code className='w-4 h-4' />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className='flex items-center gap-0.5 px-2 border-r border-gray-200'>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            title='Heading 1'>
            <Heading1 className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            title='Heading 2'>
            <Heading2 className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
            title='Heading 3'>
            <Heading3 className='w-4 h-4' />
          </ToolbarButton>
        </div>

        {/* Lists and blocks */}
        <div className='flex items-center gap-0.5 px-2 border-r border-gray-200'>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title='Bullet List'>
            <List className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title='Numbered List'>
            <ListOrdered className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title='Quote'>
            <Quote className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title='Code Block'>
            <Code2 className='w-4 h-4' />
          </ToolbarButton>
        </div>

        {/* Insert */}
        <div className='flex items-center gap-0.5 px-2 border-r border-gray-200'>
          <ToolbarButton
            onClick={addLink}
            active={editor.isActive("link")}
            title='Add Link'>
            <Link className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title='Add Image'>
            <ImageIcon className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title='Horizontal Rule'>
            <Minus className='w-4 h-4' />
          </ToolbarButton>
        </div>

        {/* History */}
        <div className='flex items-center gap-0.5 px-2'>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title='Undo'>
            <Undo className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title='Redo'>
            <Redo className='w-4 h-4' />
          </ToolbarButton>
        </div>
      </div>

      {/* Bubble Menu */}
      {editor && (
        <BubbleMenu editor={editor}>
          <div className='bg-gray-900 rounded-lg shadow-lg flex items-center gap-0.5 p-1'>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}>
              <Bold className='w-3.5 h-3.5' />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}>
              <Italic className='w-3.5 h-3.5' />
            </BubbleButton>
            <BubbleButton onClick={addLink} active={editor.isActive("link")}>
              <Link className='w-3.5 h-3.5' />
            </BubbleButton>
          </div>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "p-1.5 rounded transition-colors",
        active
          ? "bg-gray-200 text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
      {children}
    </button>
  );
}

function BubbleButton({ onClick, active, children }: ToolbarButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={clsx(
        "p-1.5 rounded transition-colors",
        active
          ? "bg-white/20 text-white"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      )}>
      {children}
    </button>
  );
}
