const { Sequelize, Op } = require('sequelize');
const { dbUri } = require('./config.json');

const Guilds = require('./models/guilds.js')(new Sequelize(dbUri, {
    dialect: 'postgres',
    logging: false,
}), Sequelize);

class DataHandler {

    constructor() { }

    static async syncTables() {
        await Guilds.sync();

        //For wiping table
        //Guilds.sync({ force: true })
    }

    static async createServer(guildid) {
        try {
            const server = await this.getServer(guildid);
            if (!server) { 
                console.log('Server added');
                return await Guilds.create({ guildid: guildid }); 
            }
            return undefined;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    static async getServer(guild, where = null) {
        if (!where) { where = { guildid: guild }; }
        return await Guilds.findOne({ where: where });
    }

    static async updateServer(changes, guildid) {
        const server = await Guilds.findOne({ where: { guildid: guildid } });
        if (server) {
            return await Guilds.update(changes, { where: { guildid: guildid } });
        }
    }

    static async getCatchChannelID(guildid) {
        const guild = await this.getServer(guildid);
        
        if (!guild) return undefined;

        return guild.dataValues.catchchannel;
    }

    static async getLogChannelID(guildid) {
        const guild = await this.getServer(guildid);
        
        if (!guild) return undefined;

        return guild.dataValues.logchannel;
    }
}

module.exports = {
    DataHandler
}