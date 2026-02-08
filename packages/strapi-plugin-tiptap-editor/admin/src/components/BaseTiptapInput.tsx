import { type InputProps } from '@strapi/strapi/admin';
import { Box, Field, Flex } from '@strapi/design-system';
import { EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { TiptapInputStyles } from './TiptapInputStyles';
import { FieldValue } from '../utils/tiptapUtils';
import { forwardRef } from 'react';

type TiptapInputProps = InputProps & {
  labelAction?: React.ReactNode;
  editor: Editor;
  field: FieldValue;
  children?: React.ReactNode;
};

const BaseTiptapInput = forwardRef<HTMLDivElement, TiptapInputProps>(
  (
    { hint, disabled = false, labelAction, label, name, required = false, editor, field, children },
    forwardedRef
  ) => {
    const borderColor = field.error ? 'danger600' : 'neutral200';
    const background = disabled ? 'neutral200' : 'neutral100';

    return (
      <Field.Root name={name} id={name} hint={hint} error={field.error} required={required}>
        <Field.Label action={labelAction}>{label}</Field.Label>

        <TiptapInputStyles>
          <Box
            className={`tiptap-editor-wrapper ${field.error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}
            hasRadius
            borderColor={borderColor}
            background={background}
            paddingTop={1}
            paddingBottom={0}
            paddingLeft={0}
            paddingRight={0}
          >
            <Box className="editor-toolbar" paddingLeft={2} paddingRight={2} paddingBottom={2}>
              <Flex gap={1} wrap="wrap">
                {children}
              </Flex>
            </Box>
            <Box
              className="editor-content"
              background="neutral0"
              paddingTop={2}
              paddingBottom={2}
              paddingLeft={2}
              paddingRight={2}
            >
              <EditorContent editor={editor} disabled={disabled} ref={forwardedRef} />
            </Box>
          </Box>
        </TiptapInputStyles>

        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  }
);

export default BaseTiptapInput;
