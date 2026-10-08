---
aliases: [Interprocess Communication, meziprocesová komunikace]
tags: [slovnik]
---

# IPC

**Interprocess Communication** – mechanismy, kterými spolu spolupracující [[proces|procesy]] vyměňují data. Dva základní modely: **sdílená paměť** a **message passing** (roury, sockety, RPC…).

---

## Podrobně

### Sdílená paměť vs. message passing

| | Sdílená paměť | Message passing |
| :-- | :-- | :-- |
| Rychlost | rychlejší (po zřízení jen běžný přístup do paměti) | pomalejší (systémová volání, zásah jádra) |
| Hodí se pro | velký objem dat | malý objem dat |
| V distribuovaném systému | složitější | jednodušší |
| Zodpovědnost za synchronizaci | na procesech samotných | řeší mechanismus sám |

### Konkrétní mechanismy

- [[pipe]] (roura) – jednoduché spojení mezi procesy, typicky rodič–potomek
- [[socket]] – komunikace přes síť (IP + [[port]])
- **RPC** (Remote Procedure Call) – volání procedury na vzdáleném systému
- Sdílená paměť s **producer–consumer** vzorem

**Souvisí:** [[proces]], [[pipe]], [[socket]], [[port]], [[proces synchronizace]]
