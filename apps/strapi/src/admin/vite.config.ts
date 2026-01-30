import { mergeConfig, type UserConfig } from "vite";

export default (config: UserConfig): UserConfig => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      hmr: false,
    },
  });
};
