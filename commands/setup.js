const { Permissions } = require('discord.js');
const { DataHandler } = require('../database.js');
const { Construct } = require('../construct.js');


module.exports = {
	name: 'setup',
	description: 'Sets up the channels',
	usage: '(command name)',
	guildOnly: false,
	async execute(interaction) {
		let guild = await DataHandler.getServer(interaction.guild.id);

		if (!guild) {
			guild = await DataHandler.createServer(interaction.guild.id);
			if (!guild) {
				interaction.reply({ content: 'An error occured with the database!', ephemeral: true });
				return;
			}
		}

		if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !interaction.member.roles.cache.has(guild.dataValues?.accessrole)) {
            interaction.reply({ content: 'You aren\'t authorized!\nOnly server admins can use this.', ephemeral: true });
            return;
        }

		Construct.setup(interaction, interaction.guild, guild.dataValues);
		interaction.reply({ content: 'Creating channels...', ephemeral: true });
	}
}