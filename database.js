const Servers = require('./models/servers.js')(new Sequelize(dbUri, {
    dialect: 'postgres',
    logging: false,
}), Sequelize);
