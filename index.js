const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    console.error("TOKEN manquant !");
    process.exit(1);
}

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// ID du salon pour poster le message "Créer un ticket"
const TICKET_CHANNEL_ID = "ID_DU_SALON"; // remplace par ton salon

// IDs des rôles qui auront accès aux tickets
const ALLOWED_ROLES = [
  "1466158641743663114",
  "1466168420402991307",
  "1466158444435214529",
  "1466512722035474616",
];

client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  // Récupère le salon
  const channel = client.channels.cache.get(TICKET_CHANNEL_ID);
  if (!channel) return console.error("Salon introuvable !");

  // Vérifie s'il y a déjà le message "Besoin d'aide ?" pour éviter les doublons
  const messages = await channel.messages.fetch({ limit: 50 });
  if (!messages.some(msg => msg.content.includes("Besoin d'aide ?"))) {
    channel.send({
      content: "**Besoin d'aide ?**",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("create_ticket")
            .setLabel("🎟️ Créer un ticket")
            .setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }
});

client.on("interactionCreate", async interaction => {

  // Bouton créer ticket
  if (interaction.isButton() && interaction.customId === "create_ticket") {
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_type")
        .setPlaceholder("Choisis le type de ticket")
        .addOptions([
          { label: "Signalement", value: "signalement", emoji: "🚨" },
          { label: "Demande de staff", value: "staff", emoji: "👮" },
          { label: "Divers", value: "divers", emoji: "📦" }
        ])
    );

    return interaction.reply({
      content: "📩 **Quel est le type de ticket ?**",
      components: [menu],
      ephemeral: true
    });
  }

  // Création du ticket
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_type") {
    const type = interaction.values[0];

    // Permission pour tous : tout le monde ne peut pas voir
    const permissionOverwrites = [
      {
        id: interaction.guild.id, // everyone
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: interaction.user.id, // créateur
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
      }
    ];

    // Ajoute tous les rôles autorisés
    ALLOWED_ROLES.forEach(roleId => {
      permissionOverwrites.push({
        id: roleId,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels]
      });
    });

    // Crée le channel
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites
    });

    await channel.send(
      `🎫 **Ticket ${type}**\nBonjour ${interaction.user}, explique ton problème ici.`
    );

    return interaction.reply({
      content: `✅ Ton ticket a été créé : ${channel}`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);
