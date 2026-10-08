# Device Drivers (ovladače zařízení)

![[0d90076323b2ab534af3580f9d870eb1a26285b57660037b2dfd943a75052b87.jpg]]

Aby hardware fungoval, potřebuje operační systém **ovladač** dodaný výrobcem. Windows i Linux to potřebují, ale řeší to jinak.

## Windows

Při instalaci Windows je potřeba nainstalovat ovladače od výrobce hardwaru – čipsetu základní desky, grafické karty, Wi-Fi karty atd.

Microsoft řadu těchto ovladačů (dodaných výrobci, ne napsaných samotným Microsoftem) sdružuje přímo do Windows a hostuje je na **Windows Update**. Když se zobrazí bublina "Installing Driver" po připojení nového zařízení, Windows typicky stahuje ověřený ovladač od výrobce.

Pokud hardware ve Windows nefunguje, obvykle stačí stáhnout správný ovladač – výjimkou jsou jen velmi staré komponenty podporované jen staršími verzemi Windows.

![[e56705df9851242e0b246419ade5d1363f23962fb3d124697ec12a82c82698e3.png]]

![[85654002d2055a03a76deff243fdeca65aaf070cd4622f05053a9ee94feb8d2c.png]]

**Ovladače ve Windows**

![[596794a4f444e94dbfbcaa495dab108cb462ad102f6c54e24493545e516dff76.png]]

## Linux

Na Linuxu je to jinak – většina ovladačů je **open-source a integrovaná přímo do systému**:

- Většina ovladačů je součástí **linuxového jádra**
- Ovladače grafiky jsou částečně součástí **Xorg** (grafický systém)
- Ovladače tiskáren jsou součástí **CUPS** (tiskový systém)

Díky tomu jsou ovladače pro většinu hardwaru přítomné hned "z výroby" – systém hardware automaticky detekuje a použije vhodný ovladač. Ovladače vyvíjejí jak nadšenci, tak přímo výrobci hardwaru, kteří svůj kód přispívají do jádra.

![[4c7ca71cc28c93559984318d896cdba03e0da5440c7b280466702fdbb8c062ce.png]]

**Ubuntu System Log**

![[7ae1b2d3ea0c1f74cf5701c33de74d38bfc3182885e673cacff586a4dcb64a2c.png]]

### Proprietární ovladače

Někteří výrobci nabízí i vlastní **uzavřené (proprietární)** ovladače, které distribuce automaticky nezahrnují. Nejčastěji jde o:

- Grafické ovladače **NVIDIA** a **AMD** (víc výkonu pro hry než open-source alternativy)
- Některé **Wi-Fi ovladače**

Instalace se liší distribuci od distribuce – Ubuntu má nástroj **"Additional Drivers"**, Linux Mint **"Driver Manager"**. Fedora je vůči proprietárním ovladačům zdrženlivá a jejich instalaci neusnadňuje.

**Additional Drivers**

![[9d6bf5d9b1c819b4dcf8e46fe2ba1a1df73bb57ae722dfcde3eaa556226e6048.png]]

### Ovladače tiskáren

Konfigurace přes **CUPS** (Common Unix Printing System) – vybere se výrobce a model tiskárny z databáze. Lze také dodat soubor **PPD** (PostScript Printer Description), často součást Windows ovladače PostScript tiskáren. Tiskárny bývají na Linuxu problematické – vyplatí se předem ověřit kompatibilitu.

**Printer Drivers**

![[463858b78bd5bc37dd052b64d8093085fa63ac8d36cccedca3ed35027c124c75.png]]

![[3724e6e1c520abe60f1adeebc6cabc79e5097360bd4d12e29469ffb3576ee735.png]]

### Když hardware nefunguje

Pokud něco nefunguje ani po instalaci dostupných proprietárních ovladačů, pravděpodobně to nepůjde zprovoznit vůbec (nebo jen s velkým úsilím a terminálovými příkazy). Aktualizace na novější distribuci často pomůže díky novější podpoře hardwaru.

**Filozofie Linuxu:** ovladače jsou open-source a integrované do jádra, uživatel by s nimi neměl muset moc manipulovat – hardware "prostě funguje" hned po instalaci, případně po jednoduché instalaci proprietárních doplňků.

**Souvisí:** [[kernel]], [[operační systém]], [[firmware]]
