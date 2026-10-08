---
aliases: [Process Control Block, Task Control Block]
tags: [slovnik]
---

# PCB

**Process Control Block** – datová struktura, kterou operační systém reprezentuje každý [[proces]]. Obsahuje vše potřebné k tomu, aby šel proces kdykoliv pozastavit a později přesně obnovit.

---

## Podrobně

### Co obsahuje

| Položka | K čemu |
| :-- | :-- |
| Stav procesu | new, ready, running, waiting, terminated |
| Program counter | adresa další instrukce |
| [[registr|CPU registry]] | akumulátory, ukazatel zásobníku, příznaky |
| Info pro plánování | priorita, ukazatele na plánovací fronty |
| Info o paměti | bázové/limitní registry, stránkovací tabulky |
| Účetní informace | využitý čas CPU, limity |
| Info o V/V | otevřené soubory, přidělená zařízení |

### K čemu slouží

Při **přepnutí kontextu (context switch)** – přechodu CPU z jednoho procesu na druhý – se PCB starého procesu uloží a PCB nového se načte. Díky tomu může proces později pokračovat přesně tam, kde skončil, jako by k přerušení vůbec nedošlo.

U systémů s podporou vláken se PCB rozšiřuje o samostatné informace pro **každé vlákno**.

**Souvisí:** [[proces]], [[registr]], [[přerušení]], [[plánování procesů]]
