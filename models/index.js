import fs from "fs";
import path from "path";
import Sequelize from "sequelize";

"use strict";

let config_path = path.join(__dirname, "/../config/");
let basename  = path.basename(module.filename);
let env       = process.env.NODE_ENV || "local";
let config    = require(path.join(config_path, "database.json"));
let db        = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
