const Discord = require('discord.js');
const { DataHandler } = require('./database.js');
const { botid } = require('./config.json');

class Construct {

    constructor() {}

    static async setup(interaction, guild, dataValues, categoryName = 'DO NOT TYPE HERE', channelName = 'do-not-type-here', logChannelName = 'logs') {
        return new Promise(async (resolve, reject) => {

            //Construct category if one isn't specified
            let categoryId = dataValues.category;
            if (!dataValues.category || !guild.channels.cache.has(dataValues.category)) {
                const category = await Construct.createCategory(interaction, guild, categoryName);
                if (!category) resolve(undefined);

                categoryId = category?.id;
            }

            //Construct catch channel if one isn't specified
            let catchChannel = { id: dataValues.catchchannel };
            if (!dataValues.catchchannel || !guild.channels.cache.has(dataValues.catchchannel)) {
                catchChannel = await Construct.createChannel(interaction, guild, channelName, [{
                    id: guild.roles.everyone,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }, { id: botid, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] }], categoryId);

                if (!catchChannel) resolve(undefined);
                catchChannel.send({ content: 'DO NOT SAY ANYTHING IN THIS CHANNEL\n**__DOING SO WILL RESULT IN AN INSTANT BAN__**' }).catch(() => { });
            }
           
            //Construct log channel if one isn't specified
            let logChannel = { id: dataValues.logchannel };
            if (!dataValues.logchannel || !guild.channels.cache.has(dataValues.logchannel)) {
                const perms = [{
                    id: guild.roles.everyone,
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }, { id: botid, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] }];
    
                if (dataValues.accessrole) {
                    perms.push({
                        id: dataValues.accessrole,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                    });
                }

                logChannel = await Construct.createChannel(interaction, guild, logChannelName, perms, categoryId);
                if (!logChannel) resolve(undefined);
                logChannel.send({ content: 'Log channel set up!' }).catch(() => { });
            }

            //Update server
            await DataHandler.updateServer({ 
                category: categoryId ? categoryId : null,
                catchchannel: catchChannel ? catchChannel.id : null,
                logchannel: logChannel ? logChannel.id : null 
            }, guild.id);

        });
    }

    static async createCategory(interaction, guild, categoryName = 'DO NOT TYPE HERE') {
        return new Promise((resolve, reject) => {
            guild.channels.create(categoryName, { type: "GUILD_CATEGORY", position: 0 }).then(category => {
                resolve(category);
            }).catch(error => {
                resolve(undefined);
            });
        });
    }

    static async createChannel(interaction, guild, channelName, perms, categoryId) {
        return new Promise((resolve, reject) => {
            guild.channels.create(channelName, { type: "text", permissionOverwrites: perms }).then(channel => {
                channel.setParent(categoryId, { lockPermissions: false }).then(channel => {
                    resolve(channel);
                }).catch(error => {
                    console.log(error)
                    resolve(undefined);
                });
            }).catch(error => {
                resolve(undefined);
            });
        });
    }
}

module.exports = {
    Construct
}