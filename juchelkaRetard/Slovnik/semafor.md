---
aliases: [semaphore, binární semafor]
tags: [slovnik]
---

# semafor

**Synchronizační primitivum** – čítač s operacemi `wait()` a `release()`/`signal()`, kterým procesy řídí přístup do [[kritická sekce|kritické sekce]].

---

## Podrobně

### Binární semafor

Dva stavy: **0 (červená)** = zákaz vstupu, **1 (zelená)** = povolen vstup.

- `wait()` při 0 proces zablokuje a zařadí do fronty čekajících; při 1 pustí dovnitř a nastaví na 0
- `release()` probudí prvního čekajícího z fronty, nebo (je-li fronta prázdná) nastaví zpátky na 1

### Obecný semafor

Čítač s libovolnou celočíselnou hodnotou:

- **záporná** = počet čekajících procesů
- **0** = prostředek je využíván
- **kladná** = "předplaceno", tolikrát lze projít bez čekání

`wait()` sníží čítač o 1 (výsledek < 0 → zablokuje); `signal()` zvýší o 1 (výsledek ≤ 0 → odblokuje čekajícího).

### Kde se používá

Klasické úlohy – producent–konzument (dva semafory: volná/zaplněná místa ve frontě), čtenáři–písaři.

**Souvisí:** [[kritická sekce]], [[mutex]], [[proces]], [[vlákno]]
