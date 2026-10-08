---
aliases: [zombie process, orphan process, osiřelý proces]
tags: [slovnik]
---

# zombie proces

**Proces, který už skončil, ale jeho rodič ještě nezavolal `wait()`.** Záznam o něm (včetně exit statusu) zůstává v tabulce procesů, dokud si ho rodič nevyzvedne.

---

## Podrobně

### Proč vzniká

Když [[proces]] skončí, OS uvolní jeho zdroje (paměť, soubory), ale záznam v tabulce procesů musí zůstat – obsahuje totiž **exit status**, který si rodič může vyzvednout přes `wait()`. Do té doby je proces "zombie": mrtvý, ale ne úplně pryč.

Všechny procesy projdou tímto stavem – normálně jen na krátkou chvíli, než rodič `wait()` zavolá.

### Orphan proces (osiřelý proces)

Opačná situace – **rodič** skončí dřív, než stihl zavolat `wait()` na svého potomka. Linux/UNIX to řeší tak, že se novým rodičem osiřelého procesu stane **`init`** (PID 1), který periodicky volá `wait()` a uklízí po osiřelých procesech.

### Rozdíl

| | Zombie | Orphan |
| :-- | :-- | :-- |
| Kdo "chybí" | proces sám skončil | jeho rodič skončil |
| Kdo čeká na koho | rodič nezavolal wait() na mrtvého potomka | potomek běží dál bez rodiče |

**Souvisí:** [[proces]], [[PID]], [[fork-exec]]
