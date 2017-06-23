/**
 * Created by sanjibdevnath on 22/6/17.
 */

let mongoConfig = {
    host    : process.env.MONGO_HOST,
    port    : process.env.MONGO_PORT,
    database: process.env.MONGO_DATABASE
};

module.exports  = {
    connections: {
        mysql: {
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            host    : process.env.MYSQL_HOST,
            dialect : "mysql"
        },
        mongo: {
            url     : `mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`,
            host    : mongoConfig.host,
            port    : mongoConfig.port,
            database: mongoConfig.database
        }
    }
};
