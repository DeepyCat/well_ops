---
tags: [slovnik]
---

# swapping

**Dočasné odsunutí procesu z hlavní paměti na disk** (a jeho pozdější návrat), aby se uvolnilo místo pro jiné procesy. Provádí ho tzv. medium-term scheduler.

---

## Podrobně

### Proč se to dělá

- Zlepšení směsi procesů v paměti (viz [[plánování procesů]])
- Když dojde [[RAM|paměť]] a je potřeba místo uvolnit

### Jak to funguje

1. Proces se **swapne ven (swap out)** – jeho obsah paměti se uloží na disk, proces dočasně "zmizí" z boje o CPU
2. Později se **swapne zpátky (swap in)** – nahraje se z disku do paměti a pokračuje přesně tam, kde skončil

### Swapping vs. virtuální paměť

Swapping přesouvá **celý proces** najednou. Moderní [[virtuální paměť]] pracuje jemněji – odkládá jen jednotlivé **stránky** paměti, které se zrovna nepoužívají, ne celý proces.

**Souvisí:** [[plánování procesů]], [[virtuální paměť]], [[RAM]], [[proces]]
