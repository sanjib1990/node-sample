/**
 * Created by sanjibdevnath on 20/6/17.
 */

// Load the env
require("dotenv-safe").load();

let Sequelize   = require("sequelize");
let orm         = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host    : process.env.MYSQL_HOST,
    dialect : 'mysql',
    pool    : {
        max: 5,
        min: 0,
        idle: 10000
    }
});

module.exports  = {
    orm         : orm,
    Sequelize   : Sequelize
};

