// Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/

module.exports = {
    apps: [
        {
            name: 'NODE_SAMPLES',
            script: './bin/www',
            interpreter: "./node_modules/.bin/babel-node",
            args: 'one two',
            instances: 1,
            autorestart: true,
            output: './logs/pm2.log',
            error: './logs/pm2.error.log',
            log: './logs/pm2.combined.outerr.log',
            merge_logs: true,
            watch: true,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
