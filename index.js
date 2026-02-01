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

client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {

  // Bouton créer ticket
  if (interaction.isButton() && interaction.customId === "create_ticket") {

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_type")
        .setPlaceholder("Choisis le type de ticket")
        .addOptions([
          {
            label: "Signalement",
            value: "signalement",
            emoji: "🚨"
          },
          {
            label: "Demande de staff",
            value: "staff",
            emoji: "👮"
          },
          {
            label: "Divers",
            value: "divers",
            emoji: "📦"
          }
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

permissionOverwrites: [
  {
    id: interaction.guild.id, // tout le monde
    deny: [PermissionsBitField.Flags.ViewChannel] // tout le monde ne voit pas
  },
  {
    id: interaction.user.id, // créateur du ticket
    allow: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages
    ]
  },
  {
    id: "1466512722035474616", // ici l’ID du rôle staff
    allow: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ManageChannels // optionnel
    ]
  }
]


    channel.send(
      `🎫 **Ticket ${type}**\nBonjour ${interaction.user}, explique ton problème ici.`
    );

    return interaction.reply({
      content: `✅ Ton ticket a été créé : ${channel}`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);
const channel = client.channels.cache.get("1464391408680173709");
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