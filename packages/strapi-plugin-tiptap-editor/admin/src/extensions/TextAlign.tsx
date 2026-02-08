import { Editor, Mark } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import { TextAlignLeft } from '../icons/TextAlignLeft';
import { TextAlignJustify } from '../icons/TextAlignJustify';
import { TextAlignRight } from '../icons/TextAlignRight';
import { TextAlignCenter } from '../icons/TextAlignCenter';
import { ToolbarButton } from '../components/ToolbarButton';

type TextAlign = 'left' | 'center' | 'right' | 'justify';

export function useTextAlign(editor: Editor, props: { disabled?: boolean } = { disabled: false }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isTextAlignLeft: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
        isTextAlignRight: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
        isTextAlignCenter: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
        isTextAlignJustify: ctx.editor.isActive({ textAlign: 'justify' }) ?? false,
        canToggleAlign: ctx.editor.can().chain().setTextAlign('left').run() ?? false,
      };
    },
  });

  const setTextAlign = (alignment: TextAlign) => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  return {
    textAlignLeftButton: (
      <ToolbarButton
        key="text-align-left"
        onClick={() => setTextAlign('left')}
        icon={<TextAlignLeft />}
        active={editorState.isTextAlignLeft}
        disabled={props.disabled || !editor || !editorState.canToggleAlign}
        tooltip={'Text Align Left'}
      />
    ),
    textAlignCenterButton: (
      <ToolbarButton
        key="text-align-center"
        onClick={() => setTextAlign('center')}
        icon={<TextAlignCenter />}
        active={editorState.isTextAlignCenter}
        disabled={props.disabled || !editor || !editorState.canToggleAlign}
        tooltip={'Text Align Center'}
      />
    ),
    textAlignRightButton: (
      <ToolbarButton
        key="text-align-right"
        onClick={() => setTextAlign('right')}
        icon={<TextAlignRight />}
        active={editorState.isTextAlignRight}
        disabled={props.disabled || !editor || !editorState.canToggleAlign}
        tooltip={'Text Align Right'}
      />
    ),
    textAlignJustifyButton: (
      <ToolbarButton
        key="text-align-justify"
        onClick={() => setTextAlign('justify')}
        icon={<TextAlignJustify />}
        active={editorState.isTextAlignJustify}
        disabled={props.disabled || !editor || !editorState.canToggleAlign}
        tooltip={'Text Align Justify'}
      />
    ),
  };
}
