module.exports = {
  apps: [
    {
      name: 'metapharsic-todo-backend',
      script: './backend/server.js',
      cwd: '/u01/apps/metapharsic_todo',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/u01/apps/metapharsic_todo/logs/err.log',
      out_file: '/u01/apps/metapharsic_todo/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
