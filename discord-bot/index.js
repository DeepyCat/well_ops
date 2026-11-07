const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
  MessageFlags
} = require('discord.js');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const ANNOUNCEMENT_CHANNEL_ID = process.env.ANNOUNCEMENT_CHANNEL_ID;
const DOCS_CHANNEL_ID = process.env.DOCS_CHANNEL_ID || '1567074623546196039';
const PORTAL_URL = process.env.PORTAL_URL || 'https://deepycat.github.io/well_ops';

// Slozky pro ukladani prubeznych a dokoncenych dokumentaci
const PENDING_DOCS_DIR = path.join(__dirname, 'pending_docs');
const COMPLETED_DOCS_DIR = path.join(__dirname, 'completed_docs');
fs.mkdirSync(PENDING_DOCS_DIR, { recursive: true });
fs.mkdirSync(COMPLETED_DOCS_DIR, { recursive: true });

// Konfigurace pozadovanych casti pro moduly (podpora 1 VM, 2 VM i 3 VM)
const MODULE_CONFIG = {
  '00': { requiredParts: ['SRV1', 'SRV2', 'PC1'], vms: ['SRV1-DC', 'SRV2-FS', 'PC1-WIN'] },
  '01': { requiredParts: ['SRV1'], vms: ['SRV1-DC'] },
  '02': { requiredParts: ['SRV1', 'PC1'], vms: ['SRV1-DC', 'PC1-WIN'] },
  '03': { requiredParts: ['SRV1', 'PC1'], vms: ['SRV1-DC', 'PC1-WIN'] }
};

// Seznam povolenych uzivatelskych ID pro publikovani oznameni
const allowedUserIds = (process.env.ALLOWED_USER_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

// Definice Slash Prikazu
const commands = [
  new SlashCommandBuilder()
    .setName('novy-modul')
    .setDescription('Zverejni oznameni o novem modulu v OPS Portalu (anonymne bez zobrazeni autora)')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption(option =>
      option
        .setName('cislo')
        .setDescription('Cislo modulu (napr. 03 nebo 3)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('nazev')
        .setDescription('Nazev modulu (napr. Domenove jmeno a konfigurace DNS)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('popis')
        .setDescription('Volitelny strucny popis nebo body, co se v modulu probira')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('ping')
        .setDescription('Zda a koho pingnout u oznameni')
        .setRequired(false)
        .addChoices(
          { name: '@everyone (vsichni na serveru)', value: '@everyone' },
          { name: '@here (pouze prave online)', value: '@here' },
          { name: 'Bez oznaceni (tiche oznameni)', value: 'none' }
        )
    ),

  new SlashCommandBuilder()
    .setName('update')
    .setDescription('Zverejni oznameni o aktualizaci / vylepseni portalu (anonymne bez zobrazeni autora)')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption(option =>
      option
        .setName('zprava')
        .setDescription('Text novinky (co se zmenilo, pridalo nebo opravilo)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('nadpis')
        .setDescription('Vlastni nadpis oznameni (vychozi: Aktualizace OPS Portalu)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('ping')
        .setDescription('Zda a koho pingnout u oznameni')
        .setRequired(false)
        .addChoices(
          { name: '@everyone (vsichni na serveru)', value: '@everyone' },
          { name: '@here (pouze prave online)', value: '@here' },
          { name: 'Bez oznaceni (tiche oznameni)', value: 'none' }
        )
    ),

  new SlashCommandBuilder()
    .setName('moje-id')
    .setDescription('Zobrazi tvoje Discord uzivatelske jmeno a ID pro zadani do VM skriptu')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  new SlashCommandBuilder()
    .setName('posledni-dokumentace')
    .setDescription('Znovu ti posle naposledy vygenerovanou dokumentaci pro vybrany modul')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption(option =>
      option
        .setName('modul')
        .setDescription('Cislo modulu (vychozi: 03)')
        .setRequired(false)
    )
].map(cmd => cmd.toJSON());

// Inicializace Discord klienta s potrebnymi intenty pro cteni dokumentacnich priloh
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Pomocna funkce: odstraneni diakritiky pro nazev ZIP souboru
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Pomocna funkce: sanitizace a oprava konzolovych vystupu (ipconfig, nslookup)
function sanitizeConsoleOutput(str) {
  if (!str || typeof str !== 'string') return str;
  let out = str
    // Oprava poskozene diakritiky z OEM kodovani konzole Windows
    .replace(/pond[\ufffd]l[\ufffd]/gi, 'pondělí')
    .replace(/[\ufffd]ter[\ufffd]/gi, 'úterý')
    .replace(/st[\ufffd]eda/gi, 'středa')
    .replace(/[\ufffd]tvrtek/gi, 'čtvrtek')
    .replace(/p[\ufffd]tek/gi, 'pátek')
    .replace(/ned[\ufffd]le/gi, 'neděle');

  // Detekce zplosteleho vystupu ipconfig /all (pokud vse skoncilo na jednom radku)
  if (out.includes('Host Name . . . . . . . . . . . . :') && !out.includes('\n   Host Name') && !out.includes('\r\n   Host Name')) {
    out = out
      .replace(/([^\r\n])\s*(Windows IP Configuration)/g, '$1\r\n\r\n$2\r\n')
      .replace(/([^\r\n])\s*(Ethernet adapter [^:]+:)/g, '$1\r\n\r\n$2')
      .replace(/([^\r\n])\s*(\b[A-Za-z0-9][A-Za-z0-9\s()#-]+\s*\.\s*\.\s*\.\s*\.\s*\.\s*\.\s*:\s*)/g, '$1\r\n   $2')
      .replace(/([^\r\n])\s*(PS [A-Z]:\\[^>]*>)/g, '$1\r\n$2');
  }

  // Detekce zplosteleho vystupu nslookup
  if (out.includes('Server:') && out.includes('Address:') && !out.includes('\nAddress:') && !out.includes('\r\nAddress:')) {
    out = out
      .replace(/([^\r\n])\s*(Server:\s+)/g, '$1\r\n$2')
      .replace(/([^\r\n])\s*(Address:\s+)/g, '$1\r\n$2')
      .replace(/([^\r\n])\s*(Name:\s+)/g, '$1\r\n\r\n$2')
      .replace(/([^\r\n])\s*(Aliases:\s+)/g, '$1\r\n$2')
      .replace(/([^\r\n])\s*(PS [A-Z]:\\[^>]*>)/g, '$1\r\n$2');
  }

  return out;
}

// Pomocna funkce: bezpecne nahrazeni DOPLNIT v bloku podle znacky
function fillDocBlock(content, marker, newText, markDone = true) {
  const esc = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sanitized = sanitizeConsoleOutput(newText);
  const regex = new RegExp(`(${esc}[\\s\\S]*?\`\`\`text\\r?\\n)DOPLNIT(\\r?\\n\`\`\`)`);
  let result = content.replace(regex, (match, p1, p2) => `${p1}${sanitized}${p2}`);
  if (markDone) {
    const doneRegex = new RegExp(`(${esc}[\\s\\S]*?)- \\[ \\] Hotovo`);
    result = result.replace(doneRegex, (match, p1) => `${p1}- [x] Hotovo`);
  }
  return result;
}

// Kontrola opravneni uzivatele pro publikovani
function isUserAuthorized(interaction) {
  if (allowedUserIds.includes(interaction.user.id)) {
    return true;
  }
  if (interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  if (allowedUserIds.length === 0 && interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return true;
  }
  return false;
}

// Zaregistrovani slash prikazu pri startu
async function registerSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('Registruji slash prikazy (/novy-modul, /update, /moje-id, /posledni-dokumentace)...');
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`Slash prikazy byly zaregistrovany pro server ID: ${GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('Globalni slash prikazy byly zaregistrovany.');
    }
  } catch (error) {
    console.error('Chyba pri registraci prikazu:', error);
  }
}

let isReadyHandled = false;
async function onReady() {
  if (isReadyHandled) return;
  isReadyHandled = true;
  console.log(`Bot je prihlasen jako: ${client.user.tag}`);
  await registerSlashCommands();
  await backfillRecentDocs();
}

client.once('clientReady', onReady);
client.once('ready', onReady);

// ------------------------------------------------------------
// Zpracovani interakci (Slash prikazu)
// ------------------------------------------------------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // 1. Prikaz: /moje-id
  if (commandName === 'moje-id') {
    return interaction.reply({
      content: `**Tvoje Discord udaje:**\n- Uzivatelske jmeno: \`${interaction.user.username}\`\n- Display name: \`${interaction.user.displayName}\`\n- User ID: \`${interaction.user.id}\`\n\n*Toto uzivatelske jmeno (napr. \`${interaction.user.username}\`) muzes zadat do skriptu na SRV1-DC a PC1-WIN.*`,
      flags: MessageFlags.Ephemeral
    });
  }

  // 2. Prikaz: /posledni-dokumentace
  if (commandName === 'posledni-dokumentace') {
    const rawModule = interaction.options.getString('modul') || '03';
    const formattedModule = rawModule.padStart(2, '0');
    const userKey = interaction.user.username.toLowerCase();
    const userCompletedDir = path.join(COMPLETED_DOCS_DIR, `${userKey}_${formattedModule}`);

    if (!fs.existsSync(userCompletedDir)) {
      const modCfg = MODULE_CONFIG[formattedModule];
      const stepsNote = modCfg && modCfg.vms
        ? (modCfg.vms.length === 1 ? `Krok 1 (${modCfg.vms[0]})` : `všechny požadované kroky (${modCfg.vms.join(', ')})`)
        : 'příslušné skripty';
      return interaction.reply({
        content: `Zatim pro tebe nemam zadnou hotovou dokumentaci pro **Modul ${formattedModule}**.\nNejprve prosim spust ${stepsNote} ve virtualnim stroji.`,
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      const overeniPath = path.join(userCompletedDir, 'overeni.md');
      const postupPath = path.join(userCompletedDir, 'postup.md');
      const zipFiles = fs.readdirSync(userCompletedDir).filter(f => f.endsWith('.zip'));

      const files = [];
      if (zipFiles.length > 0) {
        files.push(new AttachmentBuilder(path.join(userCompletedDir, zipFiles[0]), { name: zipFiles[0] }));
      } else {
        if (fs.existsSync(overeniPath)) files.push(new AttachmentBuilder(overeniPath, { name: 'overeni.md' }));
        if (fs.existsSync(postupPath)) files.push(new AttachmentBuilder(postupPath, { name: 'postup.md' }));
      }

      return interaction.reply({
        content: `Tady je tvoje naposledy vygenerovana dokumentace pro **Modul ${formattedModule}**:`,
        files: files,
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error('Chyba pri odesilani posledni dokumentace:', err);
      return interaction.reply({
        content: `Chyba pri nacitani souboru: ${err.message}`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // 3. Prikazy: /novy-modul a /update (vyzaduji opravneni)
  if (commandName === 'novy-modul' || commandName === 'update') {
    if (!isUserAuthorized(interaction)) {
      return interaction.reply({
        content: 'Nemate opravneni pouzivat tento oznamovaci prikaz.',
        flags: MessageFlags.Ephemeral
      });
    }

    const channelId = ANNOUNCEMENT_CHANNEL_ID || interaction.channelId;
    let targetChannel;
    try {
      targetChannel = await client.channels.fetch(channelId);
    } catch (err) {
      return interaction.reply({
        content: `Nepodarilo se najit kanal pro oznameni (ID: ${channelId}). Zkontrolujte nastaveni v .env.`,
        flags: MessageFlags.Ephemeral
      });
    }

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
        .setColor(0x22c55e)
        .setTitle(`Vysel novy modul: Modul ${formattedCislo} - ${nazev}`)
        .setURL(praxeUrl)
        .setDescription(
          popis
            ? `${popis}\n\nCvineni je jiz pripraveno a nahrane na webovem portalu OPS!`
            : `Novy prakticky modul je k dispozici! Vsechny kroky, PowerShell konfigurace i testy jsou nahrany na portalu.`
        )
        .addFields(
          { name: 'Otevrit cviceni na webu', value: `[Prejit do interaktivni Praxe](${praxeUrl})`, inline: true },
          { name: 'Zadani', value: `[Otevrit zadani](${zadaniUrl})`, inline: true },
          { name: 'Reseni', value: `[Otevrit reseni](${reseniUrl})`, inline: true }
        )
        .setFooter({ text: 'OPS Portal - Skolni prakticka cviceni' })
        .setTimestamp();

      let contentPing = '';
      if (pingChoice === '@everyone') contentPing = '@everyone';
      else if (pingChoice === '@here') contentPing = '@here';

      try {
        await targetChannel.send({ content: contentPing || undefined, embeds: [embed] });
        return interaction.reply({
          content: `Novy modul byl uspesne publikovan v kanalu <#${targetChannel.id}>.`,
          flags: MessageFlags.Ephemeral
        });
      } catch (err) {
        return interaction.reply({ content: `Chyba pri odesilani: ${err.message}`, flags: MessageFlags.Ephemeral });
      }
    }

    if (commandName === 'update') {
      const zprava = interaction.options.getString('zprava').trim();
      const nadpis = interaction.options.getString('nadpis') || 'Aktualizace OPS Portalu';
      const pingChoice = interaction.options.getString('ping') || 'none';

      const embed = new EmbedBuilder()
        .setColor(0x3b82f6)
        .setTitle(nadpis)
        .setURL(PORTAL_URL)
        .setDescription(zprava)
        .addFields({ name: 'Web portalu', value: `[Otevrit OPS Portal](${PORTAL_URL})`, inline: false })
        .setFooter({ text: 'OPS Portal - Automaticka oznameni' })
        .setTimestamp();

      let contentPing = '';
      if (pingChoice === '@everyone') contentPing = '@everyone';
      else if (pingChoice === '@here') contentPing = '@here';

      try {
        await targetChannel.send({ content: contentPing || undefined, embeds: [embed] });
        return interaction.reply({
          content: `Aktualizace byla uspesne publikovana v kanalu <#${targetChannel.id}>.`,
          flags: MessageFlags.Ephemeral
        });
      } catch (err) {
        return interaction.reply({ content: `Chyba pri odesilani: ${err.message}`, flags: MessageFlags.Ephemeral });
      }
    }
  }
});

// ------------------------------------------------------------
// Zpracovani prichozich zprav z dokumentacniho webhooku
// ------------------------------------------------------------
const processedMessageIds = new Set();

// Pomocna funkce: spolehlive vyhledani clena na serveru pro ping a DM
async function findTargetMember(guild, cleanKey) {
  if (!guild || !cleanKey) return null;
  const key = String(cleanKey).toLowerCase().trim().replace(/^<@!?(\d+)>$/, '$1').replace(/^@/, '');
  try {
    if (/^\d{17,20}$/.test(key)) {
      return await guild.members.fetch(key).catch(() => null);
    }

    const searchResult = await guild.members.fetch({ query: key, limit: 5 }).catch(() => null);
    if (searchResult && searchResult.size > 0) {
      const match = searchResult.find(m =>
        m.user.username.toLowerCase() === key ||
        (m.nickname && m.nickname.toLowerCase() === key) ||
        m.displayName.toLowerCase() === key ||
        m.id === key
      );
      if (match) return match;
    }
    const members = await guild.members.fetch().catch(() => null);
    if (members) {
      return members.find(m =>
        m.user.username.toLowerCase() === key ||
        (m.nickname && m.nickname.toLowerCase() === key) ||
        m.displayName.toLowerCase() === key ||
        m.id === key
      ) || null;
    }
  } catch (e) {
    console.warn(`[DOC] Nelze vyhledat clena ${key}:`, e.message);
  }
  return null;
}

async function handleDocMessage(message, isBackfill = false) {
  // Ignorujeme zpravy od sebe sama
  if (message.author.id === client.user.id) return;
  if (processedMessageIds.has(message.id)) return;

  // Kontrola, zda zprava patri do dokumentacniho kanalu nebo nese identifikator / doc prilohu
  const isDocChannel = message.channelId === DOCS_CHANNEL_ID;
  const hasDocTag = message.content && (message.content.includes('[WELL_OPS_DOC') || message.content.includes('WELL_OPS_DOC'));
  const hasDocAttachment = Boolean(message.attachments && message.attachments.some(a =>
    a.name && (a.name.endsWith('.json') && (a.name.includes('data') || a.name.includes('doc') || a.name.startsWith('srv') || a.name.startsWith('pc')))
  ));
  if (!isDocChannel && !hasDocTag && !hasDocAttachment) return;

  // Zkontrolujeme, zda zprava obsahuje JSON prilohu
  if (!message.attachments || message.attachments.size === 0) return;

  const jsonAttachment = message.attachments.find(a => a.name && a.name.endsWith('.json'));
  if (!jsonAttachment) return;

  processedMessageIds.add(message.id);
  console.log(`[DOC] Prijata JSON data z webhooku: ${jsonAttachment.name} (zprava: ${message.id}, backfill: ${isBackfill})`);

  try {
    const res = await fetch(jsonAttachment.url);
    if (!res.ok) throw new Error(`HTTP ${res.status} pri stahovani prilohy`);
    const data = await res.json();

    if (!data.module || !data.part || !data.discordUser) {
      console.warn('[DOC] Neplatny format JSON dat z VM:', data);
      return;
    }

    const formattedModule = String(data.module).padStart(2, '0');
    const userKey = data.discordUser.toLowerCase().trim().replace(/^@/, '');
    const pendingFile = path.join(PENDING_DOCS_DIR, `${userKey}_${formattedModule}.json`);

    // Vyhledani clena pro ping
    const targetMember = await findTargetMember(message.guild, userKey);
    const userMention = targetMember ? `<@${targetMember.id}>` : `@${data.discordUser}`;

    let state = {};
    if (fs.existsSync(pendingFile)) {
      try {
        state = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
      } catch (e) {
        state = {};
      }
    }

    // Ulozime danou cast (srv1, srv2, pc1)
    const partUpper = String(data.part).toUpperCase();
    const partKey = partUpper.toLowerCase();
    state[partKey] = data;
    state[`${partKey}Time`] = new Date().toISOString();

    fs.writeFileSync(pendingFile, JSON.stringify(state, null, 2), 'utf8');

    // Zjistime pozadovane casti pro dany modul
    const modConfig = MODULE_CONFIG[formattedModule] || {
      requiredParts: data.requiredParts || (data.totalParts === 1 ? [partUpper] : ['SRV1', 'PC1'])
    };
    const requiredParts = modConfig.requiredParts;
    const receivedParts = requiredParts.filter(p => Boolean(state[p.toLowerCase()]));
    const isComplete = receivedParts.length === requiredParts.length;

    // 1. Zkontrolujeme, zda jeste chybi nejake casti
    if (!isComplete) {
      const currentStep = receivedParts.length;
      const totalSteps = requiredParts.length;
      const remaining = requiredParts.filter(p => !state[p.toLowerCase()]);
      const nextPart = remaining[0];
      const nextVmName = nextPart === 'PC1' ? 'PC1-WIN' : (nextPart === 'SRV2' ? 'SRV2-FS' : 'SRV1-DC');

      console.log(`[DOC] Zaznamenana cast ${data.part} (${currentStep}/${totalSteps}) pro ${userKey} (Modul ${formattedModule}). Cekam na: ${remaining.join(', ')}`);
      if (!isBackfill) {
        await message.channel.send({
          content: `**[KROK ${currentStep}/${totalSteps} PRIJAT]**\nCast **${data.part}** pro studenta ${userMention} (Modul ${formattedModule}) byla uspesne zaznamenana!\nNyni otevrete stroj **${nextVmName}** a spustte dalsi prikaz.`
        });
      }
      return;
    }

    // 2. Mame VSECHNY potrebne casti (at uz 1, 2 nebo 3)!
    console.log(`[DOC] Mame vsechny casti (${requiredParts.join(', ')}) pro ${userKey} (Modul ${formattedModule})! Generuji finalni dokumentaci...`);
    if (!isBackfill && requiredParts.length > 1) {
      await message.channel.send({
        content: `**[KROK ${requiredParts.length}/${requiredParts.length} PRIJAT]**\n${userMention} Vsechny potrebne casti pro **Modul ${formattedModule}** byly uspesne prijaty!\nNyni automaticky propojuji zaznamy a generuji soubory dokumentace. Do 5 minut (behem par okamziku) zde bude pripraven tvuj finalni ZIP archiv.`
      });
    }

    const templatesDir = path.join(__dirname, 'templates', formattedModule);
    const overeniTemplatePath = path.join(templatesDir, 'overeni.md');
    const postupTemplatePath = path.join(templatesDir, 'postup.md');

    if (!fs.existsSync(overeniTemplatePath) || !fs.existsSync(postupTemplatePath)) {
      throw new Error(`Sablony pro Modul ${formattedModule} nebyly nalezeny ve slozce ${templatesDir}`);
    }

    let overeni = fs.readFileSync(overeniTemplatePath, 'utf8');
    let postup = fs.readFileSync(postupTemplatePath, 'utf8');

    const st = state.srv1?.student || state.pc1?.student || state.srv2?.student || {};
    const srv1O = state.srv1?.srv1_overeni || {};
    const srv1P = state.srv1?.srv1_postup || {};
    const srv2O = state.srv2?.srv2_overeni || {};
    const srv2P = state.srv2?.srv2_postup || {};
    const pc1O = state.pc1?.pc1_overeni || {};
    const pc1P = state.pc1?.pc1_postup || {};

    const names = (st.fullName || 'Student_Jmeno').trim().split(/\s+/);
    const surname = names.length > 1 ? names[names.length - 1] : names[0];
    const surnameAscii = removeDiacritics(surname).toLowerCase();
    const domainPrefix = (st.domain || '').split('.')[0] || surnameAscii || 'prijmeni';

    // 1. Nahrazeni hlavicky studenta v obou souborech a sanitizace placeholderu
    const replaceStudentInfo = (doc) => {
      return doc
        .replace(/\| Jméno a příjmení \| DOPLNIT \|/g, `| Jméno a příjmení | ${st.fullName || 'Student'} |`)
        .replace(/\| Třída \| DOPLNIT \|/g, `| Třída | ${st.className || 'T3A'} |`)
        .replace(/\| Datum vypracování \| DOPLNIT \|/g, `| Datum vypracování | ${st.date || new Date().toLocaleDateString('cs-CZ')} |`)
        .replace(/\| Číslo vašeho pracoviště \(N\) \| DOPLNIT \(síť `192\.168\.N\.0\/24`\) \|/g, `| Číslo vašeho pracoviště (N) | ${st.workstationX || 2} (síť \`192.168.${st.workstationX || 2}.0/24\`) |`)
        .replace(/\| Vaše doména \| DOPLNIT \(např\. `novak\.cyberschool\.internal`\) \|/g, `| Vaše doména | \`${st.domain || 'cyberschool.internal'}\` |`)
        .replace(/<prijmeni>/gi, domainPrefix)
        .replace(/prijmeni\.cyberschool\.internal/gi, st.domain || `${domainPrefix}.cyberschool.internal`);
    };

    overeni = replaceStudentInfo(overeni);
    postup = replaceStudentInfo(postup);

    // 2. Vyplneni overeni.md
    if (formattedModule === '00') {
      if (srv1O.V0_otisk) overeni = fillDocBlock(overeni, '**M0-SRV1.V0-O**', srv1O.V0_otisk, true);
      if (srv1O.V2_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V2-D1**', srv1O.V2_d1, true);
      if (srv1O.V3_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V3-D1**', srv1O.V3_d1, true);
      if (srv1O.V4_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V4-D1**', srv1O.V4_d1, true);
      if (srv1O.V5_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V5-D1**', srv1O.V5_d1, true);
      if (srv1O.V6_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V6-D1**', srv1O.V6_d1, true);
      if (srv1O.V7_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V7-D1**', srv1O.V7_d1, true);
      if (srv1O.V8_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V8-D1**', srv1O.V8_d1, true);
      if (srv1O.V9_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V9-D1**', srv1O.V9_d1, true);
      if (srv1O.V10_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V10-D1**', srv1O.V10_d1, true);
      if (srv1O.V11_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V11-D1**', srv1O.V11_d1, true);
      if (srv1O.V13_d1) overeni = fillDocBlock(overeni, '**M0-SRV1.V13-D1**', srv1O.V13_d1, true);

      if (srv2O.V0_otisk) overeni = fillDocBlock(overeni, '**M0-SRV2.V0-O**', srv2O.V0_otisk, true);
      if (srv2O.V1_d2) overeni = fillDocBlock(overeni, '**M0-SRV2.V1-D2**', srv2O.V1_d2, true);
      if (srv2O.V2_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V2-D1**', srv2O.V2_d1, true);
      if (srv2O.V3_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V3-D1**', srv2O.V3_d1, true);
      if (srv2O.V4_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V4-D1**', srv2O.V4_d1, true);
      if (srv2O.V5_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V5-D1**', srv2O.V5_d1, true);
      if (srv2O.V6_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V6-D1**', srv2O.V6_d1, true);
      if (srv2O.V7_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V7-D1**', srv2O.V7_d1, true);
      if (srv2O.V8_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V8-D1**', srv2O.V8_d1, true);
      if (srv2O.V9_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V9-D1**', srv2O.V9_d1, true);
      if (srv2O.V10_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V10-D1**', srv2O.V10_d1, true);
      if (srv2O.V11_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V11-D1**', srv2O.V11_d1, true);
      if (srv2O.V13_d1) overeni = fillDocBlock(overeni, '**M0-SRV2.V13-D1**', srv2O.V13_d1, true);

      if (pc1O.V0_otisk) overeni = fillDocBlock(overeni, '**M0-PC1.V0-O**', pc1O.V0_otisk, true);
      if (pc1O.V2_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V2-D1**', pc1O.V2_d1, true);
      if (pc1O.V3_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V3-D1**', pc1O.V3_d1, true);
      if (pc1O.V4_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V4-D1**', pc1O.V4_d1, true);
      if (pc1O.V5_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V5-D1**', pc1O.V5_d1, true);
      if (pc1O.V6_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V6-D1**', pc1O.V6_d1, true);
      if (pc1O.V7_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V7-D1**', pc1O.V7_d1, true);
      if (pc1O.V8_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V8-D1**', pc1O.V8_d1, true);
      if (pc1O.V9_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V9-D1**', pc1O.V9_d1, true);
      if (pc1O.V10_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V10-D1**', pc1O.V10_d1, true);
      if (pc1O.V11_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V11-D1**', pc1O.V11_d1, true);
      if (pc1O.V13_d1) overeni = fillDocBlock(overeni, '**M0-PC1.V13-D1**', pc1O.V13_d1, true);

      // 3. Vyplneni postup.md pro Modul 00
      if (srv1P.P1) postup = fillDocBlock(postup, '**M0-SRV1.P1**', srv1P.P1, true);
      if (srv1P.P2) postup = fillDocBlock(postup, '**M0-SRV1.P2**', srv1P.P2, true);
      if (srv1P.P3) postup = fillDocBlock(postup, '**M0-SRV1.P3**', srv1P.P3, true);
      if (srv1P.P4) postup = fillDocBlock(postup, '**M0-SRV1.P4**', srv1P.P4, true);
      if (srv1P.P5) postup = fillDocBlock(postup, '**M0-SRV1.P5**', srv1P.P5, true);
      if (srv1P.P6) postup = fillDocBlock(postup, '**M0-SRV1.P6**', srv1P.P6, true);
      if (srv1P.P7) postup = fillDocBlock(postup, '**M0-SRV1.P7**', srv1P.P7, true);

      if (srv2P.P1) postup = fillDocBlock(postup, '**M0-SRV2.P1**', srv2P.P1, true);
      if (srv2P.P2) postup = fillDocBlock(postup, '**M0-SRV2.P2**', srv2P.P2, true);
      if (srv2P.P3) postup = fillDocBlock(postup, '**M0-SRV2.P3**', srv2P.P3, true);
      if (srv2P.P4) postup = fillDocBlock(postup, '**M0-SRV2.P4**', srv2P.P4, true);
      if (srv2P.P5) postup = fillDocBlock(postup, '**M0-SRV2.P5**', srv2P.P5, true);
      if (srv2P.P6) postup = fillDocBlock(postup, '**M0-SRV2.P6**', srv2P.P6, true);
      if (srv2P.P7) postup = fillDocBlock(postup, '**M0-SRV2.P7**', srv2P.P7, true);

      if (pc1P.P1) postup = fillDocBlock(postup, '**M0-PC1.P1**', pc1P.P1, true);
      if (pc1P.P2) postup = fillDocBlock(postup, '**M0-PC1.P2**', pc1P.P2, true);
      if (pc1P.P3) postup = fillDocBlock(postup, '**M0-PC1.P3**', pc1P.P3, true);
      if (pc1P.P4) postup = fillDocBlock(postup, '**M0-PC1.P4**', pc1P.P4, true);
      if (pc1P.P5) postup = fillDocBlock(postup, '**M0-PC1.P5**', pc1P.P5, true);
      if (pc1P.P6) postup = fillDocBlock(postup, '**M0-PC1.P6**', pc1P.P6, true);
      if (pc1P.P7) postup = fillDocBlock(postup, '**M0-PC1.P7**', pc1P.P7, true);
    } else if (formattedModule === '01') {
      if (srv1O.V0_otisk) overeni = fillDocBlock(overeni, '**M1-SRV1.V0-O**', srv1O.V0_otisk, true);
      if (srv1O.V1_d1) overeni = fillDocBlock(overeni, '**M1-SRV1.V1-D1**', srv1O.V1_d1, true);
      if (srv1O.V4_d1) overeni = fillDocBlock(overeni, '**M1-SRV1.V4-D1**', srv1O.V4_d1, true);
      if (srv1O.V4_d2) overeni = fillDocBlock(overeni, '**M1-SRV1.V4-D2**', srv1O.V4_d2, true);
      if (srv1O.V6_d1) overeni = fillDocBlock(overeni, '**M1-SRV1.V6-D1**', srv1O.V6_d1, true);

      // 3. Vyplneni postup.md pro Modul 01
      if (srv1P.P1) postup = fillDocBlock(postup, '**M1-SRV1.P1**', srv1P.P1, true);
      if (srv1P.P2) postup = fillDocBlock(postup, '**M1-SRV1.P2**', srv1P.P2, true);
      if (srv1P.P3) postup = fillDocBlock(postup, '**M1-SRV1.P3**', srv1P.P3, true);
    } else if (formattedModule === '02') {
      if (srv1O.V0_otisk) overeni = fillDocBlock(overeni, '**M2-SRV1.V0-O**', srv1O.V0_otisk, true);
      if (srv1O.V1_d2) overeni = fillDocBlock(overeni, '**M2-SRV1.V1-D2**', srv1O.V1_d2, false);
      if (srv1O.V2_d1) overeni = fillDocBlock(overeni, '**M2-SRV1.V2-D1**', srv1O.V2_d1, true);
      if (srv1O.V3_d1) overeni = fillDocBlock(overeni, '**M2-SRV1.V3-D1**', srv1O.V3_d1, true);
      if (srv1O.V4_d1) overeni = fillDocBlock(overeni, '**M2-SRV1.V4-D1**', srv1O.V4_d1, true);

      if (pc1O.V0_otisk) overeni = fillDocBlock(overeni, '**M2-PC1.V0-O**', pc1O.V0_otisk, true);
      if (pc1O.V1_d1) overeni = fillDocBlock(overeni, '**M2-PC1.V1-D1**', pc1O.V1_d1, false);
      if (pc1O.V1_d2) overeni = fillDocBlock(overeni, '**M2-PC1.V1-D2**', pc1O.V1_d2, true);
      if (pc1O.V2_d1) overeni = fillDocBlock(overeni, '**M2-PC1.V2-D1**', pc1O.V2_d1, true);

      // 3. Vyplneni postup.md
      if (srv1P.P1) postup = fillDocBlock(postup, '**M2-SRV1.P1**', srv1P.P1, true);
      if (srv1P.P2) postup = fillDocBlock(postup, '**M2-SRV1.P2**', srv1P.P2, true);
      if (srv1P.P3) postup = fillDocBlock(postup, '**M2-SRV1.P3**', srv1P.P3, true);
      if (srv1P.P4) postup = fillDocBlock(postup, '**M2-SRV1.P4**', srv1P.P4, true);
      if (srv1P.P5) postup = fillDocBlock(postup, '**M2-SRV1.P5**', srv1P.P5, true);

      if (pc1P.P1) postup = fillDocBlock(postup, '**M2-PC1.P1**', pc1P.P1, true);
      if (pc1P.P2) postup = fillDocBlock(postup, '**M2-PC1.P2**', pc1P.P2, true);
    } else if (formattedModule === '03') {
      if (srv1O.V0_otisk) overeni = fillDocBlock(overeni, '**M3-SRV1.V0-O**', srv1O.V0_otisk, true);
      if (srv1O.V1_d1) overeni = fillDocBlock(overeni, '**M3-SRV1.V1-D1**', srv1O.V1_d1, false);
      if (srv1O.V2_d1) overeni = fillDocBlock(overeni, '**M3-SRV1.V2-D1**', srv1O.V2_d1, false);
      if (srv1O.V2_d2) overeni = fillDocBlock(overeni, '**M3-SRV1.V2-D2**', srv1O.V2_d2, true);

      if (pc1O.V0_otisk) overeni = fillDocBlock(overeni, '**M3-PC1.V0-O**', pc1O.V0_otisk, true);
      if (pc1O.V1_d1) overeni = fillDocBlock(overeni, '**M3-PC1.V1-D1**', pc1O.V1_d1, true);
      if (pc1O.V2_d1) overeni = fillDocBlock(overeni, '**M3-PC1.V2-D1**', pc1O.V2_d1, true);
      if (pc1O.V3_d1) overeni = fillDocBlock(overeni, '**M3-PC1.V3-D1**', pc1O.V3_d1, true);
      if (pc1O.V4_d1) overeni = fillDocBlock(overeni, '**M3-PC1.V4-D1**', pc1O.V4_d1, true);
      if (pc1O.V5_d1) overeni = fillDocBlock(overeni, '**M3-PC1.V5-D1**', pc1O.V5_d1, true);

      // 3. Vyplneni postup.md
      if (srv1P.P1) postup = fillDocBlock(postup, '**M3-SRV1.P1**', srv1P.P1, true);
      if (srv1P.P2) postup = fillDocBlock(postup, '**M3-SRV1.P2**', srv1P.P2, true);
      if (srv1P.P3) postup = fillDocBlock(postup, '**M3-SRV1.P3**', srv1P.P3, true);
      if (srv1P.P4) postup = fillDocBlock(postup, '**M3-SRV1.P4**', srv1P.P4, true);
      if (srv1P.P5) postup = fillDocBlock(postup, '**M3-SRV1.P5**', srv1P.P5, true);

      if (pc1P.P1) postup = fillDocBlock(postup, '**M3-PC1.P1**', pc1P.P1, true);
      if (pc1P.P2) postup = fillDocBlock(postup, '**M3-PC1.P2**', pc1P.P2, true);
    }

    // 4. Vytvoreni ZIP archivu
    const forename = names.length > 1 ? names[0] : 'Student';
    const cleanZipBase = `${removeDiacritics(surname)}_${removeDiacritics(forename)}_Modul${formattedModule}`;
    const zipFileName = `${cleanZipBase}.zip`;

    const zip = new AdmZip();
    zip.addFile('overeni.md', Buffer.from(overeni, 'utf8'));
    zip.addFile('postup.md', Buffer.from(postup, 'utf8'));
    const zipBuffer = zip.toBuffer();

    // 5. Ulozeni dokoncene kopie pro prikaz /posledni-dokumentace
    const userCompletedDir = path.join(COMPLETED_DOCS_DIR, `${userKey}_${formattedModule}`);
    fs.mkdirSync(userCompletedDir, { recursive: true });
    fs.writeFileSync(path.join(userCompletedDir, 'overeni.md'), overeni, 'utf8');
    fs.writeFileSync(path.join(userCompletedDir, 'postup.md'), postup, 'utf8');
    fs.writeFileSync(path.join(userCompletedDir, zipFileName), zipBuffer);

    // 6. Odeslani pouze .zip archivu
    const attachments = [
      new AttachmentBuilder(zipBuffer, { name: zipFileName })
    ];

    let screenshotNotice = 'V souboru `overeni.md` u bodu **M3-SRV1.V1-D2** (*Dukaz: Screenshot DNS Manageru s doprednou zonou*) je potreba udelat a vlozit screenshot z Windows Serveru. Vsechny ostatni overovaci vystupy a postupy jsou jiz kompletne vyplneny!';
    let dmWarning = '> **Dulezite upozorneni:** V souboru `overeni.md` u bodu **M3-SRV1.V1-D2** – *Dukaz: Screenshot DNS Manageru s doprednou zonou* je potreba udelat screenshot.';
    let embedDesc = `Uspesne byly zaznamenany a spojeny vystupy ze serveru **SRV1-DC** i klienta **PC1-WIN** do archivu **${zipFileName}**.`;

    if (formattedModule === '00') {
      screenshotNotice = 'V souboru `overeni.md` je nekolik bodu vyzadujicich rucni screenshoty (napr. parametry VM v hypervizoru a nastaveni PC1). Textove overovaci vystupy a postupy ze vsech 3 stroju jsou jiz kompletne vyplneny!';
      dmWarning = '> **Upozorneni:** V souboru `overeni.md` nezapomente rucne vlozit pozadovane screenshoty z hypervizoru/nastaveni.';
      embedDesc = `Uspesne byly zaznamenany a spojeny vystupy ze stroju **SRV1-DC**, **SRV2-FS** i **PC1-WIN** do archivu **${zipFileName}**.`;
    } else if (formattedModule === '01') {
      screenshotNotice = 'V souboru `overeni.md` u bodu **M1-SRV1.V2-D1**, **M1-SRV1.V3-D1** a **M1-SRV1.V5-D1** je potreba vlozit screenshoty z Windows Serveru (Server Manager a ADUC). Vsechny textove overovaci vystupy a postupy jsou jiz kompletne vyplneny!';
      dmWarning = '> **Dulezite upozorneni:** V souboru `overeni.md` u bodu **M1-SRV1.V2-D1**, **V3-D1** a **V5-D1** (Server Manager / ADUC) je potreba vlozit screenshoty.';
      embedDesc = `Uspesne byly zaznamenany a pripraveny vystupy ze serveru **SRV1-DC** do archivu **${zipFileName}**.`;
    } else if (formattedModule === '02') {
      screenshotNotice = 'V souboru `overeni.md` u bodu **M2-SRV1.V1-D1** (*Dukaz: Server Manager — role DHCP bez varovani a DHCP konzole se zelene oznacenym serverem*) je potreba udelat a vlozit screenshot z Windows Serveru. Vsechny ostatni overovaci vystupy a postupy jsou jiz kompletne vyplneny!';
      dmWarning = '> **Dulezite upozorneni:** V souboru `overeni.md` u bodu **M2-SRV1.V1-D1** – *Dukaz: Server Manager — role DHCP bez varovani a DHCP konzole se zelene oznacenym serverem* je potreba udelat screenshot.';
    }

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle(`Dokumentace Modul ${formattedModule} je kompletni!`)
      .setDescription(embedDesc)
      .addFields(
        { name: 'Resitel', value: `${st.fullName || userKey} (${st.className || 'T3A'})`, inline: true },
        { name: 'Pracoviste', value: `Pracoviste ${st.workstationX || 2}`, inline: true },
        { name: 'Domena', value: `\`${st.domain || 'cyberschool.internal'}\``, inline: true },
        {
          name: 'POVINNY SCREENSHOT K DOPLNENI',
          value: screenshotNotice,
          inline: false
        }
      )
      .setFooter({ text: 'OPS Portal - Automaticke generovani dokumentace' })
      .setTimestamp();

    // Pokus o zaslani do soukrome zpravy (DM)
    let dmSent = false;
    if (targetMember) {
      try {
        await targetMember.send({
          content: `Ahoj ${userMention}! Zde je tvoje vygenerovana dokumentace pro **Modul ${formattedModule}** v ZIP archivu.\n\n` +
            `${dmWarning}`,
          embeds: [embed],
          files: attachments
        });
        dmSent = true;
      } catch (dmErr) {
        console.warn(`[DOC] Nepodarilo se odeslat DM uzivateli ${userKey}: ${dmErr.message}`);
      }
    }

    // Odeslani do kanalu
    const dmNote = dmSent
      ? '(Archiv byl zaroven odeslan do tve soukrome zpravy / DM!)'
      : '(Pokud ti neprisla DM, mas v nastaveni Discordu vypnute prime zpravy. Archiv najdes prilozen nize.)';

    const channelContent = `${userMention} Tvoje dokumentace pro **Modul ${formattedModule}** je hotova a pripravena v prilozenem ZIP archivu!\n\n` +
      `${dmWarning}\n` +
      `${dmNote}`;

    await message.channel.send({
      content: channelContent,
      embeds: [embed],
      files: attachments
    });

    // Uklidime pending data, protoze je dokumentace hotova
    fs.unlinkSync(pendingFile);
    console.log(`[DOC] Dokumentace pro ${userKey} uspesne odeslana a dokoncena!`);

  } catch (err) {
    console.error('Chyba pri zpracovani dokumentace z webhooku:', err);
    await message.channel.send({
      content: `Nastala chyba pri zpracovani dokumentace z VM: \`${err.message}\``
    });
  }
}

// Event listener pro nove prichozi zpravy
client.on('messageCreate', async (message) => {
  await handleDocMessage(message, false);
});

// Zpetne nacteni a zpracovani nedokoncenych zprav z kanalu pri startu
async function backfillRecentDocs() {
  if (!DOCS_CHANNEL_ID) return;
  try {
    const channel = await client.channels.fetch(DOCS_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;
    console.log(`[BACKFILL] Kontroluji predchozi zpravy v dokumentacnim kanalu (${DOCS_CHANNEL_ID})...`);
    const fetched = await channel.messages.fetch({ limit: 50 });
    const sorted = Array.from(fetched.values()).reverse();
    for (const msg of sorted) {
      if (msg.author.id === client.user.id) continue;
      if (msg.attachments && msg.attachments.size > 0) {
        await handleDocMessage(msg, true);
      }
    }
  } catch (err) {
    console.warn('[BACKFILL] Chyba pri kontrole historie zprav:', err.message);
  }
}

// Spusteni bota
if (!TOKEN || TOKEN === 'sem_vloz_token_bota') {
  console.error('CHYBA: Nemas vyplneny DISCORD_TOKEN v souboru .env!');
  console.log('Zkopiruj .env.example jako .env a dopln sve udaje.');
  process.exit(1);
}

client.login(TOKEN);
