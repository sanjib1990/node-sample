'use strict';
module.exports = function(sequelize, DataTypes) {
  let profile = sequelize.define('profile', {
    user_id: DataTypes.INTEGER,
    mobile: DataTypes.STRING
  }, {
    underscored: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  profile.belongsTo

  return profile;
};