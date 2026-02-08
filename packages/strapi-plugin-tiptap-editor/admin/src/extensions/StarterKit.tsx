import { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import {
  Bold as BoldIcon,
  BulletList as BulletListIcon,
  Code as CodeIcon,
  Italic as ItalicIcon,
  NumberList as NumberListIcon,
  Quotes as QuotesIcon,
  StrikeThrough as StrikeThroughIcon,
  Underline as UnderlineIcon,
} from '@strapi/icons';
import { ToolbarButton } from '../components/ToolbarButton';

export function useStarterKit(editor: Editor, props: { disabled?: boolean } = { disabled: false }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isUnderline: ctx.editor.isActive('underline') ?? false,
        canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        canToggleBulletList: ctx.editor.can().chain().toggleBulletList().run() ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        canToggleOrderedList: ctx.editor.can().chain().toggleOrderedList().run() ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canToggleBlockquote: ctx.editor.can().chain().toggleBlockquote().run() ?? false,
      };
    },
  });

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const toggleCode = () => editor?.chain().focus().toggleCode().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();

  return {
    boldButton: (
      <ToolbarButton
        key="bold"
        onClick={toggleBold}
        icon={<BoldIcon />}
        active={editorState.isBold}
        disabled={props.disabled || !editor || !editorState.canBold}
        tooltip="Bold"
      />
    ),
    italicButton: (
      <ToolbarButton
        key="italic"
        onClick={toggleItalic}
        icon={<ItalicIcon />}
        active={editorState.isItalic}
        disabled={props.disabled || !editor || !editorState.canItalic}
        tooltip="Italic"
      />
    ),
    underlineButton: (
      <ToolbarButton
        key="underline"
        onClick={toggleUnderline}
        icon={<UnderlineIcon />}
        active={editorState.isUnderline}
        disabled={props.disabled || !editor || !editorState.canUnderline}
        tooltip="Underline"
      />
    ),
    strikeButton: (
      <ToolbarButton
        key="strike"
        onClick={toggleStrike}
        icon={<StrikeThroughIcon />}
        active={editorState.isStrike}
        disabled={props.disabled || !editor || !editorState.canStrike}
        tooltip="Strikethrough"
      />
    ),
    bulletButton: (
      <ToolbarButton
        key="bullet"
        onClick={toggleBulletList}
        icon={<BulletListIcon />}
        active={editorState.isBulletList}
        disabled={props.disabled || !editor || !editorState.canToggleBulletList}
        tooltip="Bullet list"
      />
    ),
    orderedButton: (
      <ToolbarButton
        key="ordered"
        onClick={toggleOrderedList}
        icon={<NumberListIcon />}
        active={editorState.isOrderedList}
        disabled={props.disabled || !editor || !editorState.canToggleOrderedList}
        tooltip="Numbered list"
      />
    ),
    codeButton: (
      <ToolbarButton
        key="code"
        onClick={toggleCode}
        icon={<CodeIcon />}
        active={editorState.isCode}
        disabled={props.disabled || !editor || !editorState.canCode}
        tooltip="Inline code"
      />
    ),
    blockquoteButton: (
      <ToolbarButton
        key="blockquote"
        onClick={toggleBlockquote}
        icon={<QuotesIcon />}
        active={editorState.isBlockquote}
        disabled={props.disabled || !editor || !editorState.canToggleBlockquote}
        tooltip="Quote"
      />
    ),
  };
}
