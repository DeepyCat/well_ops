---
aliases: [Redundant Array of Independent Disks]
tags: [slovnik]
---

# RAID

**Redundant Array of Independent Disks** – spojení víc fyzických disků do jednoho logického celku kvůli výkonu, redundanci (odolnosti proti výpadku), nebo obojímu.

---

## Podrobně

### Úrovně

| Úroveň | Princip | Odolnost proti výpadku | Využitelná kapacita |
| :-- | :-- | :-- | :-- |
| **RAID 0** | rozložení dat (striping) přes všechny disky | žádná – výpadek 1 disku = ztráta všeho | 100 % (n disků) |
| **RAID 1** | zrcadlení (mirroring) – stejná data na všech discích | ano, přežije výpadek n−1 disků | 50 % (u 2 disků) |
| **RAID 5** | striping + distribuovaná parita na všech discích | přežije výpadek 1 disku | (n−1)/n |
| **RAID 6** | jako RAID 5, ale dvojitá parita | přežije výpadek 2 disků | (n−2)/n |
| **RAID 01 (0+1)** | zrcadlení dvou RAID 0 polí | omezená | 50 % |
| **RAID 10 (1+0)** | striping přes víc RAID 1 párů | vyšší než RAID 01 | 50 % |

### Proč se používá

- **RAID 0** – čistě výkon (rychlejší čtení/zápis), žádná ochrana dat
- **RAID 1, 5, 6** – ochrana proti výpadku disku, systém běží dál i po poruše
- **RAID 10** – kombinace rychlosti i odolnosti, ale za cenu poloviny kapacity

### Parita

U RAID 5/6 se počítá kontrolní součet (parita) z dat na ostatních discích – při výpadku jednoho disku lze jeho obsah **dopočítat** z parity a zbylých dat.

**Souvisí:** [[HDD]], [[SSD]], [[žurnálování]]
