---
aliases: [context switch, přepínání kontextu]
tags: [slovnik]
---

# přepnutí kontextu

**Context switch** – přepnutí CPU z jednoho [[proces|procesu]] na jiný. Uloží se stav starého procesu (do [[PCB]]) a načte se uložený stav nového.

---

## Podrobně

### Kdy k tomu dojde

Při [[přerušení]] – ať už je to vyžádání V/V operace, vypršení časového kvanta pro plánování, nebo jiná událost.

### Co se přesně děje

1. **Uložení stavu** – hodnoty [[registr|CPU registrů]], stav procesu, info o správě paměti se zapíšou do PCB starého procesu
2. **Načtení stavu** – ze PCB nového procesu se obnoví jeho registry a kontext
3. Proces pokračuje přesně tam, kde skončil

### Cena přepínání

Context switch je **čistá režie** ("pure overhead") – po dobu přepínání systém nedělá žádnou užitečnou práci. Typicky trvá jen pár milisekund, ale záleží na:

- rychlosti paměti a počtu registrů k překopírování
- hardwarové podpoře (některé procesory mají víc sad registrů, stačí přepnout ukazatel)
- složitosti [[PCB]] a operačního systému

Čím častěji plánovač přepíná, tím větší podíl výkonu CPU se "prožere" na samotné přepínání místo užitečné práce.

**Souvisí:** [[PCB]], [[proces]], [[přerušení]], [[registr]]
