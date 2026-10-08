---
aliases: [Souborové systémy, File systems]
---

# Souborové systémy

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

![[b95360194a3435937e9949af333ca4d072a7871eb8baa4f861619275e073dd3e.png]]

### macOS

- **HFS** (Hierarchical File System) – starší, dnes nepoužívaný
- **HFS+** – nástupce HFS, podporoval žurnálování; dnes ho nahrazuje APFS (u novějších verzí macOS)

![[d36fce0faff0f89a560cce558444aff2d7b4c77c7fdeb6ee38b592a4c1f04584.png]]

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

![[c0e017eee3e1c1a990630a24ca4e2e8b8fda7ef3a87264cd69b5a1a6d7fa1a5e.png]]

### Optické disky (CDFS)

- **ISO 9660** – standard pro CD-ROM
- **Joliet** – rozšíření ISO 9660 pro dlouhé názvy souborů (Microsoft)
- **UDF** (Universal Disk Format) – pro DVD a novější optická média

![[337a920ff064c3ce21ca64106984ac01dfa65fba2d4dca30406d7148d771d76d.png]]

### Síťové souborové systémy

- **SMB** (Server Message Block) – síťové sdílení souborů, hlavně Windows
- **NFS** (Network File System) – síťové sdílení, typicky mezi UNIXovými/Linuxovými systémy
- **CODA** – experimentální distribuovaný souborový systém s podporou odpojeného (offline) režimu

![[ef0766db27814b040fbe7fabbf33cac6833f1a43b6c3ad7acb875677580e266a.png]]

## Funkcionalita souborových systémů

- **Řízení přístupu / oprávnění** – kdo smí soubor číst, zapisovat, spouštět (např. `rwx` v UNIXu, ACL ve Windows)
- **Kvóty** – omezení, kolik místa (nebo kolik souborů) smí uživatel/skupina na disku zabrat
- **Komprimace** – automatické zmenšení dat na disku, transparentní pro aplikace
- **(De)fragmentace** – **fragmentace** = soubor je rozdělený na kusy roztroušené po disku (vzniká postupným mazáním/zápisem); **defragmentace** = přeuspořádání dat do souvislých bloků kvůli rychlejšímu čtení (hlavně u [[HDD]], u [[SSD]] nemá smysl a zbytečně ho opotřebovává)
- **Šifrování** – ochrana obsahu souborů před neoprávněným přečtením (např. NTFS EFS)
- **[[žurnálování|Žurnálování]]** – FS si vede log (žurnál) plánovaných změn, než je provede – po pádu systému lze podle žurnálu rychle obnovit konzistentní stav bez plné kontroly celého disku

## HDD vs. SSD – fyzická struktura

![[3aa7cb54330b0c8d9e64014941af20843305a7a05dc15442fca0ecf63400550d.jpg]]

**[[HDD]]** – mechanický disk:

![[9535c1a490f23eccb537d0e18743ee735bd01336712b59a8936ae147c9594549.jpg]]

![[0fb02ffc4290878ed6c817044358e85660c06aa4f73abb8e68112197a564d208.jpg]]

- **Povrch plotny** – magnetická vrstva, kam se zapisují data

  ![[65570bdf9f1a1029c34d132a15c7f12107d97f497edaf5a8dd084041403fe824.jpg]]
- **Plotny a cylindry** – disk má víc plotens, cylindr = sada stop se stejným poloměrem na všech plotnách

  ![[dd13bd36366687e887f9a2663d7962df4349baf7cd0991b8f899c2fcd7750de4.png]]
- **Boot sector** – první sektor disku, obsahuje zaváděcí kód a tabulku oddílů

  ![[7ec10d6df2b1dc92e68a8c9cb74e65006ea207177380ef61529e141b0ad13110.jpg]]

**[[SSD]]** – elektronické úložiště, žádné pohyblivé části, rychlejší přístup, necitlivé na fragmentaci.

![[d1ac2fa6e235fc8af9f672a08286b84612bff2177330848ba9797543c73738e4.jpg]]

**Srovnání HDD a SSD**

![[c7c5c36f0e0ef8cd65b0a3169c24e534707e561078bbd97a0adb00bb8abc5ea3.png]]

## RAID (Redundant Array of Independent Disks)

Spojení víc fyzických disků do jednoho logického celku – kvůli výkonu, redundanci (odolnosti proti výpadku), nebo obojímu.

![[6e4e9851ff2c2cafca3dd6dce1f247b4df79b555c4a7989ff6fe963d45c683b8.jpeg]]

| Úroveň | Princip | Odolnost proti výpadku | Využitelná kapacita |
| :-- | :-- | :-- | :-- |
| **RAID 0** | rozložení dat (striping) přes všechny disky | žádná – výpadek 1 disku = ztráta všeho | 100 % (n disků) |
| **RAID 1** | zrcadlení (mirroring) – stejná data na všech discích | ano, přežije výpadek n−1 disků | 50 % (u 2 disků) |
| **RAID 5** | striping + distribuovaná parita na všech discích | přežije výpadek 1 disku | (n−1)/n |
| **RAID 6** | jako RAID 5, ale dvojitá parita | přežije výpadek 2 disků | (n−2)/n |
| **RAID 01 (0+1)** | zrcadlení dvou RAID 0 polí | omezená | 50 % |
| **RAID 10 (1+0)** | striping přes víc RAID 1 párů | vyšší než RAID 01 | 50 % |

## Struktura adresářů

### UNIX/Linux File System Hierarchy

![[7304b7de114db2484fbe6ae27b7124538f855274189307e1f21206125ac3b15e.png]]

- https://cs.wikibooks.org/wiki/Linux:Adres%C3%A1%C5%99ov%C3%A1_struktura
- https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.pdf

### Windows Directory Structure

![[4b7460eea0bdbc82a8d360cc69ce405dc75eb8a1639232e1853397e5853e2e07.png]]

- https://en.wikipedia.org/wiki/Directory_structure#Windows_10

**Souvisí:** [[HDD]], [[SSD]], [[žurnálování]], [[systémové volání]]
