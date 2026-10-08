---
aliases: [thread, vlákna]
tags: [slovnik]
---

# vlákno

**Nejmenší jednotka vykonávání kódu.** [[proces|Proces]] může mít jedno nebo víc vláken – každé vlákno je samostatná posloupnost instrukcí, ale všechna vlákna jednoho procesu sdílejí stejnou paměť (data, heap).

---

## Podrobně

### Proč vlákna existují

Jedno vlákno umí dělat jen jednu věc najednou (např. proces textového editoru s jedním vláknem nemůže zároveň přijímat psaní a kontrolovat pravopis). Víc vláken v jednom procesu umožňuje dělat víc věcí "současně" – zvlášť výhodné na **vícejádrových procesorech**, kde vlákna běží doopravdy paralelně.

### Vlákno vs. proces

| | Proces | Vlákno |
| :-- | :-- | :-- |
| Vlastní paměťový prostor | ano, izolovaný | ne, sdílí s ostatními vlákny procesu |
| Vytvoření/přepnutí | pomalejší (víc dat k uložení) | rychlejší |
| Komunikace s ostatními | přes [[proces|IPC]] (pomalejší, izolované) | přímo přes sdílenou paměť (rychlejší, ale riskantnější) |

### Vliv na PCB

U systémů podporujících vlákna se **[[PCB]]** (Process Control Block) rozšiřuje o samostatné informace pro každé vlákno (vlastní registry, vlastní zásobník), zatímco paměťový prostor (data, heap) zůstává společný pro celý proces.

**Souvisí:** [[proces]], [[PCB]], [[plánování procesů]]
