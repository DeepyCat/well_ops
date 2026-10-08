---
aliases: [Mutual Exclusion]
tags: [slovnik]
---

# mutex

**Mutual Exclusion** – synchronizační primitivum, které zabrání dvěma nebo víc procesům současně vykonávat kritický kód nad stejným sdíleným prostředkem.

---

## Podrobně

### Dva stavy

- **Volný** – nikdo ho nedrží
- **Vlastněný** – drží ho konkrétní proces ([[PID]]) + počet uzamknutí

### Získání (lock)

- mutex je volný → proces se stává vlastníkem, počet uzamknutí = 1
- vlastní ho už tenhle proces → počet +1
- vlastní ho jiný proces → čekání

### Uvolnění (unlock)

- vlastní aktuální proces → počet −1; při 0 se uvolní čekajícím procesům
- jinak nedefinovaný stav

### Rizika

Špatné použití vede ke zpomalení (procesy na sebe čekají) nebo k **[[uváznutí]] (deadlocku)** – řešením bývá ukončení aspoň jednoho procesu.

### Mutex vs. semafor

[[semafor|Semafor]] může povolit víc procesů najednou (obecný semafor > 1), mutex vždy jen **jeden vlastník**.

**Souvisí:** [[kritická sekce]], [[semafor]], [[uváznutí]], [[proces]]
