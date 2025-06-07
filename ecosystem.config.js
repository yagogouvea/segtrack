module.exports = {
  apps: [{
    name: 'segtrack-api-dev',
    script: 'npx',
    args: 'ts-node -r tsconfig-paths/register src/server.ts',
    watch: ['src'],
    ignore_watch: ['node_modules', 'logs'],
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}; 