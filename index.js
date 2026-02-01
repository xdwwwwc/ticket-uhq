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

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

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
client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  // Récupère le salon où poster le message
  const channel = client.channels.cache.get("1464391408680173709"); // Mets l'ID du salon ici
  if (!channel) return console.error("Salon introuvable !");

  // Envoie le message avec le bouton
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

