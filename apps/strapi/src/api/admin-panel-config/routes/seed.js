module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/seed',
      handler: 'seed.seed',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
