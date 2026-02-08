import { PLUGIN_ID } from '../../../shared/pluginId';
import { Paragraph } from '@strapi/icons';
import { ComponentType } from 'react';
import { RICH_TEXT_FIELD_NAME } from '../../../shared/fields';

export const richTextField = {
  name: RICH_TEXT_FIELD_NAME,
  pluginId: PLUGIN_ID,
  type: 'string',
  intlLabel: {
    id: 'tiptap-editor.richText.label',
    defaultMessage: 'Rich Text (Tiptap)',
  },
  intlDescription: {
    id: 'tiptap-editor.richText.description',
    defaultMessage: 'Use this field to create formatted text via Tiptap editor.',
  },
  icon: Paragraph as ComponentType<any>, // cast to any to avoid some weird non-exported type issue during build
  components: {
    Input: async () => import('../components/RichTextInput').then((m) => ({ default: m.default })),
  },
};
