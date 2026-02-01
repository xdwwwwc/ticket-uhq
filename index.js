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

// ID du salon où le message "Créer un ticket" sera posté
const TICKET_CHANNEL_ID = "1464391408680173709";

// IDs des rôles qui auront accès aux tickets
const ROLE_STAFF_ID = "ID_ROLE_STAFF"; // remplace par ton ID
const ROLE_MOD_ID = "ID_ROLE_MOD";     // remplace par ton ID

client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  // Message "Créer un ticket"
  const channel = client.channels.cache.get(TICKET_CHANNEL_ID);
  if (!channel) return console.error("Salon introuvable !");
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

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: 1466512722035474616, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
        { id: 1466158444435214529, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
      ]
    });

    await channel.send(`🎫 **Ticket ${type}**\nBonjour ${interaction.user}, explique ton problème ici.`);

    return interaction.reply({
      content: `✅ Ton ticket a été créé : ${channel}`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);
