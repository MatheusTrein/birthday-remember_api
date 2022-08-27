module.exports = {
  apps: [
    {
      name: "birthday-remember_api",
      instances: "1",
      script: "./dist/shared/infra/http/server.js",
      autorestart: true,
      args: "runtime",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "birthday-remember_queue",
      instances: "1",
      script: "./dist/shared/infra/queue/index.js",
      autorestart: true,
      args: "runtime",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
