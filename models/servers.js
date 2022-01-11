'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Servers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Servers.init({
    guildid: {
      type: DataTypes.STRING,
      unique: true
    },
    catchchannel: {
      type: DataTypes.STRING
    },
    logchannel: {
      type: DataTypes.STRING
    },
    accessrole: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    freezeTableName: true,
    tableName: 'servers',
    modelName: 'Servers',
  });
  return Servers;
};