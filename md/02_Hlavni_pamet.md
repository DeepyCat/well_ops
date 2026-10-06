---
aliases: [Main Memory, Hlavní paměť, Souvislé přidělování paměti]
---

# Hlavní paměť

![Ochrana paměti — Base a Limit registry, překlad logické adresy](img/main-memory.svg)

## Základní hardware

[[RAM|Hlavní paměť]] a [[registr|registry]] jsou jediné úložiště, ke kterému má [[CPU]] přímý přístup – instrukce mohou pracovat jen s adresami v paměti, ne s adresami na disku. Data, která CPU potřebuje, tam musí být nejdřív přenesena.

- Přístup k registrům: **v rámci jednoho cyklu** hodin CPU
- Přístup k hlavní paměti: **víc cyklů**, procesor musí čekat (stall)
- Řešením je **[[cache]]** mezi CPU a hlavní pamětí

## Logický a fyzický adresní prostor

- **Logická adresa** (taky virtuální adresa) – generuje ji CPU
- **Fyzická adresa** – vidí ji paměťová jednotka
- **Logický adresní prostor** – množina všech logických adres, které program vygeneruje
- **Fyzický adresní prostor** – odpovídající množina fyzických adres

Běhový překlad z virtuálních na fyzické adresy dělá hardwarová jednotka **[[MMU]]** (Memory Management Unit).

## Ochrana paměti

Musí ji zajišťovat **hardware** (OS obvykle nezasahuje do každého přístupu do paměti kvůli výkonu). Základní implementace: dva registry –

- **base register** – nejmenší legální fyzická adresa
- **limit register** – velikost povoleného rozsahu

Každá adresa generovaná v uživatelském režimu se porovná s těmito registry hardwarem CPU. Pokus o přístup mimo povolený rozsah → **trap** (past/výjimka) do OS, který to vyhodnotí jako fatální chybu. Base a limit registry smí nastavit jen OS (privilegovaná instrukce, jen v režimu jádra).

## Dynamické nahrávání (Dynamic Loading)

Místo nahrání celého programu do paměti najednou se rutina nahraje **až když je poprvé volána**. Hlavní program se spustí, a když potřebuje zavolat jinou rutinu, zkontroluje, jestli je už v paměti – pokud ne, nahraje ji linker. Výhoda: šetří paměť, hlavně u zřídka používaného kódu (např. chybové rutiny).

## Dynamické linkování a sdílené knihovny

Systémové knihovny se s programem propojí **až při spuštění**, ne při kompilaci. Do programu se vloží jen malý **stub** (zástupný kód) pro každou knihovní rutinu – ten při prvním volání zjistí, jestli je knihovna v paměti, případně ji nahraje, a nahradí se přímo adresou rutiny.

**Výhody:** šetří disk i paměť (nemusí mít kopii knihovny v každém programu), aktualizace knihovny (např. oprava chyby) se projeví u všech programů bez nutnosti přelinkování. Verze knihovny se kontroluje, aby program omylem neběžel s nekompatibilní novou verzí.

## Swapping

Přesun **celých procesů** mezi hlavní pamětí a záložním úložištěm (backing store, obvykle rychlý disk) – viz [[swapping]].

Příklad výpočtu doby swapu: proces 100 MB, disk s přenosovou rychlostí 50 MB/s → přenos trvá 100/50 = 2 s, swap ven i dovnitř dohromady ≈ 4000 ms.

Moderní systémy (UNIX, Linux, Windows) swapping běžně **vypínají** a zapínají jen, když volná paměť klesne pod práh – nebo swapují jen **části** procesu (stránky), ne celý proces najednou.

## Souvislé přidělování paměti (Contiguous Memory Allocation)

Paměť se dělí na část pro **rezidentní OS** a část pro **uživatelské procesy**. Každý proces zabírá jeden souvislý blok paměti.

### Ochrana relokačním a limitním registrem

- **Relokační registr** – nejmenší fyzická adresa procesu
- **Limitní registr** – rozsah logických adres

MMU sečte logickou adresu s relokačním registrem → fyzická adresa. Při přepnutí procesu dispatcher nastaví oba registry na správné hodnoty.

### Přidělování paměti

- **Pevné oblasti (fixed partitions)** – historicky IBM OS/360 (MFT); počet procesů omezen počtem oblastí
- **Proměnné oblasti (variable partitions)** – OS drží tabulku volných/obsazených částí paměti (**díry**, holes). Proces se nahraje do dostatečně velké díry, zbytek se vrátí do seznamu volných děr; sousedící volné díry se při uvolnění slučují.

### Strategie výběru díry

| Strategie | Princip |
| :-- | :-- |
| **First fit** | první dostatečně velká díra – nejrychlejší |
| **Best fit** | nejmenší dostatečně velká díra – nejmenší zbytek, ale nutné projít celý seznam |
| **Worst fit** | největší díra – zanechá největší zbytek (může být užitečnější než malý) |

Simulace ukazují, že first fit a best fit jsou rychlejší a efektivnější než worst fit.

## Fragmentace

- **Externí fragmentace** – celkem je dost volné paměti, ale je **roztříštěná** na malé nesouvislé díry, žádná není dost velká pro nový požadavek. Platí tzv. **pravidlo 50 %** – při N alokovaných blocích se dalších ~0,5 N ztratí fragmentací (až třetina paměti nevyužitelná)
- **Interní fragmentace** – přidělený blok je o trochu větší, než proces potřebuje (např. kvůli přidělování ve fixních jednotkách) – rozdíl je nevyužitá paměť uvnitř bloku

### Řešení externí fragmentace

- **Kompakce** – přeuspořádání obsahu paměti tak, aby všechna volná paměť byla v jednom velkém bloku. Funguje jen při **dynamické relokaci** (za běhu), ne při statické (v době překladu/nahrání). Může být drahá operace.
- **Nesouvislý adresní prostor procesu** – umožní procesu využívat paměť, kdekoli je volná: řeší to **[[segmentace]]** a **[[stránkování]]** (dají se i kombinovat)

**Souvisí:** [[MMU]], [[swapping]], [[virtuální paměť]], [[segmentace]], [[stránkování]], [[registr]], [[proces]]
