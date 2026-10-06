# Device Drivers (ovladače zařízení)

![Architektura ovladačů zařízení — Windows WDM vs Linux kernel moduly](img/device-drivers.svg)

Aby hardware fungoval, potřebuje operační systém **ovladač** dodaný výrobcem. Windows i Linux to potřebují, ale řeší to jinak.

## Windows

Při instalaci Windows je potřeba nainstalovat ovladače od výrobce hardwaru – čipsetu základní desky, grafické karty, Wi-Fi karty atd.

Microsoft řadu těchto ovladačů (dodaných výrobci, ne napsaných samotným Microsoftem) sdružuje přímo do Windows a hostuje je na **Windows Update**. Když se zobrazí bublina "Installing Driver" po připojení nového zařízení, Windows typicky stahuje ověřený ovladač od výrobce.

Pokud hardware ve Windows nefunguje, obvykle stačí stáhnout správný ovladač – výjimkou jsou jen velmi staré komponenty podporované jen staršími verzemi Windows.

## Linux

Na Linuxu je to jinak – většina ovladačů je **open-source a integrovaná přímo do systému**:

- Většina ovladačů je součástí **linuxového jádra**
- Ovladače grafiky jsou částečně součástí **Xorg** (grafický systém)
- Ovladače tiskáren jsou součástí **CUPS** (tiskový systém)

Díky tomu jsou ovladače pro většinu hardwaru přítomné hned "z výroby" – systém hardware automaticky detekuje a použije vhodný ovladač. Ovladače vyvíjejí jak nadšenci, tak přímo výrobci hardwaru, kteří svůj kód přispívají do jádra.

### Proprietární ovladače

Někteří výrobci nabízí i vlastní **uzavřené (proprietární)** ovladače, které distribuce automaticky nezahrnují. Nejčastěji jde o:

- Grafické ovladače **NVIDIA** a **AMD** (víc výkonu pro hry než open-source alternativy)
- Některé **Wi-Fi ovladače**

Instalace se liší distribuci od distribuce – Ubuntu má nástroj **"Additional Drivers"**, Linux Mint **"Driver Manager"**. Fedora je vůči proprietárním ovladačům zdrženlivá a jejich instalaci neusnadňuje.

### Ovladače tiskáren

Konfigurace přes **CUPS** (Common Unix Printing System) – vybere se výrobce a model tiskárny z databáze. Lze také dodat soubor **PPD** (PostScript Printer Description), často součást Windows ovladače PostScript tiskáren. Tiskárny bývají na Linuxu problematické – vyplatí se předem ověřit kompatibilitu.

### Když hardware nefunguje

Pokud něco nefunguje ani po instalaci dostupných proprietárních ovladačů, pravděpodobně to nepůjde zprovoznit vůbec (nebo jen s velkým úsilím a terminálovými příkazy). Aktualizace na novější distribuci často pomůže díky novější podpoře hardwaru.

**Filozofie Linuxu:** ovladače jsou open-source a integrované do jádra, uživatel by s nimi neměl muset moc manipulovat – hardware "prostě funguje" hned po instalaci, případně po jednoduché instalaci proprietárních doplňků.

**Souvisí:** [[kernel]], [[operační systém]], [[firmware]]
