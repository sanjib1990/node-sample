/**
 * Created by sanjibdevnath on 20/6/17.
 */

let sql = require(__dirname + "/../../../modules/ORM");

sql
    .orm
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const User  = sql.orm.define("users", {
    name        : { type: sql.Sequelize.STRING, allowNull: false},
    address     : { type: sql.Sequelize.STRING, allowNull: false}
}, {
    indexes : [
        {
            unique: true,
            fields: ['name']
        }
    ]
});

User.sync({force: true}).then((success, reject) => {
   if (reject) throw Error(reject);

   console.log("Success in sync with User");
});

module.exports  = User;
