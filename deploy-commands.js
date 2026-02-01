// On importe ce qu'il faut pour parler à l'API Discord
const { REST, Routes, SlashCommandBuilder, PermissionsBitField } = require("discord.js");

// On charge les variables d'environnement (TOKEN)
require("dotenv").config();

// On définit les slash commands
const commands = [
  new SlashCommandBuilder()
    .setName("ticketpanel") // /ticketpanel
    .setDescription("Envoyer le panel de création de ticket")
    // Seuls les admins peuvent l'utiliser
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON()
];

// On prépare la connexion à l'API Discord
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// Fonction auto-exécutée
(async () => {
  try {
    console.log("🚀 Déploiement de /ticketpanel...");

    // On envoie la commande à Discord (GLOBAL)
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Commande enregistrée avec succès !");
  } catch (error) {
    console.error("❌ Erreur :", error);
  }
})();
