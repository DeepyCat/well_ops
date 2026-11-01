# 🤖 OPS Portál – Discord Oznamovací Bot

Tento bot slouží pro třídní Discord server k automatickému publikování oznámení o **nových modulech** a **aktualizacích** webového OPS portálu.

---

## ✨ Klíčové vlastnosti & Anonymita
- **100% Anonymní spuštění:** Když zadáte lomítkový příkaz `/novy-modul` nebo `/update`, bot vám odpoví tzv. **ephemerální zprávou** (kterou vidíte na své obrazovce pouze vy – nikdo jiný na serveru ji nevidí). Následně bot pošle do oznamovacího kanálu **čistou zprávu ze svého účtu**. Nikde na Discordu se nezobrazí text typu *"Uživatel X použil /novy-modul"*! Příkaz můžete napsat klidně i do skrytého kanálu pro adminy.
- **Zabezpečení:** Oznámení mohou vyvolat pouze vybraní lidé specifikovaní v `ALLOWED_USER_IDS` nebo správci serveru (Administrator).
- **Krásné Embedy:** Každý nový modul obsahuje přímé odkazy na cvičení (`praxe.html?modul=XX`), zadání a řešení.
- **Možnost Pingu:** Při odeslání si můžete vybrat, zda bot označí `@everyone`, `@here` nebo odešle tiché oznámení bez pingu.

---

## 📋 Dostupné příkazy

### 1. `/novy-modul`
- **`cislo`** *(povinné)*: Číslo modulu (např. `03` nebo `3`).
- **`nazev`** *(povinné)*: Název nového modulu (např. `Konfigurace DNS a doménových služeb`).
- **`popis`** *(volitelné)*: Stručné shrnutí, co se v modulu dělá.
- **`ping`** *(volitelné)*: Výběr mezi `@everyone`, `@here` a *Bez označení*.

### 2. `/update`
- **`zprava`** *(povinné)*: Text oznámení (co jste přidali, upravili, opravili na webu).
- **`nadpis`** *(volitelné)*: Vlastní nadpis (výchozí: `🛠️ Aktualizace OPS Portálu`).
- **`ping`** *(volitelné)*: Výběr mezi `@everyone`, `@here` a *Bez označení*.

---

## 🚀 Návod na zprovoznění bota (krok za krokem)

### Krok 1: Vytvoření aplikace na Discord Developer Portálu
1. Otevřete [Discord Developer Portal](https://discord.com/developers/applications) a přihlaste se.
2. Vpravo nahoře klikněte na **New Application**, zadejte název (např. `OPS Portál`) a potvrďte.
3. V sekci **General Information** uvidíte **Application ID** (zkopírujte si ho, je to `CLIENT_ID`).
4. V levém menu klikněte na **Bot**:
   - Můžete mu nastavit avatar (např. logo OPS nebo školy).
   - Klikněte na **Reset Token** a zkopírujte vygenerovaný token (to je `DISCORD_TOKEN`).
   *(Nikomu tento token neposílejte!)*

### Krok 2: Pozvánka bota na váš server
1. V levém menu přejděte na **OAuth2** -> **URL Generator**.
2. V sekci **Scopes** zaškrtněte:
   - `bot`
   - `applications.commands`
3. Níže v sekci **Bot Permissions** zaškrtněte:
   - `Send Messages`
   - `Embed Links`
   - `Mention Everyone` (pokud chcete využívat pingy)
   - `Use Slash Commands`
4. Dole zkopírujte **Generated URL**, otevřete ji v prohlížeči a bota přidejte na váš třídní server.

### Krok 3: Získání IDček z Discordu
V Discordu si v nastavení zapněte **Vývojářský režim**:
*Nastavení uživatele (ozubené kolo) -> Vzhled (nebo Pokročilé) -> zapnout **Vývojářský režim (Developer Mode)**.*

Pak můžete kliknout pravým tlačítkem myši:
- **ID serveru:** Pravý klik na název vašeho serveru vlevo nahoře -> **Kopírovat ID serveru** (`GUILD_ID`).
- **ID kanálu pro oznámení:** Pravý klik na textový kanál (např. `#oznámení`) -> **Kopírovat ID kanálu** (`ANNOUNCEMENT_CHANNEL_ID`).
- **ID vašich účtů:** Pravý klik na váš profil v seznamu členů -> **Kopírovat ID uživatele** (`ALLOWED_USER_IDS`).

### Krok 4: Konfigurace v `.env`
Ve složce `discord-bot` vytvořte soubor `.env` (můžete zkopírovat `.env.example`):
```env
DISCORD_TOKEN=vas_tajny_token_bota
CLIENT_ID=id_aplikace_bota
GUILD_ID=id_vaseho_discord_serveru
ANNOUNCEMENT_CHANNEL_ID=id_kanalu_kam_ma_bot_psat
ALLOWED_USER_IDS=vase_user_id_1,id_kamarada_2
PORTAL_URL=https://deepycat.github.io/well_ops
```

### Krok 5: Instalace a spuštění
Otevřete terminál ve složce `discord-bot`:
```bash
npm install
npm start
```

Konzole vypíše:
```
🤖 Bot je přihlášen jako: OPS Portál#1234
🔄 Registruji slash příkazy (/novy-modul, /update)...
✅ Slash příkazy byly okamžitě zaregistrovány pro server ID: ...
```

Nyní můžete na Discordu v jakémkoliv kanálu napsat `/novy-modul` nebo `/update`!
