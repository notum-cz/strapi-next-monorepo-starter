import { PLUGIN_ID } from '../../../shared/pluginId';
import { RICH_TEXT_FIELD_NAME } from '../../../shared/fields';
// Doesn't work with this monorepo composition for some reason
// import { CustomFieldServerOptions } from '@strapi/types/dist/modules/custom-fields';

type CustomFieldServerOptions = any;

export const richTextField: CustomFieldServerOptions = {
  name: RICH_TEXT_FIELD_NAME,
  plugin: PLUGIN_ID,
  type: 'text',
  inputSize: {
    default: 12,
    isResizable: true,
  },
};
