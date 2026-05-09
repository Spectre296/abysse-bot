const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const commands = [
  new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('Recherche un joueur RP')
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Nom ou prenom du joueur')
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

  const recherche = interaction.options.getString('nom').toLowerCase()
  const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'))

  const joueur = data.find(j =>
    j.nom.toLowerCase().includes(recherche) ||
    j.prenom.toLowerCase().includes(recherche)
  )

  if (!joueur) {
    await interaction.reply('Aucun joueur trouve.')
    return
  }

  const embed = new EmbedBuilder()
    .setTitle('Lookup - ' + joueur.prenom + ' ' + joueur.nom)
    .setColor(0x2b2d31)
    .addFields(
      { name: 'Prenom', value: joueur.prenom || 'N/A', inline: true },
      { name: 'Nom', value: joueur.nom || 'N/A', inline: true },
      { name: 'Date de naissance', value: joueur.date_naissance || 'N/A', inline: false },
      { name: 'Email', value: joueur.email || 'N/A', inline: true },
      { name: 'Telephone', value: joueur.phone || 'N/A', inline: true },
      { name: 'Adresse', value: joueur.adresse || 'N/A', inline: false },
      { name: 'Code postal', value: joueur.code_postal || 'N/A', inline: true },
      { name: 'Ville', value: joueur.ville || 'N/A', inline: true }
    )
    .setFooter({ text: 'Abysse Lookup - by Slayer' })
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
})

client.login(TOKEN)
