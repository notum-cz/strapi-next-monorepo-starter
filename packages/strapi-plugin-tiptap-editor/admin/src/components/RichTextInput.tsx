import BaseTiptapInput from './BaseTiptapInput';
import { TiptapInputProps, useTiptapEditor } from '../utils/tiptapUtils';
import StarterKit from '@tiptap/starter-kit';
import { Spacer } from './Spacer';
import { useStarterKit } from '../extensions/StarterKit';
import { useLink } from '../extensions/Link';
import { HeadingWithSEOTag, useHeading } from '../extensions/Heading';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { useScript } from '../extensions/Script';
import { TableKit } from '@tiptap/extension-table';
import { Gapcursor } from '@tiptap/extensions';
import { useTable } from '../extensions/Table';
import { forwardRef } from 'react';
import TextAlign from '@tiptap/extension-text-align';
import { useTextAlign } from '../extensions/TextAlign';

const extensions = [
  StarterKit.configure({
    heading: false, // disable default so we can use our custom version
    link: {
      openOnClick: false,
    },
  }),
  HeadingWithSEOTag,

  Superscript,
  Subscript,
  Gapcursor, // cursor for resizing tables
  TableKit.configure({
    table: { resizable: true },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
];

const RichTextInput = forwardRef<HTMLDivElement, TiptapInputProps>((props, forwardedRef) => {
  const { editor, field } = useTiptapEditor(props.name, '', extensions);

  const starterKit = useStarterKit(editor, { disabled: props.disabled });
  const heading = useHeading(editor, { disabled: props.disabled });

  const link = useLink(editor, { disabled: props.disabled });
  const script = useScript(editor, { disabled: props.disabled });
  const table = useTable(editor, { disabled: props.disabled });
  const textAlign = useTextAlign(editor, { disabled: props.disabled });

  return (
    <BaseTiptapInput editor={editor} field={field} {...props} ref={forwardedRef}>
      {heading.headingSelect}
      {heading.headingTagSelect}
      <Spacer width={8} />
      {starterKit.boldButton}
      {starterKit.italicButton}
      {starterKit.underlineButton}
      {starterKit.strikeButton}
      {script.superscriptButton}
      {script.subscriptButton}
      <Spacer width={8} />
      {textAlign.textAlignLeftButton}
      {textAlign.textAlignCenterButton}
      {textAlign.textAlignRightButton}
      {textAlign.textAlignJustifyButton}
      <Spacer width={8} />
      {starterKit.bulletButton}
      {starterKit.orderedButton}
      <Spacer width={8} />
      {starterKit.codeButton}
      {starterKit.blockquoteButton}
      {link.linkButton}
      {link.linkDialog}
      <Spacer width={8} />
      {table.tableButton}
      {table.addColumnButton}
      {table.removeColumnButton}
      {table.addRowButton}
      {table.removeRowButton}
      {table.tableDialog}
    </BaseTiptapInput>
  );
});

export default RichTextInput;
