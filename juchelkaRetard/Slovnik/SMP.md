---
aliases: [Symetrický MultiProcesing, Symmetric Multiprocessing]
tags: [slovnik]
---

# SMP

**Symetrický multiprocessing** – kterýkoli proces může běžet na kterémkoli procesoru v systému. Prakticky všechny moderní víceprocesorové systémy takto fungují.

---

## Podrobně

### SMP vs. ASMP

| | SMP | ASMP |
| :-- | :-- | :-- |
| Rozdělení práce | libovolný proces na libovolném procesoru | jeden procesor jen pro systém, ostatní pro uživatelské procesy |
| Použití | naprostá většina dnešních OS | starší/specializované systémy |

### Vícejádrový počítač ≠ víceprocesorový systém

Grafický procesor na grafické kartě není považován za druhý procesor v SMP smyslu, protože nezpracovává obecnou sadu instrukcí, jen svou specifickou. Podobně vícejádrový CPU je jen do určité míry srovnatelný s víceprocesorovým systémem – jádra mohou sdílet část prostředků.

**Souvisí:** [[CPU]], [[operační systém]]
