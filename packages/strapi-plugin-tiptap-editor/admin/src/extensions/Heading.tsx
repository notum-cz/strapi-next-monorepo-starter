import { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import Heading from '@tiptap/extension-heading';
import { SingleSelect, SingleSelectOption } from '@strapi/design-system';

// Extend Heading to add 'tag' attribute for semantic HTML tag choice for SEO purposes
export const HeadingWithSEOTag = Heading.extend({
  addAttributes() {
    return {
      ...(this as any).parent?.(), // must cast to any to avoid TS error
      tag: { default: null },
    };
  },
}).configure({ levels: [1, 2, 3, 4] });

export function useHeading(editor: Editor, props: { disabled?: boolean } = { disabled: false }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        headingLevel: ctx.editor.getAttributes('heading').level as number | undefined,
        headingTag: ctx.editor.getAttributes('heading').tag as string | undefined,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
      };
    },
  });

  const onChangeHeading = (value: string) => {
    if (!editor) return;
    editor.chain().focus();

    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
      return;
    }

    const level = Number(value[1]) as 1 | 2 | 3 | 4; // value format: h1, h2, h3, h4
    editor.chain().focus().setHeading({ level }).run();

    // automatically set the 'tag' attribute to match the heading level if not already set
    if (!editorState.headingTag) {
      editor
        .chain()
        .focus()
        .updateAttributes('heading', { tag: `h${level}` })
        .run();
    }
  };

  const onChangeHeadingTag = (value: string) => {
    if (!editor) return;
    if (!editorState.headingLevel) return;
    editor.chain().focus().updateAttributes('heading', { tag: value }).run();
  };

  return {
    headingSelect: (
      <SingleSelect
        placeholder="Style"
        aria-label="Text style"
        value={editorState.headingLevel ? `h${editorState.headingLevel}` : 'p'}
        onChange={(v: string | undefined) => v && onChangeHeading(v)}
        disabled={!editor || props.disabled}
        size="S"
      >
        <SingleSelectOption value="p">Paragraph</SingleSelectOption>
        <SingleSelectOption value="h1">Heading 1</SingleSelectOption>
        <SingleSelectOption value="h2">Heading 2</SingleSelectOption>
        <SingleSelectOption value="h3">Heading 3</SingleSelectOption>
        <SingleSelectOption value="h4">Heading 4</SingleSelectOption>
      </SingleSelect>
    ),
    headingTagSelect: (
      <SingleSelect
        placeholder="SEO Tag"
        aria-label="Heading's HTML tag for SEO purposes"
        value={editorState.headingTag}
        onChange={(v: string | undefined) => v && onChangeHeadingTag(v)}
        disabled={!editor || props.disabled || !editorState.headingLevel}
        size="S"
      >
        <SingleSelectOption value="h1">h1</SingleSelectOption>
        <SingleSelectOption value="h2">h2</SingleSelectOption>
        <SingleSelectOption value="h3">h3</SingleSelectOption>
        <SingleSelectOption value="h4">h4</SingleSelectOption>
        <SingleSelectOption value="h5">h5</SingleSelectOption>
        <SingleSelectOption value="h6">h6</SingleSelectOption>
      </SingleSelect>
    ),
  };
}
