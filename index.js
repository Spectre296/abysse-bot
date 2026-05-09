const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Commande slash
const commands = [
    {
        name: 'lookup',
        description: 'Recherche un joueur RP par nom et prénom',
        options: [
            {
                name: 'prenom',
                description: 'Prénom du joueur',
                type: 3,
                required: true
            },
            {
                name: 'nom',
                description: 'Nom du joueur',
                type: 3,
                required: true
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Commandes slash enregistrées');
    } catch (error) {
        console.error(error);
    }
    console.log(`✅ Bot connecté : ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'lookup') return;

    const prenomRecherche = interaction.options.getString('prenom').toLowerCase();
    const nomRecherche = interaction.options.getString('nom').toLowerCase();

    // Lecture de la base joueurs.json
    let data;
    try {
        data = JSON.parse(fs.readFileSync('joueurs.json', 'utf8'));
    } catch (err) {
        return interaction.reply('❌ Base de données (joueurs.json) introuvable.');
    }

    // Recherche exacte ou partielle (prénom ET nom)
    const player = data.find(j => 
        j.prenom?.toLowerCase().includes(prenomRecherche) && 
        j.nom?.toLowerCase().includes(nomRecherche)
    );

    if (!player) {
        return interaction.reply(`❌ Aucun joueur trouvé pour \`${prenomRecherche} ${nomRecherche}\``);
    }

    // Création de l'embed
    const embed = new EmbedBuilder()
        .setTitle(`👥 Lookup - ${player.prenom} ${player.nom}`)
        .setColor(0x2b2d31)
        .addFields(
            { name: '📛 Prénom', value: player.prenom || 'N/A', inline: true },
            { name: '📛 Nom', value: player.nom || 'N/A', inline: true },
            { name: '🎂 Date de naissance', value: player.date_naissance || 'N/A', inline: true },
            { name: '📧 Email', value: player.email || 'N/A', inline: true },
            { name: '📞 Téléphone', value: player.phone || 'N/A', inline: true },
            { name: '🏠 Adresse', value: player.address || 'N/A', inline: false },
            { name: '📮 Code postal', value: player.code_postal || 'N/A', inline: true },
            { name: '🏙️ Ville', value: player.ville || 'N/A', inline: true }
        )
        .setFooter({ text: 'Lookup RP - by Slayer' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
});

client.login(TOKEN);
