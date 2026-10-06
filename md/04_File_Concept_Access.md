---
aliases: [File Concept, Koncept souboru, File Access Methods]
---

# Koncept souboru a přístupové metody

![Metody přístupu k souborům — sekvenční, přímý a indexový přístup](img/file-access-methods.svg)

## Co je to soubor

**Soubor** je pojmenovaná kolekce souvisejících informací zaznamenaná na sekundárním úložišti – nejmenší jednotka logického úložiště z pohledu uživatele. OS abstrahuje fyzické vlastnosti úložných zařízení do jednotné logické jednotky (soubor). Vnitřní strukturu a obsah definuje tvůrce souboru.

![Atributy a operace se soubory](img/file-attributes-operations.svg)

## Atributy souboru

| Atribut | Popis |
| :-- | :-- |
| **Jméno** | jediná informace v lidsky čitelné podobě |
| **Identifikátor** | jedinečné (obvykle číselné) označení uvnitř souborového systému |
| **Typ** | pro systémy podporující víc typů souborů |
| **Umístění** | ukazatel na zařízení a místo na něm |
| **Velikost** | aktuální (a max. povolená) velikost |
| **Ochrana** | řízení přístupu – kdo smí číst/zapisovat/spouštět |
| **Čas, datum, uživatel** | vytvoření, poslední úprava, poslední použití |

Info o všech souborech se drží ve **struktuře adresáře**, uložené na disku spolu se soubory.

## Operace se soubory

Šest základních: **create, write, read, reposition (seek), delete, truncate**.

- **Write** – potřebuje **write pointer**, který se po každém zápisu posune
- **Read** – potřebuje **read pointer**; obvykle se čtení i zápis sdílí přes jeden **current-file-position pointer** na proces
- **Reposition (seek)** – přesune ukazatel bez skutečného V/V
- **Truncate** – vynuluje délku souboru, zachová atributy

### Open-file table

Aby se nemuselo pořád prohledávat adresář, systém drží tabulku otevřených souborů. `open()` vrátí ukazatel do téhle tabulky (na UNIXu **file descriptor**, ve Windows **file handle**), který se pak používá pro všechny V/V operace.

Dvě úrovně tabulky:
- **per-process** – file pointer, přístupová práva pro daný proces
- **systémová (system-wide)** – umístění na disku, datum přístupu, velikost; **open count** – kolik procesů má soubor otevřený; při dosažení 0 se záznam odstraní

### File Locks (zámky souboru)

- **Shared lock** – jako "reader lock", víc procesů může držet zároveň
- **Exclusive lock** – jako "writer lock", jen jeden proces najednou
- **Mandatory** – OS vynucuje, i cizí proces bez explicitní žádosti o zámek je zablokován (Windows)
- **Advisory** – OS nevynucuje, aplikace si musí zámek sama vyžádat (UNIX)

## Typy souborů

Typ se běžně kóduje jako **přípona jména** (`.docx`, `.exe`, `.sh`). Systém podle přípony pozná, jaké operace jsou povolené (spustit lze jen `.exe`/`.com`/`.sh`).

- **macOS** – typ + atribut "creator" (jméno programu, který soubor vytvořil), nastavuje ho OS při `create()`
- **UNIX** – "magic number" na začátku souboru (hrubě určuje typ), přípony jsou jen "hintem" pro aplikace, OS je nevynucuje

## Struktura souboru

Některé systémy vynucují **strukturu souboru** (např. spustitelný soubor musí mít přesně danou strukturu, aby OS věděl, kam v paměti ho nahrát). UNIX/Windows drží strukturu na minimu – soubor je jen posloupnost bajtů, interpretaci si dělá každá aplikace sama (maximální flexibilita, malá podpora od OS).

### Vnitřní struktura – interní fragmentace

Disk se čte/zapisuje po **blocích** (fyzický záznam), logický záznam se do bloků "balí". Protože se alokuje po celých blocích, poslední blok souboru bývá jen částečně využitý – to je **interní fragmentace** (viz i [[04_Strankovani|stránkování]]). Čím větší blok, tím větší plýtvání.

## Metody přístupu k souboru

### Sekvenční přístup

Nejběžnější – informace se zpracovává postupně, záznam po záznamu (`read_next()`, `write_next()`). Model podle magnetické pásky, funguje i na sekvenčních zařízeních.

### Přímý přístup (Direct/Relative Access)

Soubor = číslovaná posloupnost pevně dlouhých bloků, čte/zapisuje se **v libovolném pořadí** (`read(n)`, `write(n)`). Model podle disku – hodí se pro databáze (spočítat, který blok obsahuje odpověď na dotaz, a přečíst ho přímo). Relativní číslo bloku umožňuje OS rozhodnout, kam soubor fyzicky umístit.

### Přístup přes index

Index (jako rejstřík na konci knihy) obsahuje ukazatele na jednotlivé bloky – nejdřív se prohledá index, pak se přímo přistoupí k datovému bloku. U velkých souborů může index vyžadovat víc úrovní (**IBM ISAM** – hlavní index → sekundární indexy → data; nalezení záznamu max. 2 přímé čtení + sekvenční prohledání bloku).

**Souvisí:** [[05_Directory_Structures]], [[06_File_System_Implementation]], [[žurnálování]]
