const fs = require('fs');
const { Client, Intents, Collection, MessageActionRow, Permissions } = require('discord.js');
const { DataHandler } = require('./database.js');
const { token } = require('./config.json');
const args = process.argv.slice(2);

const client = new Client({ partials: ['CHANNEL'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', async () => {
	client.user.setActivity('hacked accounts', { type: 'WATCHING' });
	DataHandler.syncTables();

	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isButton() && (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || interaction.member.roles.cache.has(guild.dataValues?.accessrole))) {
		if (interaction.customId.includes('|') ) {
			const components = interaction.customId.split('|');
			const command = components[0];
			const userid = components[1];

			if (command === 'ban') {
				const guild = client.guilds.cache.get(interaction.guildId);
				guild.bans.create(userid, { days: 1, reason: 'Sent a message in forbidden channel' }).then(() => {
					interaction.reply({
						embeds: [{
							title: 'Admin Banned User',
							description: `<@${interaction.user.id}> banned <@${userid}> (\`${userid}\`)\nNo action is required`,
							color: '#228B22'
						}],
						components: [
							new MessageActionRow().addComponents({ customId: `unban|${userid}`, label: 'Unban User', style: 'SECONDARY', type: 'BUTTON' })
						]
					});
				}).catch(() => {
					interaction.reply({
						embeds: [{
							title: '**ERROR:** Couldn\'t ban user',
							description: `__I was unable to ban <@${userid}> (\`${userid}\`), please fix permissions!__`,
							color: '#FF0000'
						}]
					});
				});
			} else if (command === 'unban') {
				const guild = client.guilds.cache.get(interaction.guildId);
				guild.bans.remove(userid).then(() => {
					interaction.reply({
						embeds: [{
							title: 'Admin Unbanned User',
							description: `<@${interaction.user.id}> unbanned <@${userid}> (\`${userid}\`)\nNo action is required`,
							color: '#228B22'
						}]
					});
				}).catch(() => {
					interaction.reply({
						embeds: [{
							title: 'ERROR: Couldn\'t unban user',
							description: `__I was unable to unban <@${userid}> (\`${userid}\`), please fix permissions!__`,
							color: '#FF0000'
						}]
					});
				});
			} else if (command === 'free') {
				const guild = client.guilds.cache.get(interaction.guildId);
				const member = await guild.members.fetch(userid).catch(() => {
					interaction.reply({
						embeds: [{
							title: 'ERROR: Couldn\'t find user',
							description: `Something went wrong when trying to fetch them.`,
							color: '#FF0000'
						}]
					});
				});

				if (!member) return;

				member.timeout(null, 'Released by admin').then(() => {
					interaction.reply({
						embeds: [{
							title: `Released User!`,
							description: `<@${member.id}> was timed out for 12 hours and has been freed by <@${interaction.user.id}>`,
							color: '#FFA500'
						}]
					});
				}).catch(() => {
					interaction.reply({
						embeds: [{
							title: 'ERROR: Couldn\'t free user',
							description: `__I was unable to release them from time-out, please fix permissions!__`,
							color: '#FF0000'
						}]
					});
				});
			}
		}
        return;
	}

	if (!interaction.isCommand()) return;
	if (!client.commands.has(interaction.commandName)) return;

	let command;
	try {
		command = await client.commands.get(interaction.commandName);
	} catch (error) {
		console.log(error);
	}

	if (command.permissions) {
		if (!interaction.member.permissions.has(command.permissions)) {
			return await interaction.reply({ content: 'You don\'t have the required permissions for this command.', allowedMentions: { repliedUser: true }, ephemeral: true });
		}
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${interaction.user.username}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`/${command.name} ${command.usage}\``;
		}

		return await interaction.reply({ content: reply, allowedMentions: { repliedUser: true }, ephemeral: true });
	}

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.log(error);
		await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(() => {});
	}
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	if (message.channel.type === 'DM') return;
	
	const guild = await DataHandler.getServer(message.guildId);
	const channelId = guild.dataValues.catchchannel;

	if (message.channel.id !== channelId) return;

	if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || message.member.roles.cache.has(guild.dataValues?.accessrole)) {
		log(message.guildId, {
			embeds: [{
				title: 'Admin Message Sent',
				description: `An admin sent [this](${message.url}) in <#${channelId}>\n**No action is required**`,
				color: '#228B22'
			}]
		});
	} else if (message.content.includes('http')) {
		message.member.ban({ days: 1, reason: 'Sent a message in forbidden channel' }).then(() => {
			log(message.guildId, {
				embeds: [{
					title: `Banned User ${message.author.username}#${message.author.discriminator}`,
					description: `<@${message.author.id}> was banned for sending a message in <#${channelId}>\n**No action is required**`,
					fields: [{
						name: 'Message Content',
						value: `${message.content}`
					}],
					color: '#FFA500'
				}],
				components: [
					new MessageActionRow().addComponents({ customId: `unban|${message.author.id}`, label: 'Unban User', style: 'SECONDARY', type: 'BUTTON' })
				]
			});
		}).catch(() => {
			log(message.guildId, {
				embeds: [{
					title: '**ERROR:** Couldn\'t ban user',
					description: `<@${message.author.id}> sent a message with a link in <#${channelId}>!\n__I was unable to ban them, please fix permissions!__`,
					color: '#FF0000'
				}]
			});
		});
	} else {
		message.member.timeout(43200000, 'Sent a message in a forbidden channel').then(() => {
			log(message.guildId, {
				embeds: [{
					title: `Timed Out User ${message.author.username}#${message.author.discriminator}`,
					description: `<@${message.author.id}> was timed out for 12 hours for sending a message in <#${channelId}>\n**No action is required**`,
					fields: [{
						name: 'Message Content',
						value: `${message.content}`
					}],
					color: '#FFA500'
				}],
				components: [
					new MessageActionRow().addComponents(
						{ customId: `ban|${message.author.id}`, label: 'Ban User', style: 'DANGER', type: 'BUTTON' },
						{ customId: `free|${message.author.id}`, label: 'Free User', style: 'SECONDARY', type: 'BUTTON' }
					)
				]
			});
		}).catch(() => {
			log(message.guildId, {
				embeds: [{
					title: '**ERROR:** Couldn\'t timeout user',
					description: `<@${message.author.id}> sent a message in <#${channelId}>!\n__I was unable to time them out, please fix permissions!__`,
					color: '#FF0000'
				}]
			});
		});
		message.delete().catch(() => {
			log(message.guildId, {
				embeds: [{
					title: '**ERROR:** Couldn\'t delete message!',
					description: `<@${message.author.id}> sent a message with a link in <#${channelId}>!\n__I was unable to delete this, please fix permissions!__`,
					color: '#FF0000'
				}]
			});
		});
	}
});

client.on('guildCreate', async (guild) => {
	DataHandler.createServer(guild.id);
});

client.login(token);

async function log(guildId, data) {
	const logChannelId = await DataHandler.getLogChannelID(guildId);
	if (!logChannelId) return;

	const channel = client.channels.cache.get(logChannelId);
	channel.send(data).catch(error => console.log(error));
} 

/*
*  ===================================================================
*	Command arguments on startup of script to do one-time operations
*
*		"deploy global" 	 - updates slash commands globally
*		"deploy <server id>" - updates slash commands in that server
*		Append "clear" to remove slash commands from a server
*  ===================================================================
*/

const slashCommandsData = [
	{
		name: 'setup',
		description: 'Create the needed channels!',
	},
	{
		name: 'help',
		description: 'Get the help menu!',
		options: [{
			name: 'command',
			type: 'STRING',
			description: 'Specify a command for more info.',
			required: false
		}]
	}
];

if (args[0] === 'deploy') {
	if (args[1] === 'global') {
		setTimeout(async function() {
			await client.application?.commands.set([]);
			await client.application?.commands.set(slashCommandsData);
			console.log('Probably updated slash commands globally');
		}, 5000);
	} else if (args[1]) {
		setTimeout(async function() {
			const guild = await client.guilds.fetch('' + args[1]);
			const commands = guild.commands;
			if (args[2] !== 'clear') {
				commands.set(slashCommandsData);
			} else {
				commands.set([]);
			}
			console.log('Probably updated slash commands on that server');
		}, 5000);
	}
}