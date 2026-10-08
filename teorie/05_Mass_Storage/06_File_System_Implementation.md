---
aliases: [File-System Implementation, Implementace souborového systému, MBR, GPT]
---

# Implementace souborového systému

## Struktura souborového systému (vrstvy)

1. **I/O control** – ovladače zařízení a obsluha přerušení, překládá "přines blok 123" na hardwarové instrukce řadiče
2. **Basic file system** – vydává obecné příkazy ovladači, spravuje buffery a [[cache]]
3. **Logická vrstva souborového systému** – spravuje **metadata** (vše kromě samotného obsahu souborů), adresářovou strukturu, přes **[[FCB]]** (File Control Block)

Vrstvení minimalizuje duplicitu kódu, ale přidává režii.

### Běžné souborové systémy

**UFS** (UNIX, na bázi Berkeley FFS), **FAT/FAT32/NTFS** (Windows), **ext3/ext4** (Linux, nejběžnější z 40+ podporovaných), **ISO 9660** (CD-ROM), **FUSE** (souborový systém v uživatelském, ne jaderném režimu), Google File System.

## FCB (File Control Block)

Struktura obsahující metadata o jednom souboru – vlastnictví, oprávnění, umístění obsahu. V UNIXu se jmenuje **inode**.

## On-disk a in-memory struktury

### Na disku

- **Boot control block** (na svazek) – info pro zavedení OS z tohoto svazku (v UFS "boot block", v NTFS "partition boot sector")
- **Volume control block** (na svazek) – počet bloků, velikost bloku, počet/ukazatele volných bloků (v UFS "superblock", v NTFS master file table)
- **Adresářová struktura** (na souborový systém) – jména souborů + odpovídající inode čísla
- **FCB na soubor** – detaily o souboru

### V paměti

- **Mount table** – info o připojených svazcích
- **Cache adresářové struktury** – nedávno použité adresáře
- **Systémová open-file table** – kopie FCB otevřených souborů
- **Per-process open-file table** – ukazatel do systémové tabulky + info specifické pro proces
- **Buffery** – dočasně drží bloky při čtení/zápisu

### Jak to funguje – vytvoření a otevření souboru

1. `create()` – alokuje se nový FCB, aktualizuje se adresář na disku
2. `open()` – nejdřív se zkontroluje systémová open-file table (soubor už může být otevřený jiným procesem); pokud ne, prohledá se (často cachovaná) adresářová struktura, FCB se zkopíruje do systémové tabulky, přidá se záznam do per-process tabulky s ukazatelem na ni
3. Návratová hodnota `open()` (file descriptor / file handle) se používá pro všechny další V/V operace – šetří opakované hledání v adresáři

## Oddíly a mountování

### Raw vs. "cooked"

- **Raw oddíl** – bez souborového systému (swap prostor, některé databáze, RAID metadata)
- **"Cooked" oddíl** – obsahuje souborový systém

### Boot a Root partition

**Boot partition** obsahuje zavaděč (bootstrap) v pevném formátu (souborový systém ještě není načtený, nejde ho interpretovat). **Root partition** obsahuje jádro OS, mountuje se při startu.

### MBR (Master Boot Record)

Uložen na úplném začátku disku (LBA sektor 0). Skládá se ze dvou částí:

- **Hlavní tabulka rozdělení disku (MPT)** – seznam max. **4 primárních oddílů** + umístění jejich boot sektorů. Jeden z oddílů může být označen jako **extended partition**, uvnitř které lze vytvořit libovolný počet logických oddílů.
- **Hlavní spouštěcí kód (zavaděč)** – krátký kód, který BIOS nahraje do paměti a spustí; ten najde a spustí boot sektor aktivního oddílu

**Limit MBR:** kvůli 32bitové adresaci sektorů nepodporuje disky větší než **2 TiB**.

### GPT (GUID Partition Table)

Novější standard (součást **UEFI**), nahrazuje MBR – podporuje disky nad 2 TiB, prakticky neomezený počet oddílů (na rozdíl od 4 u MBR). Konverze MBR→GPT je snadná, pokud byl při formátování první oddíl zarovnaný (od Windows Vista běžné zarovnání na 1 MiB).

## Virtual File System (VFS)

Vrstva umožňující OS podporovat víc typů souborových systémů zároveň (lokální i síťové) přes jednotné rozhraní, objektově orientovaně.

- **1. vrstva** – rozhraní systémových volání (`open, read, write, close`)
- **2. vrstva – VFS** – odděluje obecné operace od konkrétní implementace; používá **vnode** (na rozdíl od inode jedinečný v rámci **celé sítě**, ne jen jednoho souborového systému) – umožňuje transparentní přístup k lokálním i síťovým (**[[NFS]]**) souborům
- **3. vrstva** – konkrétní implementace daného typu souborového systému nebo síťového protokolu

Linux VFS definuje 4 typy objektů: **inode** (soubor), **file** (otevřený soubor), **superblock** (celý souborový systém), **dentry** (položka adresáře) – každý má tabulku funkcí, takže VFS volá operace, aniž by věděl, o jaký konkrétní typ souboru jde.

## Implementace adresáře

- **Lineární seznam** – jednoduchý, ale **lineární vyhledávání** je pomalé; setříděný seznam umožní binární hledání, ale komplikuje vkládání/mazání
- **Hašovací tabulka** – rychlé vyhledávání přes hašovací funkci jména souboru; komplikace: pevná velikost tabulky (nutnost reorganizace při zaplnění), řešení kolizí (řetězení)

## Metody alokace místa na disku

### Souvislá alokace (Contiguous)

Soubor zabírá **souvislý blok** disku (adresa začátku + délka). Výhody: minimální počet seeků, podporuje sekvenční i přímý přístup (blok i = b+i). Nevýhody: **externí fragmentace** (first/best/worst fit stejně jako u [[02_Hlavni_pamet|paměti]]), nutnost předem znát velikost souboru, kompakce je drahá (hodiny u velkých disků).

### Spojová alokace (Linked)

Soubor = [[spojový seznam]] bloků, roztroušených kdekoli na disku – adresář drží ukazatel na první a poslední blok. Žádná externí fragmentace, velikost netřeba předem znát. Nevýhody: **jen efektivní pro sekvenční přístup** (k i-tému bloku nutno projít i−1 předchozích), riziko poškozeného ukazatele (ztráta zbytku souboru), režie místa na ukazatele (řeší se seskupením bloků do **clusterů**).

**FAT (File Allocation Table)** – varianta spojové alokace použitá v MS-DOS: tabulka na začátku svazku, indexovaná číslem bloku, každý záznam ukazuje na další blok souboru (0 = volný blok, speciální hodnota = konec souboru). Umožňuje efektivnější přímý přístup než klasická spojová alokace (čte se přímo z tabulky), pokud je FAT cachovaná v paměti.

### Indexovaná alokace (Indexed)

Každý soubor má **index blok** (pole adres bloků) – i-tý záznam = i-tý blok souboru. Podporuje přímý přístup bez externí fragmentace, ale plýtvá místem u malých souborů (celý index blok i pro soubor o 1-2 blocích).

**Řešení pro velké soubory:**
- **Spojovaný (linked) index** – index bloky se řetězí (poslední záznam = ukazatel na další index blok)
- **Víceúrovňový index** – 1. úrovňový index ukazuje na 2. úrovňové indexy, ty na data
- **Kombinované schéma (UNIX [[i-node|inode]])** – prvních ~12 ukazatelů přímo na data (**direct blocks**), pak ukazatele na **single/double/triple indirect block** pro velké soubory

### Srovnání výkonu

| | Souvislá | Spojová | Indexovaná |
| :-- | :-- | :-- | :-- |
| Sekvenční přístup | rychlý | rychlý | závisí na cachování indexu |
| Přímý přístup | rychlý (1 čtení) | pomalý (i čtení) | rychlý, pokud je index v paměti |
| Externí fragmentace | ano | ne | ne |

Některé systémy kombinují – malé soubory souvisle, velké přepnou na indexovanou alokaci.

## Správa volného místa (Free-Space Management)

- **Bitová mapa (bit vector)** – 1 bit na blok (1 = volný, 0 = obsazený); jednoduché a efektivní hledání prvního volného bloku (bitové instrukce procesoru)
- **Spojový seznam volných bloků** – ukazatel na první volný blok, každý volný blok ukazuje na další; pomalé procházení, ale používá se zřídka (stačí najít **jeden** volný blok, ne procházet celý seznam). FAT tuhle evidenci řeší přímo v alokační tabulce (0 = volný blok).

## Obnova po havárii (Recovery)

### Kontrola konzistence (Consistency Checking)

Nástroj (`fsck` na UNIXu) porovná adresářovou strukturu s daty na disku a opraví nesrovnalosti. Může trvat minuty až hodiny u velkých disků, může vyžadovat lidský zásah.

### Log-structured (žurnálovací) souborové systémy

Viz [[žurnálování]] – všechny změny metadat se nejdřív zapíšou sekvenčně do **logu (žurnálu)**, teprve pak se "přehrají" do skutečných struktur. Po havárii se dokončí nedokončené (ale committed) transakce, nedokončené (neuncommitted) se vrátí zpět. Výrazně rychlejší než syrová kontrola konzistence (sekvenční zápisy místo náhodných).

### Zálohování a obnova (Backup and Restore)

Typický cyklus:
- **Den 1** – **plná záloha (full backup)** všech souborů
- **Den 2, 3, …** – **přírůstková záloha (incremental backup)** jen souborů změněných od poslední zálohy

Obnova = plná záloha + postupné přehrání přírůstkových záloh. Kompromis mezi objemem záloh a rychlostí/jednoduchostí obnovy.

## NFS (Network File System)

Sdílení souborů mezi nezávislými pracovními stanicemi na bázi **klient-server** vztahu – stroj může být zároveň klient i server. Sdílení ovlivňuje jen zúčastněné stroje, ne celou síť.

**Souvisí:** [[FCB]], [[i-node]], [[žurnálování]], [[cache]], [[spojový seznam]], [[hašovací tabulka]], [[04_File_Concept_Access]], [[05_Directory_Structures]]
