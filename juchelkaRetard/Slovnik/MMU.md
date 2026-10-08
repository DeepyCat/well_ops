---
aliases: [Memory Management Unit]
tags: [slovnik]
---

# MMU

**Memory Management Unit** – hardwarová jednotka, která za běhu překládá **logické (virtuální) adresy** na **fyzické adresy** v [[RAM]]. Pro proces je překlad transparentní.

---

## Podrobně

### Proč je potřeba

Proces pracuje jen s **logickými adresami** (svým vlastním, izolovaným adresním prostorem). Skutečná data ale leží na konkrétním místě ve fyzické paměti. MMU tenhle překlad dělá při každém přístupu do paměti – proces o tom neví.

### Jak překládá

- **Souvislé přidělování** – logická adresa + relokační registr = fyzická adresa (viz [[02_Hlavni_pamet]])
- **[[segmentace|Segmentace]]** – segmentová tabulka (segment number → base + limit)
- **[[stránkování|Stránkování]]** – tabulka stránek (číslo stránky → číslo rámce)

### Kde sedí

Fyzicky je součástí procesoru (nebo je s ním úzce integrovaná), protože musí překládat **každý** přístup do paměti bez znatelného zpomalení.

**Souvisí:** [[RAM]], [[CPU]], [[segmentace]], [[stránkování]], [[virtuální paměť]]
