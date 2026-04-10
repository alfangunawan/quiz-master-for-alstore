module.exports = {
  apps: [
    {
      name: "quizmaster",
      script: "node_modules/.bin/next",
      args: "start -p 3002",
      cwd: "/var/www/quiz-alstore",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      error_file: "/var/www/quiz-alstore/logs/error.log",
      out_file: "/var/www/quiz-alstore/logs/output.log",
      merge_logs: true,
      time: true,
    },
  ],
};
