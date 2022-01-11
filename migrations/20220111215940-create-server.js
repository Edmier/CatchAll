'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('servers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('servers');
  }
};