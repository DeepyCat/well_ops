---
aliases: [Správa paměti úvod, Memory Management úvod]
---

# Správa paměti – úvod

## Proč?

![Paměťová hierarchie od registrů po cloud](img/memory-hierarchy.svg)


**Ideál programátora:** paměť je nekonečně velká, rychlá, levná a persistentní (trvalá).

**Realita:** paměť je hierarchie různých úrovní – [[registr|registry CPU]], malé množství rychlé [[cache]], grafická paměť, gigabajty [[RAM]], gigabajty až terabajty na [[HDD]]/[[SSD]], terabajty v cloudu. Čím rychlejší, tím menší a dražší.

### Proč paměť potřebuje správu

- **Procesy potřebují paměť** (kód, data, [[zásobník]], [[heap]])
- **OS potřebuje paměť** sám pro sebe
- **Paměť potřebuje ochranu:**
  - jádro OS před procesy
  - paměť procesu před ostatními procesy
  - sdílení paměti mezi vlákny (bezpečně)
  - sdílení paměti mezi procesy (aniž by se musela vypnout ochrana)

## Jak? – Memory Management Unit (MMU)

Hlavní úkoly správce paměti:

- **Přidělovat** operační paměť jednotlivým procesům
- **Udržovat informace** o paměti – která část je volná a která přidělená (a komu)
- **Zařazovat zpět** paměť, kterou procesy uvolní
- **Odebírat** paměť procesům, je-li to potřeba
- **Zajistit ochranu paměti** – žádný proces by neměl mít přístup k paměti jiného procesu nebo OS bez explicitního povolení vlastníka
- **Relokace paměti** – programátor předem neví, ze které fyzické adresy poběží jeho program; procesu může být při swapování přidělena jiná oblast paměti; odkazy na paměť v LAP se musí dynamicky překládat na skutečné adresy ve FAP

## LAP a FAP (logický a fyzický adresní prostor)

- **LAP** (logický adresní prostor) = **virtuální paměť** – adresy, se kterými pracuje proces
- **FAP** (fyzický adresní prostor) = skutečné adresy v [[RAM]]

Proces vidí jen LAP – překlad na FAP zajišťuje [[MMU]] transparentně, proces o tom neví.

## Strategie přidělování paměti

- přidělování veškeré volné paměti
- přidělování pevných bloků paměti
- přidělování bloků paměti proměnné velikosti
- **[[segmentace]]** paměti
- **[[stránkování]]** paměti

## Stránkování paměti (základní princip)

Proces si myslí, že má souvislý úsek paměti (**lineární paměť**) – stránkování mu umožní přidělit několik nesouvislých úseků a vytvořit iluzi souvislosti.

- Logická paměť je rozdělena na **stránky** (typicky 4 KB)
- Fyzická paměť je rozdělena na **rámce** (frames), stejně velké jako stránky – v RAM, nebo ve stránkovacím souboru na disku (`pagefile.sys` ve Windows, swap partition v Linuxu)
- Logická adresa = **číslo stránky + offset** (posunutí v rámci stránky; u 4KB stránky je offset 12 bitů, protože 2¹² = 4096 = 4 KB)
- **MMU** mapuje stránky logické paměti na rámce fyzické paměti – transparentně pro proces

Podrobný výklad stránkování je v samostatné poznámce [[04_Strankovani|Stránkování]].

## Nástroje pro Windows 10

- **FreeMem, Tweak 10, CacheMan** – utility pro sledování a "optimalizaci" využití paměti
- **Stránkovací soubor Windows 10** (`pagefile.sys`) – místo na disku sloužící jako rozšíření RAM

**Souvisí:** [[RAM]], [[virtuální paměť]], [[stránkování]], [[segmentace]], [[proces]]
