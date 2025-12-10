/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Menubar } from "./Menubar";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useRef } from "react";

export function RichTextEditor({ field }: { field: any }) {
  const isUpdatingFromExternal = useRef(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    editorProps: {
      attributes: {
        class:
          "min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
      },
    },

    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      // Only update form if the change is from user interaction, not from external update
      if (!isUpdatingFromExternal.current) {
        field.onChange(JSON.stringify(editor.getJSON()));
      }
    },

    content: field.value ? (() => {
      try {
        // Try to parse as JSON first (TipTap JSON format)
        const parsed = typeof field.value === 'string' ? JSON.parse(field.value) : field.value;
        // Check if it's TipTap JSON (has 'type' property)
        if (parsed && typeof parsed === 'object' && 'type' in parsed) {
          return parsed;
        }
        // If not JSON, treat as HTML string (TipTap can parse HTML)
        return field.value;
      } catch {
        // If JSON parsing fails, treat as HTML string
        return field.value || "<p></p>";
      }
    })() : "<p></p>",
  });

  // Update editor content when field value changes externally (e.g., from AI generation)
  useEffect(() => {
    if (!editor) return;
    
    if (field.value) {
      try {
        // Try to parse as JSON first
        let contentToSet: any = field.value;
        if (typeof field.value === 'string') {
          try {
            const parsed = JSON.parse(field.value);
            // Check if it's TipTap JSON format
            if (parsed && typeof parsed === 'object' && 'type' in parsed) {
              contentToSet = parsed;
            } else {
              // Not JSON, treat as HTML
              contentToSet = field.value;
            }
          } catch {
            // Not JSON, treat as HTML string
            contentToSet = field.value;
          }
        }

        const currentContent = editor.getJSON();
        const currentContentStr = JSON.stringify(currentContent);
        
        // For HTML strings, we need to compare differently
        let shouldUpdate = true;
        if (typeof contentToSet === 'string' && contentToSet.startsWith('<')) {
          // It's HTML, always update (TipTap will parse it)
          shouldUpdate = true;
        } else {
          const newContentStr = JSON.stringify(contentToSet);
          shouldUpdate = currentContentStr !== newContentStr;
        }
        
        if (shouldUpdate) {
          isUpdatingFromExternal.current = true;
          editor.commands.setContent(contentToSet);
          // Reset flag after a brief delay to allow the update to complete
          setTimeout(() => {
            isUpdatingFromExternal.current = false;
          }, 100);
        }
      } catch (error) {
        console.error("Error updating editor content:", error);
        // Fallback: set as HTML
        if (typeof field.value === 'string') {
          isUpdatingFromExternal.current = true;
          editor.commands.setContent(field.value);
          setTimeout(() => {
            isUpdatingFromExternal.current = false;
          }, 100);
        }
      }
    }
  }, [field.value, editor]);

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
