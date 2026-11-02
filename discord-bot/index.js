const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  AttachmentBuilder
} = require('discord.js');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const ANNOUNCEMENT_CHANNEL_ID = process.env.ANNOUNCEMENT_CHANNEL_ID;
const DOCS_CHANNEL_ID = process.env.DOCS_CHANNEL_ID || '1566771935168299108';
const PORTAL_URL = process.env.PORTAL_URL || 'https://deepycat.github.io/well_ops';

// Slozky pro ukladani prubeznych a dokoncenych dokumentaci
const PENDING_DOCS_DIR = path.join(__dirname, 'pending_docs');
const COMPLETED_DOCS_DIR = path.join(__dirname, 'completed_docs');
fs.mkdirSync(PENDING_DOCS_DIR, { recursive: true });
fs.mkdirSync(COMPLETED_DOCS_DIR, { recursive: true });

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

// Inicializace Discord klienta se standardnimi (neprivilegovanymi) intenty
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ]
});

// Pomocna funkce: odstraneni diakritiky pro nazev ZIP souboru
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Pomocna funkce: bezpecne nahrazeni DOPLNIT v bloku podle znacky
function fillDocBlock(content, marker, newText, markDone = true) {
  const esc = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${esc}[\\s\\S]*?\`\`\`text\\r?\\n)DOPLNIT(\\r?\\n\`\`\`)`);
  let result = content.replace(regex, `$1${newText}$2`);
  if (markDone) {
    const doneRegex = new RegExp(`(${esc}[\\s\\S]*?)- \\[ \\] Hotovo`);
    result = result.replace(doneRegex, `$1- [x] Hotovo`);
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

client.once('ready', async () => {
  console.log(`Bot je prihlasen jako: ${client.user.tag}`);
  await registerSlashCommands();
});

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
      ephemeral: true
    });
  }

  // 2. Prikaz: /posledni-dokumentace
  if (commandName === 'posledni-dokumentace') {
    const rawModule = interaction.options.getString('modul') || '03';
    const formattedModule = rawModule.padStart(2, '0');
    const userKey = interaction.user.username.toLowerCase();
    const userCompletedDir = path.join(COMPLETED_DOCS_DIR, `${userKey}_${formattedModule}`);

    if (!fs.existsSync(userCompletedDir)) {
      return interaction.reply({
        content: `Zatim pro tebe nemam zadnou hotovou dokumentaci pro **Modul ${formattedModule}**.\nNejprve prosim spust Krok 1 (SRV1-DC) a Krok 2 (PC1-WIN) ve virtualnim stroji.`,
        ephemeral: true
      });
    }

    try {
      const overeniPath = path.join(userCompletedDir, 'overeni.md');
      const postupPath = path.join(userCompletedDir, 'postup.md');
      const zipFiles = fs.readdirSync(userCompletedDir).filter(f => f.endsWith('.zip'));

      const files = [];
      if (fs.existsSync(overeniPath)) files.push(new AttachmentBuilder(overeniPath, { name: 'overeni.md' }));
      if (fs.existsSync(postupPath)) files.push(new AttachmentBuilder(postupPath, { name: 'postup.md' }));
      if (zipFiles.length > 0) {
        files.push(new AttachmentBuilder(path.join(userCompletedDir, zipFiles[0]), { name: zipFiles[0] }));
      }

      return interaction.reply({
        content: `Tady je tvoje naposledy vygenerovana dokumentace pro **Modul ${formattedModule}**:`,
        files: files,
        ephemeral: true
      });
    } catch (err) {
      console.error('Chyba pri odesilani posledni dokumentace:', err);
      return interaction.reply({
        content: `Chyba pri nacitani souboru: ${err.message}`,
        ephemeral: true
      });
    }
  }

  // 3. Prikazy: /novy-modul a /update (vyzaduji opravneni)
  if (commandName === 'novy-modul' || commandName === 'update') {
    if (!isUserAuthorized(interaction)) {
      return interaction.reply({
        content: 'Nemate opravneni pouzivat tento oznamovaci prikaz.',
        ephemeral: true
      });
    }

    const channelId = ANNOUNCEMENT_CHANNEL_ID || interaction.channelId;
    let targetChannel;
    try {
      targetChannel = await client.channels.fetch(channelId);
    } catch (err) {
      return interaction.reply({
        content: `Nepodarilo se najit kanal pro oznameni (ID: ${channelId}). Zkontrolujte nastaveni v .env.`,
        ephemeral: true
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
          ephemeral: true
        });
      } catch (err) {
        return interaction.reply({ content: `Chyba pri odesilani: ${err.message}`, ephemeral: true });
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
          ephemeral: true
        });
      } catch (err) {
        return interaction.reply({ content: `Chyba pri odesilani: ${err.message}`, ephemeral: true });
      }
    }
  }
});

// ------------------------------------------------------------
// Zpracovani prichozich zprav z dokumentacniho webhooku
// ------------------------------------------------------------
client.on('messageCreate', async (message) => {
  // Ignorujeme zpravy od sebe sama
  if (message.author.id === client.user.id) return;

  // Kontrola, zda zprava patri do dokumentacniho kanalu nebo nese identifikator
  const isDocChannel = message.channelId === DOCS_CHANNEL_ID;
  const hasDocTag = message.content && (message.content.includes('[WELL_OPS_DOC') || message.content.includes('WELL_OPS_DOC'));
  if (!isDocChannel && !hasDocTag) return;

  // Zkontrolujeme, zda zprava obsahuje JSON prilohu
  if (!message.attachments || message.attachments.size === 0) return;

  const jsonAttachment = message.attachments.find(a => a.name && a.name.endsWith('.json'));
  if (!jsonAttachment) return;

  try {
    console.log(`Prijata JSON data z webhooku: ${jsonAttachment.name}`);
    const res = await fetch(jsonAttachment.url);
    if (!res.ok) throw new Error(`HTTP ${res.status} pri stahovani prilohy`);
    const data = await res.json();

    if (!data.module || !data.part || !data.discordUser) {
      console.warn('Neplatny format JSON dat z VM:', data);
      return;
    }

    const formattedModule = String(data.module).padStart(2, '0');
    const userKey = data.discordUser.toLowerCase().trim().replace(/^@/, '');
    const pendingFile = path.join(PENDING_DOCS_DIR, `${userKey}_${formattedModule}.json`);

    let state = {};
    if (fs.existsSync(pendingFile)) {
      try {
        state = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
      } catch (e) {
        state = {};
      }
    }

    // Ulozime danou cast
    if (data.part === 'SRV1') {
      state.srv1 = data;
      state.srv1Time = new Date().toISOString();
    } else if (data.part === 'PC1') {
      state.pc1 = data;
      state.pc1Time = new Date().toISOString();
    }

    fs.writeFileSync(pendingFile, JSON.stringify(state, null, 2), 'utf8');

    // 1. Zkontrolujeme, zda mame pouze JEDNU cast
    if (!state.srv1 || !state.pc1) {
      const isSrv = Boolean(state.srv1);
      const readyPart = isSrv ? 'Serverova cast (SRV1-DC)' : 'Klientska cast (PC1-WIN)';
      const nextStep = isSrv
        ? 'Nyni otevrete stroj **PC1-WIN** a spustte prikaz pro **Krok 2/2**.'
        : 'Cekam jeste na dokonceni serverove casti (**SRV1-DC**).';

      await message.channel.send({
        content: `**[KROK ${isSrv ? '1/2' : '2/2'} PRIJAT]**\n${readyPart} pro studenta **@${data.discordUser}** (Modul ${formattedModule}) byla uspesne zaznamenana!\n${nextStep}`
      });
      return;
    }

    // 2. Mame OBE casti (SRV1-DC i PC1-WIN) -> spojime a posleme!
    console.log(`Mame obe casti pro ${userKey} (Modul ${formattedModule})! Generuji finalni dokumentaci...`);

    const templatesDir = path.join(__dirname, 'templates', formattedModule);
    const overeniTemplatePath = path.join(templatesDir, 'overeni.md');
    const postupTemplatePath = path.join(templatesDir, 'postup.md');

    if (!fs.existsSync(overeniTemplatePath) || !fs.existsSync(postupTemplatePath)) {
      throw new Error(`Sablony pro Modul ${formattedModule} nebyly nalezeny ve slozce ${templatesDir}`);
    }

    let overeni = fs.readFileSync(overeniTemplatePath, 'utf8');
    let postup = fs.readFileSync(postupTemplatePath, 'utf8');

    const st = state.srv1.student || {};
    const srv1O = state.srv1.srv1_overeni || {};
    const srv1P = state.srv1.srv1_postup || {};
    const pc1O = state.pc1.pc1_overeni || {};
    const pc1P = state.pc1.pc1_postup || {};

    // 1. Nahrazeni hlavicky studenta v obou souborech
    const replaceStudentInfo = (doc) => {
      return doc
        .replace(/\| Jméno a příjmení \| DOPLNIT \|/g, `| Jméno a příjmení | ${st.fullName || 'Student'} |`)
        .replace(/\| Třída \| DOPLNIT \|/g, `| Třída | ${st.className || 'T3A'} |`)
        .replace(/\| Datum vypracování \| DOPLNIT \|/g, `| Datum vypracování | ${st.date || new Date().toLocaleDateString('cs-CZ')} |`)
        .replace(/\| Číslo vašeho pracoviště \(N\) \| DOPLNIT \(síť `192\.168\.N\.0\/24`\) \|/g, `| Číslo vašeho pracoviště (N) | ${st.workstationX || 2} (síť \`192.168.${st.workstationX || 2}.0/24\`) |`)
        .replace(/\| Vaše doména \| DOPLNIT \(např\. `novak\.cyberschool\.internal`\) \|/g, `| Vaše doména | \`${st.domain || 'cyberschool.internal'}\` |`);
    };

    overeni = replaceStudentInfo(overeni);
    postup = replaceStudentInfo(postup);

    // 2. Vyplneni overeni.md
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

    // 4. Vytvoreni ZIP archivu
    const names = (st.fullName || 'Student_Jmeno').trim().split(/\s+/);
    const surname = names.length > 1 ? names[names.length - 1] : names[0];
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

    // 6. Vyhledani uzivatele na Discord serveru pro zaslani DM a ping
    let targetMember = null;
    if (message.guild) {
      try {
        const members = await message.guild.members.fetch();
        targetMember = members.find(m =>
          m.user.username.toLowerCase() === userKey ||
          (m.nickname && m.nickname.toLowerCase() === userKey) ||
          m.displayName.toLowerCase() === userKey ||
          m.id === userKey
        );
      } catch (e) {
        console.warn('Nelze nacist seznam clenu:', e.message);
      }
    }

    const attachments = [
      new AttachmentBuilder(Buffer.from(overeni, 'utf8'), { name: 'overeni.md' }),
      new AttachmentBuilder(Buffer.from(postup, 'utf8'), { name: 'postup.md' }),
      new AttachmentBuilder(zipBuffer, { name: zipFileName })
    ];

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle(`Dokumentace Modul ${formattedModule} je kompletni!`)
      .setDescription(`Uspesne byly zaznamenany a spojeny vystupy ze serveru **SRV1-DC** i klienta **PC1-WIN**.`)
      .addFields(
        { name: 'Resitel', value: `${st.fullName || userKey} (${st.className || 'T3A'})`, inline: true },
        { name: 'Pracoviste', value: `Pracoviste ${st.workstationX || 2}`, inline: true },
        { name: 'Domena', value: `\`${st.domain || 'cyberschool.internal'}\``, inline: true },
        { name: 'Poznamka k odevzdani', value: 'V souboru `overeni.md` nezapomente vlozit screenshot DNS Manageru (bod M3-SRV1.V1-D2).', inline: false }
      )
      .setFooter({ text: 'OPS Portal - Automaticke generovani dokumentace' })
      .setTimestamp();

    // Pokus o zaslani do soukrome zpravy (DM)
    let dmSent = false;
    if (targetMember) {
      try {
        await targetMember.send({
          content: `Ahoj! Zde je tvoje vygenerovana a spojana dokumentace pro **Modul ${formattedModule}**:`,
          embeds: [embed],
          files: attachments
        });
        dmSent = true;
      } catch (dmErr) {
        console.warn(`Nepodarilo se odeslat DM uzivateli ${userKey}: ${dmErr.message}`);
      }
    }

    // Odeslani do kanalu
    const userMention = targetMember ? `<@${targetMember.id}>` : `**@${data.discordUser}**`;
    const dmNote = dmSent
      ? '(Zaroven byla odeslana do tve soukrome zpravy / DM!)'
      : '(Pokud ti neprisla DM, mas v nastaveni Discordu vypnute prime zpravy. Soubory mas nize.)';

    await message.channel.send({
      content: `${userMention} Tvoje dokumentace pro **Modul ${formattedModule}** je hotova a pripravena k odevzdani! ${dmNote}`,
      embeds: [embed],
      files: attachments
    });

    // Uklidime pending data, protoze je dokumentace hotova
    fs.unlinkSync(pendingFile);
    console.log(`Dokumentace pro ${userKey} uspesne odeslana a dokoncena!`);

  } catch (err) {
    console.error('Chyba pri zpracovani dokumentace z webhooku:', err);
    await message.channel.send({
      content: `Nastala chyba pri zpracovani dokumentace z VM: \`${err.message}\``
    });
  }
});

// Spusteni bota
if (!TOKEN || TOKEN === 'sem_vloz_token_bota') {
  console.error('CHYBA: Nemas vyplneny DISCORD_TOKEN v souboru .env!');
  console.log('Zkopiruj .env.example jako .env a dopln sve udaje.');
  process.exit(1);
}

client.login(TOKEN);
