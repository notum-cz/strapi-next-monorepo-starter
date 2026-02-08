import { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import { Link as LinkIcon } from '@strapi/icons';
import LinkDialog, { LinkDialogPayload } from '../components/LinkDialog';
import { useRef, useState } from 'react';
import { ToolbarButton } from '../components/ToolbarButton';

export function useLink(editor: Editor, props: { disabled?: boolean } = { disabled: false }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isLink: ctx.editor.isActive('link') ?? false,
        canSetLink: ctx.editor.can().setLink?.({ href: 'https://example.com' }) ?? true,
      };
    },
  });

  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState<string>('');
  const [linkDialogMode, setLinkDialogMode] = useState<'add' | 'edit'>('add');
  const selectionRef = useRef<{ from: number; to: number } | null>(null);

  const openAddLinkDialog = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    selectionRef.current = { from, to };
    setCurrentLinkUrl('');
    setLinkDialogMode('add');
    setShowLinkDialog(true);
  };

  const openEditLinkDialog = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    selectionRef.current = { from, to };
    const currentHref = (editor.getAttributes('link').href as string | undefined) || '';
    setCurrentLinkUrl(currentHref);
    setLinkDialogMode('edit');
    setShowLinkDialog(true);
  };

  const toggleLink = () => {
    if (!editor) return;
    if (editorState.isLink) {
      openEditLinkDialog();
    } else {
      openAddLinkDialog();
    }
  };

  const restoreSelection = () => {
    if (!editor) return;
    const sel = selectionRef.current;
    if (sel) {
      editor.chain().setTextSelection({ from: sel.from, to: sel.to }).run();
    }
  };

  const handleSaveEditedLink = ({ url }: LinkDialogPayload) => {
    if (!editor) return;
    restoreSelection();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (url === '') {
      chain.unsetLink().run();
    } else {
      // updateAttributes ensures existing link mark is updated instead of creating a new one
      chain.updateAttributes('link', { href: url }).run();
    }
    setShowLinkDialog(false);
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    restoreSelection();
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkDialog(false);
  };

  const handleSaveNewLink = ({ url }: LinkDialogPayload) => {
    if (!editor) return;
    restoreSelection();
    editor.chain().focus().setLink({ href: url }).run();
    setShowLinkDialog(false);
  };

  return {
    linkButton: (
      <ToolbarButton
        key="link"
        onClick={toggleLink}
        icon={<LinkIcon />}
        active={editorState.isLink}
        disabled={props.disabled || !editor || !editorState.canSetLink}
        tooltip={editorState.isLink ? 'Edit or remove link' : 'Add link'}
      />
    ),
    linkDialog: (
      <LinkDialog
        open={showLinkDialog}
        url={currentLinkUrl}
        mode={linkDialogMode}
        onClose={() => setShowLinkDialog(false)}
        onSave={linkDialogMode === 'add' ? handleSaveNewLink : handleSaveEditedLink}
        onRemove={handleRemoveLink}
      />
    ),
  };
}
