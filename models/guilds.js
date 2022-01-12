'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guilds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Guilds.init({
    guildid: {
      type: DataTypes.STRING,
      unique: true
    },
    category: {
      type: DataTypes.STRING
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
    modelName: 'Guilds',
    tableName: 'guilds',
    freezeTableName: true
  });
  return Guilds;
};