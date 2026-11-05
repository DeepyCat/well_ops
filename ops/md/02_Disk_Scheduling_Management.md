---
aliases: [Disk Scheduling, Disk Management, Plánování disku, Správa disku]
---

# Plánování a správa disku

## Plánování disku (Disk Scheduling)

Cíl: co nejrychlejší přístup a co největší **disk bandwidth** (celkový počet přenesených bajtů / celkový čas mezi prvním požadavkem a dokončením posledního přenosu). Zlepšuje se řízením **pořadí**, ve kterém se vyřizují V/V požadavky na disk.

Proces žádá o V/V systémovým voláním, které určuje: čtení/zápis, adresu na disku, adresu v paměti, počet sektorů. Pokud je disk zaneprázdněný, požadavek čeká ve **frontě požadavků**.

### Algoritmy plánování disku

![Algoritmy plánování pohybu diskové hlavy](img/disk-scheduling.svg)


Příklad fronty požadavků na cylindry: **98, 183, 37, 122, 14, 124, 65, 67**, hlava startuje na cylindru **53**.

| Algoritmus | Princip | Výsledek na příkladu |
| :-- | :-- | :-- |
| **FCFS** (First-Come First-Served) | vyřizuje v pořadí příchodu | 640 cylindrů pohybu (zbytečné "skoky") |
| **SSTF** (Shortest Seek Time First) | vždy nejbližší požadavek k aktuální pozici hlavy | 236 cylindrů; hrozí [[starvation]] vzdálených požadavků |
| **SCAN** ("výtahový" algoritmus) | hlava jede k jednomu konci disku a obsluhuje vše po cestě, pak se otočí | rovnoměrnější, ale požadavek těsně za hlavou čeká nejdéle |
| **C-SCAN** | jako SCAN, ale po dojezdu na konec skočí zpátky na začátek bez obsluhy cestou zpět | rovnoměrnější čekací doby než SCAN |
| **LOOK / C-LOOK** | jako SCAN/C-SCAN, ale hlava se otočí hned po posledním požadavku, nejede až na kraj disku | efektivnější, běžně používaná varianta |

SSTF je v podstatě obdoba [[06_CPU_Scheduling|SJF]] plánování CPU – i tady hrozí stárnutí vzdálených požadavků.

### Plánování a SSD

[[SSD]] nemá pohyblivou hlavu, takže tyto algoritmy z velké části **neplatí**. Používá se prosté FCFS (např. Linux Noop scheduler), případně jen se slučováním sousedních požadavků na zápis (čtení má u SSD rovnoměrnou dobu, zápis ne).

![Správa a formátování disku](img/disk-formatting-structure.svg)

## Správa disku (Disk Management)

### Formátování disku

1. **Nízkoúrovňové (fyzické) formátování** – vyplní disk speciální strukturou pro každý sektor (hlavička + datová oblast + patička s **ECC**, error-correcting code). Většina disků je takhle zformátována už z výroby.
2. **Rozdělení na oddíly (partitioning)** – disk se rozdělí na skupiny cylindrů, OS s každým oddílem pracuje jako se samostatným diskem
3. **Logické formátování** – vytvoření souborového systému, uloží se počáteční struktury (mapy volného/obsazeného místa, prázdný kořenový adresář)

Souborové systémy obvykle seskupují bloky do větších **clusterů** – V/V se pak dělá po clusterech, ne po jednotlivých blocích.

**Raw disk** – oddíl použitý jako velké sekvenční pole bloků bez souborového systému (např. některé databáze pro plnou kontrolu nad umístěním dat).

### Boot Block

Aby počítač mohl nastartovat, potřebuje **[[bootstrap]] program**. Uložen typicky v [[ROM]] (nemění se, nejde nakazit virem) – tenhle malý zavaděč pak přinese **plný bootstrap program** z pevně daného místa na disku (**boot blocks**). Disk s boot oddílem = **boot disk / system disk**.

**Windows:** boot kód je v **MBR** (master boot record), prvním sektoru disku. MBR navíc obsahuje tabulku oddílů a příznak, který oddíl je aktivní (boot partition).

### Bad Blocks

Disky mají pohyblivé části a malé tolerance – jsou náchylné k poruchám. Vadné sektory se řeší:

- **Sector sparing (forwarding)** – řadič udržuje seznam vadných bloků, vadný sektor logicky nahradí náhradním (spare) sektorem
- **Sector slipping** – posune všechny sektory od vadného místa o jednu pozici, aby uvolnil místo

Data ve vadném bloku se obvykle ztratí – potřeba obnova ze zálohy.

### Swap Space Management

Virtuální paměť používá diskový prostor jako rozšíření [[RAM]]. Cíl: co nejlepší propustnost. Swap prostor může být:

- **Součást souborového systému** (velký soubor) – jednodušší, ale pomalejší (nutnost procházet strukturami souborového systému)
- **Samostatný raw oddíl** – rychlejší (optimalizováno na rychlost, ne úspornost), ale velikost je pevně daná při rozdělení disku

Linux umožňuje obojí zároveň a i víc swapovacích prostorů na různých discích (rozložení zátěže).

**Souvisí:** [[HDD]], [[SSD]], [[virtuální paměť]], [[swapping]], [[bootstrap]], [[starvation]], [[06_CPU_Scheduling]]
