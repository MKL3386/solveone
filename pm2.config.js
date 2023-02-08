module.exports = {
  apps: [{
    name: 'MunjamadangAPI',
    script: './app.js',
    env: {
      "NODE_ENV": "production",
    },
    instances: 4,
    exec_mode: 'cluster',
    // wait_ready: true,
    listen_timeout: 50000,
    kill_timeout: 5000
  }]
}