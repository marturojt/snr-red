module.exports = {
  apps: [{
    name: 'snr-red-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/snr-red/apps/frontend',
    instances: 1,
    exec_mode: 'fork',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'https://api.snr.red',
      NEXT_PUBLIC_APP_URL: 'https://snr.red'
    },
    
    // Logs
    log_file: '/var/log/snr-red/frontend-combined.log',
    out_file: '/var/log/snr-red/frontend-out.log',
    error_file: '/var/log/snr-red/frontend-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Restart settings
    watch: false,
    max_memory_restart: '300M',
    restart_delay: 4000,
    
    // Health monitoring
    min_uptime: '10s',
    max_restarts: 10,
    
    // Advanced settings
    kill_timeout: 5000,
    wait_ready: false,
    listen_timeout: 8000
  }]
};
