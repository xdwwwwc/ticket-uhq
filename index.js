const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("TOKEN manquant !");
  process.exit(1);
}

const ROLE_HELP_ID = "1466512722035474616";
const ROLE_2_ID = "1466158641743663114";
const ROLE_3_ID = "1466168420402991307";

const TICKET_PANEL_CHANNEL_ID = "1464391408680173709";

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

client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const channel = await client.channels.fetch(TICKET_PANEL_CHANNEL_ID);
  if (!channel) return console.log("❌ Salon ticket introuvable");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("🎟️ Créer un ticket")
      .setStyle(ButtonStyle.Primary)
  );

  channel.send({
    content: "**Besoin d'aide ?**\nClique sur le bouton ci-dessous pour ouvrir un ticket.",
    components: [row]
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
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: ROLE_HELP_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: ROLE_2_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: ROLE_3_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Fermer le ticket")
        .setStyle(ButtonStyle.Danger)
    );

    channel.send({
      content: `🎫 **Ticket ${type}**\nBonjour ${interaction.user}, explique ton problème ici.`,
      components: [row]
    });

    return interaction.reply({
      content: `✅ Ton ticket a été créé : ${channel}`,
      ephemeral: true
    });
  }

  // Fermeture du ticket
  if (interaction.isButton() && interaction.customId === "close_ticket") {

    // Vérifie si c'est un salon ticket (commence par ticket-)
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: "❌ Ce bouton n'est pas dans un ticket.", ephemeral: true });
    }

    const member = interaction.member;

    // Vérifie si l'utilisateur est le créateur ou a un des rôles help
    const isCreator = interaction.channel.name === `ticket-${member.user.username}`;
    const hasRoleHelp = member.roles.cache.has(ROLE_HELP_ID) ||
                        member.roles.cache.has(ROLE_2_ID) ||
                        member.roles.cache.has(ROLE_3_ID);

    if (!isCreator && !hasRoleHelp) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission de fermer ce ticket.", ephemeral: true });
    }

    // Supprime le salon après 5 secondes (pour laisser le message s'afficher)
    await interaction.reply({ content: "🔒 Ticket fermé. Suppression dans 5 secondes...", ephemeral: true });
    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

client.login(TOKEN);
