import { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { ToolbarButton } from '../components/ToolbarButton';

export function useScript(editor: Editor, props: { disabled?: boolean } = { disabled: false }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isSuperscript: ctx.editor.isActive('superscript') ?? false,
        canToggleSuperscript: ctx.editor.can().chain().toggleSuperscript().run() ?? false,
        isSubscript: ctx.editor.isActive('subscript') ?? false,
        canToggleSubscript: ctx.editor.can().chain().toggleSubscript().run() ?? false,
      };
    },
  });

  const toggleSuperscript = () => {
    editor?.chain().focus().toggleSuperscript().run();
  };

  const toggleSubscript = () => {
    editor?.chain().focus().toggleSubscript().run();
  };

  return {
    superscriptButton: (
      <ToolbarButton
        key="superscript"
        onClick={toggleSuperscript}
        icon={
          <>
            x<sup>2</sup>
          </>
        }
        active={editorState.isSuperscript}
        disabled={props.disabled || !editor || !editorState.canToggleSuperscript}
        tooltip="Superscript"
      />
    ),
    subscriptButton: (
      <ToolbarButton
        key="subscript"
        onClick={toggleSubscript}
        icon={
          <>
            x<sub>2</sub>
          </>
        }
        active={editorState.isSubscript}
        disabled={props.disabled || !editor || !editorState.canToggleSubscript}
        tooltip="Subscript"
      />
    ),
  };
}
