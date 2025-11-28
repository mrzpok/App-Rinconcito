module.exports = {
  apps: [
    {
      name: 'rinconcito',
      cwd: '/home/staff.rinconcito.co/public_html',
      script: './node_modules/.bin/next',
      args: 'start -p 3002',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/home/staff.rinconcito.co/public_html/logs/error.log',
      out_file: '/home/staff.rinconcito.co/public_html/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs', '.git'],
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
