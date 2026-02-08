import type { Core } from '@strapi/strapi';

import { richTextField } from './fields/richTextField';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register(richTextField);
};

export default register;
