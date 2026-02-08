import { type InputProps, useField } from '@strapi/strapi/admin';
import { Box, Button, Field, Flex, Tooltip } from '@strapi/design-system';
import { Italic } from '@strapi/icons';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { Mark } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { forwardRef } from 'react';

// Custom extension for accent-cursive text
const AccentCursive = Mark.create({
  name: 'accentCursive',

  addAttributes() {
    return {
      class: {
        default: 'accent-cursive',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.accent-cursive',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { ...HTMLAttributes, class: 'accent-cursive' }, 0];
  },
});

// Add custom styles for the accent-cursive class
const editorStyles = `

  /* --- Only Cursive --- */
  /* How the only cursive text looks like in editor */

  .only-cursive {
    font-style: italic;
    font-weight: bold;
  }

  /* Increase editor font size to match Strapi default */
  .ProseMirror {
    font-size: 1.4rem;
    outline: none;
  }

  /* Style for toolbar formatting toggle buttons */
  .format-button {
    background: rgba(0, 0, 0, 0.05);
  }

  .format-button:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .format-button.is-active {
    color: #0c75af;
    background: rgba(12, 117, 175, 0.3);
  }
`;

type TiptapInputProps = InputProps & {
  labelAction?: React.ReactNode;
};

const TiptapInput = forwardRef<HTMLDivElement, TiptapInputProps>(
  ({ hint, disabled = false, labelAction, label, name, required = false }, forwardedRef) => {
    const field = useField(name);

    // Parse JSON if string is provided, or use default content
    const getInitialContent = () => {
      if (!field.value) {
        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '' }],
            },
          ],
        };
      }

      try {
        return typeof field.value === 'string' ? JSON.parse(field.value) : field.value;
      } catch (e) {
        console.error('Failed to parse JSON content:', e);
        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text:
                    "This component's content is malformed. Please change it or remove this component. Original content: " +
                    JSON.stringify(field.value),
                },
              ],
            },
          ],
        };
      }
    };

    const editor = useEditor({
      extensions: [Document, Paragraph, Text, AccentCursive],
      content: getInitialContent(),
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        field.onChange(name, JSON.stringify(json));
      },
    });

    // Use useEditorState to track the state of accent-cursive formatting
    const editorState = useEditorState({
      editor,
      selector: (ctx) => {
        return {
          isAccentCursive: ctx.editor.isActive('accentCursive') ?? false,
          canToggleAccentCursive:
            ctx.editor.can().chain().toggleMark('accentCursive').run() ?? false,
        };
      },
    });

    const toggleAccentCursive = () => {
      editor?.chain().focus().toggleMark('accentCursive').run();
    };

    return (
      <Field.Root name={name} id={name} hint={hint} error={field.error} required={required}>
        <style>{editorStyles}</style>
        <Field.Label action={labelAction}>{label}</Field.Label>

        <Box className="editor-toolbar">
          <Flex>
            <Tooltip description="Accent Cursive">
              <Button
                onClick={toggleAccentCursive}
                variant="tertiary"
                size="S"
                disabled={!editor || !editorState?.canToggleAccentCursive || disabled}
                className={`format-button ${editorState?.isAccentCursive ? 'is-active' : ''}`}
                style={{
                  color: editorState?.isAccentCursive ? '#0c75af' : undefined,
                }}
              >
                <Italic />
              </Button>
            </Tooltip>
          </Flex>
        </Box>

        <Box
          hasRadius
          borderColor={field.error ? 'danger600' : 'neutral200'}
          background={disabled ? 'neutral100' : 'neutral0'}
          paddingTop={3}
          paddingBottom={3}
          paddingLeft={4}
          paddingRight={4}
        >
          <EditorContent editor={editor} disabled={disabled} ref={forwardedRef} />
        </Box>
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  }
);

export default TiptapInput;
