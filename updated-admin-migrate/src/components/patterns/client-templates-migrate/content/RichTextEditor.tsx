"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";

export type RichTextEditorProps = {
  label?: string;
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Chrome-less variant: no border/background, fills its container. For a large composer-style body field. */
  bare?: boolean;
};

export function RichTextEditor({ label, content, onChange, placeholder, bare = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: content || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        style: bare
          ? "min-height: 100%; outline: none; font-size: 14px; line-height: 22px;"
          : "min-height: 160px; outline: none; font-size: 13px; line-height: 20px;",
        "data-placeholder": placeholder ?? "",
      },
    },
  });

  const toolbar = (
    <div
      style={{
        display: "flex",
        gap: 2,
        padding: 4,
        borderBottom: bare ? "none" : "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      <IconButton
        label="Bold"
        variant="ghost"
        size="sm"
        icon={<Bold size={14} strokeWidth={1.75} />}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      />
      <IconButton
        label="Italic"
        variant="ghost"
        size="sm"
        icon={<Italic size={14} strokeWidth={1.75} />}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      />
      <IconButton
        label="Bullet list"
        variant="ghost"
        size="sm"
        icon={<List size={14} strokeWidth={1.75} />}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      />
      <IconButton
        label="Numbered list"
        variant="ghost"
        size="sm"
        icon={<ListOrdered size={14} strokeWidth={1.75} />}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      />
    </div>
  );

  if (bare) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "var(--linear-color-ink)" }}>
        {toolbar}
        <div style={{ flex: 1, minHeight: 0, paddingTop: 8 }}>
          <EditorContent editor={editor} style={{ height: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label ? <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span> : null}
      <div
        style={{
          boxSizing: "border-box",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          borderRadius: 6,
          background: "var(--linear-color-canvas)",
          color: "var(--linear-color-ink)",
        }}
      >
        {toolbar}
        <div style={{ padding: 8 }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
