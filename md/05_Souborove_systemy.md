---
aliases: [Souborové systémy, File systems]
---

# Souborové systémy

![Přehled souborových systémů a vrstva VFS](img/file-systems.svg)

## Proč souborové systémy existují

Řeší ukládání a přístup k souborům na úložišti (HDD, USB disk, SSD, CD/DVD/BD, diskové pole) – konkrétně:

- organizaci souborů a adresářů na disku
- pravidla ukládání a čtení (přístup k souborům)
- efektivní správu souborů
- zabezpečení a spolehlivost dat

## Souborové systémy podle platforem

### Windows

| FS | Charakteristika |
| :-- | :-- |
| **FAT16** | starší, max. velikost oddílu 2/4 GB, žádná oprávnění ani žurnálování |
| **FAT32** | rozšíření FAT16, max. velikost souboru 4 GB, pořád bez pokročilých bezpečnostních funkcí |
| **NTFS** | moderní FS Windows, podporuje oprávnění, [[žurnálování]], šifrování (EFS), komprimaci, kvóty |
| **WinFS** | experimentální databázový FS (nadstavba nad NTFS), vývoj zrušen |

### macOS

- **HFS** (Hierarchical File System) – starší, dnes nepoužívaný
- **HFS+** – nástupce HFS, podporoval žurnálování; dnes ho nahrazuje APFS (u novějších verzí macOS)

### Linux

| FS | Charakteristika |
| :-- | :-- |
| **ext2** | bez žurnálování, starší |
| **ext3** | ext2 + žurnálování |
| **ext4** | dnešní standard většiny distribucí, rychlejší, větší limity velikosti |
| **Btrfs** | moderní FS se snapshoty, kontrolními součty dat, vestavěným RAID |
| **ReiserFS / Reiser4** | efektivní pro velké množství malých souborů, dnes už se moc nepoužívá |
| **JFS** | žurnálovací FS od IBM |
| **XFS** | vysoký výkon u velkých souborů, používá se hlavně na serverech |

### Optické disky (CDFS)

- **ISO 9660** – standard pro CD-ROM
- **Joliet** – rozšíření ISO 9660 pro dlouhé názvy souborů (Microsoft)
- **UDF** (Universal Disk Format) – pro DVD a novější optická média

### Síťové souborové systémy

- **SMB** (Server Message Block) – síťové sdílení souborů, hlavně Windows
- **NFS** (Network File System) – síťové sdílení, typicky mezi UNIXovými/Linuxovými systémy
- **CODA** – experimentální distribuovaný souborový systém s podporou odpojeného (offline) režimu

![Metody alokace diskového prostoru](img/fs-allocation-methods.svg)

## Funkcionalita souborových systémů

- **Řízení přístupu / oprávnění** – kdo smí soubor číst, zapisovat, spouštět (např. `rwx` v UNIXu, ACL ve Windows)
- **Kvóty** – omezení, kolik místa (nebo kolik souborů) smí uživatel/skupina na disku zabrat
- **Komprimace** – automatické zmenšení dat na disku, transparentní pro aplikace
- **(De)fragmentace** – **fragmentace** = soubor je rozdělený na kusy roztroušené po disku (vzniká postupným mazáním/zápisem); **defragmentace** = přeuspořádání dat do souvislých bloků kvůli rychlejšímu čtení (hlavně u [[HDD]], u [[SSD]] nemá smysl a zbytečně ho opotřebovává)
- **Šifrování** – ochrana obsahu souborů před neoprávněným přečtením (např. NTFS EFS)
- **[[žurnálování|Žurnálování]]** – FS si vede log (žurnál) plánovaných změn, než je provede – po pádu systému lze podle žurnálu rychle obnovit konzistentní stav bez plné kontroly celého disku

## HDD vs. SSD – fyzická struktura

**[[HDD]]** – mechanický disk:
- **Povrch plotny** – magnetická vrstva, kam se zapisují data
- **Plotny a cylindry** – disk má víc plotens, cylindr = sada stop se stejným poloměrem na všech plotnách
- **Boot sector** – první sektor disku, obsahuje zaváděcí kód a tabulku oddílů

**[[SSD]]** – elektronické úložiště, žádné pohyblivé části, rychlejší přístup, necitlivé na fragmentaci.

## RAID (Redundant Array of Independent Disks)

Spojení víc fyzických disků do jednoho logického celku – kvůli výkonu, redundanci (odolnosti proti výpadku), nebo obojímu.

| Úroveň | Princip | Odolnost proti výpadku | Využitelná kapacita |
| :-- | :-- | :-- | :-- |
| **RAID 0** | rozložení dat (striping) přes všechny disky | žádná – výpadek 1 disku = ztráta všeho | 100 % (n disků) |
| **RAID 1** | zrcadlení (mirroring) – stejná data na všech discích | ano, přežije výpadek n−1 disků | 50 % (u 2 disků) |
| **RAID 5** | striping + distribuovaná parita na všech discích | přežije výpadek 1 disku | (n−1)/n |
| **RAID 6** | jako RAID 5, ale dvojitá parita | přežije výpadek 2 disků | (n−2)/n |
| **RAID 01 (0+1)** | zrcadlení dvou RAID 0 polí | omezená | 50 % |
| **RAID 10 (1+0)** | striping přes víc RAID 1 párů | vyšší než RAID 01 | 50 % |

**Souvisí:** [[HDD]], [[SSD]], [[žurnálování]], [[systémové volání]]
