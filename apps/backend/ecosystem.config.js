module.exports = {
  apps: [{
    name: 'snr-red-api',
    script: 'dist/index.js',
    cwd: '/var/www/snr-red/apps/backend',
    instances: 2, // Ajusta según cores de CPU disponibles
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      MONGODB_URI: 'mongodb://localhost:27017/snr-red-prod',
      BASE_URL: 'https://snr.red',
      FRONTEND_URL: 'https://snr.red'
    },
    
    // Logs
    log_file: '/var/log/snr-red/combined.log',
    out_file: '/var/log/snr-red/out.log',
    error_file: '/var/log/snr-red/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Restart settings
    watch: false,
    ignore_watch: ['node_modules', 'uploads'],
    max_memory_restart: '500M',
    restart_delay: 4000,
    
    // Health monitoring
    min_uptime: '10s',
    max_restarts: 10,
    
    // Advanced settings
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000
  }]
};
