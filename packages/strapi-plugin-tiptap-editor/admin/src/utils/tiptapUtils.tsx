import { Extensions, JSONContent } from '@tiptap/core';
import { useEditor } from '@tiptap/react';
import { type InputProps, useField } from '@strapi/strapi/admin';
import { Button, Tooltip } from '@strapi/design-system';

export interface FieldValue<TValue = any> {
  error?: string;
  initialValue: TValue;
  onChange: (eventOrPath: React.ChangeEvent<any> | string, value?: TValue) => void;
  value: TValue;
  rawError?: any;
}

export type TiptapInputProps = InputProps & {
  labelAction?: React.ReactNode;
};

export function tiptapContent(text: string): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      },
    ],
  };
}

function parseJSONContent(value: any, defaultValue: string) {
  if (!value) {
    return tiptapContent(defaultValue);
  }

  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (e) {
    console.error('Failed to parse JSON content:', e);
    return tiptapContent(`
          This component's content is malformed. Please change it or remove this component.
          Original content: ${JSON.stringify(value)}
        `);
  }
}

export function useTiptapEditor(
  name: string,
  defaultValue: string = '',
  extensions: Extensions = []
) {
  const field = useField(name);

  const editor = useEditor({
    extensions: extensions,
    content: parseJSONContent(field.value, defaultValue),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      field.onChange(name, JSON.stringify(json));
    },
  });

  return { editor, field };
}
