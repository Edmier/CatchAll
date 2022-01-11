const fs = require('fs');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { prefix, token } = require('./config.json');
const { GameHandler } = require('./game.js');
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

	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isButton()) {
        //Special cases here
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
	if (message.channel.type !== 'DM') return;

	
});

client.login(token);

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