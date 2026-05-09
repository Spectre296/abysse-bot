const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] })

const commands = [
  new SlashCommandBuilder()
    .setName('lookup')
    .setDescription("Affiche les infos d'un utilisateur")
    .addUserOption(option =>
      option.setName('user')
        .setDescription("L'utilisateur a lookup")
        .setRequired(true))
].map(cmd => cmd.toJSON())

const rest = new REST({ version: '10' }).setToken(TOKEN)

client.on('ready', async () => {
  console.log('Bot connecte: ' + client.user.tag)
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
  console.log('Slash commands enregistrees')
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.commandName !== 'lookup') return

  const user = interaction.options.getUser('user')
  const member = interaction.guild?.members.cache.get(user.id)

  const embed = new EmbedBuilder()
    .setTitle('Lookup - ' + user.username)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
    .setColor(0x2b2d31)
    .addFields(
      { name: 'Username', value: user.username, inline: true },
      { name: 'ID', value: user.id, inline: true },
      { name: 'Compte cree le', value: '<t:' + Math.floor(user.createdTimestamp / 1000) + ':D>', inline: false },
      { name: 'A rejoint le serveur', value: member ? '<t:' + Math.floor(member.joinedTimestamp / 1000) + ':D>' : 'Inconnu', inline: false },
      { name: 'Bot ?', value: user.bot ? 'Oui' : 'Non', inline: true },
    )
    .setFooter({ text: 'Abysse Lookup - by Slayer' })
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
})

client.login(TOKEN)
