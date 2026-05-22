module.exports = {
  apps: [
    {
      name: 'metapharsic-todo',
      script: './backend/server.js',
      cwd: '/u01/apps/metapharisc_todo',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_USER: 'postgres',
        DB_HOST: 'localhost',
        DB_NAME: 'metapharsic_todo_db',
        DB_PASSWORD: 'admin',
        DB_PORT: 5432
      }
    }
  ]
};
