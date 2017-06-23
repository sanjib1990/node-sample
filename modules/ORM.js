/**
 * Created by sanjibdevnath on 20/6/17.
 */

import path from "path";
import {load} from "dotenv-safe";

load();

let databaseConfig  = require(path.join(__dirname, "/../config/database")).connections[process.env.DB_CONNECTION];
let Sequelize   = require("sequelize");
let orm         = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, {
    host    : databaseConfig.host,
    dialect : databaseConfig.dialect,
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
