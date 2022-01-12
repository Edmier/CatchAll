'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('guilds', 'category', {
      type: Sequelize.STRING
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('guilds', 'category');
  }
};
