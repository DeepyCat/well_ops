---
tags: [slovnik]
---

# cache

**Nejrychlejší, ale nejdražší úroveň paměťové hierarchie.** Dočasně ukládá obsah hlavní paměti, aby k němu měl procesor rychlejší přístup.

---

## Podrobně

### Proč existuje

[[RAM]] je v porovnání s interní pamětí procesoru pomalá. Cache slouží jako "skladiště" – uchovává nedávno použitá data, aby na ně procesor nemusel pokaždé čekat na cestu do hlavní paměti.

### Úrovně

- **Interní cache** – malá, přímo v procesoru, velmi rychlá
- **Externí cache** – větší, na základní desce, o něco pomalejší

Některé procesory mají jednu cache pro instrukce i data, jiné dvě oddělené (např. Alpha AXP: D-Cache pro data, I-Cache pro instrukce, sdílená B-Cache navenek).

### Koherence

Obsah cache a hlavní paměti se musí shodovat (**koherence**) – pokud je nějaké slovo z hlavní paměti i v cache, obě kopie musí zůstat stejné. O koherenci se dělí hardware a operační systém.

**Souvisí:** [[RAM]], [[CPU]], [[registr]]
