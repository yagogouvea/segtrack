module.exports = {
  apps: [{
    name: 'segtrack-backend',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
}; 