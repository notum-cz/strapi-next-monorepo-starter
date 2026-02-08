/**
 * Application methods
 */
import bootstrap from './bootstrap';
import destroy from './destroy';
import register from './register';

/**
 * Plugin server methods
 */
import config from './config';
import contentTypes from './content-types';
import controllers from './controllers';
import middlewares from './middlewares';
import policies from './policies';
import routes from './routes';
import services from './services';

export default {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares,
} as any;

/**
 * [ERROR]  server/src/index.ts:19:1 - TS2742: The inferred type of 'default' cannot be named without a reference to '@strapi/core/node_modules/@strapi/types/dist/core'. This is likely not portable. A type annotation is necessary.
 */
