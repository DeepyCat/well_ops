---
aliases: [Random Access Memory, operační paměť, vnitřní paměť]
tags: [slovnik]
---

# RAM

**Random Access Memory** – hlavní (operační) paměť počítače. Rychlá, ale **volatilní** – ztrácí obsah při odpojení napájení.

---

## Podrobně

### K čemu slouží

Používá se během výpočtu – programy a jejich data se do ní nahrávají z disku a po dokončení výpočtu se přidělená paměť uvolní.

### Typy

- **DRAM** (Dynamic RAM) – nejběžnější typ hlavní paměti, potřebuje pravidelné "obnovování" obsahu
- **SDRAM** – synchronní DRAM, sladěná s hodinami sběrnice

### RAM vs. ROM

| | RAM | [[ROM]] |
| :-- | :-- | :-- |
| Zápis | ano | ne (jen čtení) |
| Obsah po vypnutí | ztracen (volatilní) | zachován (nevolatilní) |
| Použití | běžící programy a data | neměnné programy (bootstrap) |

### Proč nestačí sama

Je malá a volatilní, takže systémy potřebují i **sekundární úložiště** ([[HDD]], [[SSD]]) pro trvalé uložení dat a programů.

**Souvisí:** [[ROM]], [[cache]], [[HDD]], [[SSD]], [[EEPROM]]
