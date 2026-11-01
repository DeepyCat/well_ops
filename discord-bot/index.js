const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const ANNOUNCEMENT_CHANNEL_ID = process.env.ANNOUNCEMENT_CHANNEL_ID;
const PORTAL_URL = process.env.PORTAL_URL || 'https://deepycat.github.io/well_ops';

// Seznam povolených uživatelských ID (oddělených čárkou)
const allowedUserIds = (process.env.ALLOWED_USER_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

// Definice Slash Příkazů
const commands = [
  new SlashCommandBuilder()
    .setName('novy-modul')
    .setDescription('Zveřejní oznámení o novém modulu v OPS Portálu (anonymně bez zobrazení autora)')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption(option =>
      option
        .setName('cislo')
        .setDescription('Číslo modulu (např. 03 nebo 3)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('nazev')
        .setDescription('Název modulu (např. Doménové jméno a konfigurace DNS)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('popis')
        .setDescription('Volitelný stručný popis nebo body, co se v modulu probírá')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('ping')
        .setDescription('Zda a koho pingnout u oznámení')
        .setRequired(false)
        .addChoices(
          { name: '@everyone (všichni na serveru)', value: '@everyone' },
          { name: '@here (pouze právě online)', value: '@here' },
          { name: 'Bez označení (tiché oznámení)', value: 'none' }
        )
    ),

  new SlashCommandBuilder()
    .setName('update')
    .setDescription('Zveřejní oznámení o aktualizaci / vylepšení portálu (anonymně bez zobrazení autora)')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption(option =>
      option
        .setName('zprava')
        .setDescription('Text novinky (co se změnilo, přidalo nebo opravilo)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('nadpis')
        .setDescription('Vlastní nadpis oznámení (výchozí: Aktualizace OPS Portálu)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('ping')
        .setDescription('Zda a koho pingnout u oznámení')
        .setRequired(false)
        .addChoices(
          { name: '@everyone (všichni na serveru)', value: '@everyone' },
          { name: '@here (pouze právě online)', value: '@here' },
          { name: 'Bez označení (tiché oznámení)', value: 'none' }
        )
    )
].map(cmd => cmd.toJSON());

// Inicializace Discord klienta
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Kontrola oprávnění uživatele
function isUserAuthorized(interaction) {
  // 1. Pokud je ID uživatele v seznamu povolených
  if (allowedUserIds.includes(interaction.user.id)) {
    return true;
  }
  // 2. Pokud je uživatel administrátor serveru
  if (interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  // 3. Pokud není nastaven žádný konkrétní seznam povolených a uživatel má právo spravovat server
  if (allowedUserIds.length === 0 && interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return true;
  }
  return false;
}

// Zaregistrování slash příkazů při startu
async function registerSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('🔄 Registruji slash příkazy (/novy-modul, /update)...');
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Slash příkazy byly okamžitě zaregistrovány pro server ID: ${GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('✅ Globální slash příkazy byly zaregistrovány.');
    }
  } catch (error) {
    console.error('❌ Chyba při registraci příkazů:', error);
  }
}

client.once('ready', async () => {
  console.log(`🤖 Bot je přihlášen jako: ${client.user.tag}`);
  await registerSlashCommands();
});

// Zpracování interakcí (Slash příkazů)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // Ověření, zda má uživatel oprávnění
  if (!isUserAuthorized(interaction)) {
    return interaction.reply({
      content: '❌ **Nemáš oprávnění používat tento oznamovací příkaz.**',
      ephemeral: true // Vidí to POUZE uživatel, který příkaz zkusil zadat
    });
  }

  // Získání cílového kanálu pro oznámení
  const channelId = ANNOUNCEMENT_CHANNEL_ID || interaction.channelId;
  let targetChannel;
  try {
    targetChannel = await client.channels.fetch(channelId);
  } catch (err) {
    return interaction.reply({
      content: `❌ **Nepodařilo se najít kanál pro oznámení** (ID: ${channelId}). Zkontroluj nastavení v .env.`,
      ephemeral: true
    });
  }

  // ----------------------------------------------------
  // 1. PŘÍKAZ: /novy-modul
  // ----------------------------------------------------
  if (commandName === 'novy-modul') {
    const rawCislo = interaction.options.getString('cislo').trim();
    const formattedCislo = rawCislo.padStart(2, '0');
    const nazev = interaction.options.getString('nazev').trim();
    const popis = interaction.options.getString('popis');
    const pingChoice = interaction.options.getString('ping') || 'none';

    const praxeUrl = `${PORTAL_URL}/praxe.html?modul=${formattedCislo}`;
    const zadaniUrl = `${PORTAL_URL}/praxe/${formattedCislo}/__zadani.html`;
    const reseniUrl = `${PORTAL_URL}/praxe/${formattedCislo}/__reseni.html`;

    const embed = new EmbedBuilder()
      .setColor(0x22c55e) // Zelená barva pro nový modul
      .setTitle(`🚀 Vyšel nový modul: Modul ${formattedCislo} – ${nazev}`)
      .setURL(praxeUrl)
      .setDescription(
        popis
          ? `${popis}\n\nCvičení je již připraveno a nahrané na webovém portálu OPS!`
          : `Nový praktický modul je k dispozici! Všechny kroky, PowerShell konfigurace i testy jsou nahrány na portálu.`
      )
      .addFields(
        {
          name: '📚 Otevřít cvičení na webu',
          value: `[Přejít do interaktivní Praxe](${praxeUrl})`,
          inline: true
        },
        {
          name: '📄 Zadání',
          value: `[Otevřít zadání](${zadaniUrl})`,
          inline: true
        },
        {
          name: '🎯 Řešení',
          value: `[Otevřít řešení](${reseniUrl})`,
          inline: true
        }
      )
      .setFooter({
        text: 'OPS Portál • Školní praktická cvičení',
        iconURL: 'https://cdn-icons-png.flaticon.com/512/906/906343.png'
      })
      .setTimestamp();

    // Sestavení ping textu
    let contentPing = '';
    if (pingChoice === '@everyone') contentPing = '@everyone';
    else if (pingChoice === '@here') contentPing = '@here';

    try {
      // 1. Odešleme zprávu PŘÍMO jako bot do cílového kanálu
      // (Nikde v kanálu nebude vidět, kdo příkaz spustil, ani hláška "Used /novy-modul")
      await targetChannel.send({
        content: contentPing || undefined,
        embeds: [embed]
      });

      // 2. Uživateli, který příkaz zadal, odpovíme EPHEMERÁLNĚ (vidí to pouze on na své obrazovce)
      return interaction.reply({
        content: `✅ **Nový modul byl úspěšně anonymně publikován!**\nKanál: <#${targetChannel.id}>\nModul: \`Modul ${formattedCislo}: ${nazev}\``,
        ephemeral: true
      });
    } catch (err) {
      console.error('Chyba při odesílání oznámení:', err);
      return interaction.reply({
        content: `❌ **Nastala chyba při odesílání do kanálu:** ${err.message}`,
        ephemeral: true
      });
    }
  }

  // ----------------------------------------------------
  // 2. PŘÍKAZ: /update
  // ----------------------------------------------------
  if (commandName === 'update') {
    const zprava = interaction.options.getString('zprava').trim();
    const nadpis = interaction.options.getString('nadpis') || '🛠️ Aktualizace OPS Portálu';
    const pingChoice = interaction.options.getString('ping') || 'none';

    const embed = new EmbedBuilder()
      .setColor(0x3b82f6) // Modrá barva pro update
      .setTitle(nadpis)
      .setURL(PORTAL_URL)
      .setDescription(zprava)
      .addFields({
        name: '🌐 Web portálu',
        value: `[Otevřít OPS Portál](${PORTAL_URL})`,
        inline: false
      })
      .setFooter({
        text: 'OPS Portál • Automatická oznámení',
        iconURL: 'https://cdn-icons-png.flaticon.com/512/906/906343.png'
      })
      .setTimestamp();

    let contentPing = '';
    if (pingChoice === '@everyone') contentPing = '@everyone';
    else if (pingChoice === '@here') contentPing = '@here';

    try {
      // 1. Bot odešle samostatnou čistou zprávu do kanálu
      await targetChannel.send({
        content: contentPing || undefined,
        embeds: [embed]
      });

      // 2. Ephemerální potvrzení pouze pro administrátora
      return interaction.reply({
        content: `✅ **Aktualizace byla úspěšně anonymně publikována!**\nKanál: <#${targetChannel.id}>`,
        ephemeral: true
      });
    } catch (err) {
      console.error('Chyba při odesílání aktualizace:', err);
      return interaction.reply({
        content: `❌ **Nastala chyba při odesílání do kanálu:** ${err.message}`,
        ephemeral: true
      });
    }
  }
});

// Spuštění bota
if (!TOKEN || TOKEN === 'sem_vloz_token_bota') {
  console.error('❌ CHYBA: Nemáš vyplněný DISCORD_TOKEN v souboru .env!');
  console.log('👉 Zkopíruj .env.example jako .env a doplň své údaje.');
  process.exit(1);
}

client.login(TOKEN);
