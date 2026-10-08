---
tags: [slovnik]
---

# proces

**Instance kroku úlohy ve vnitřní paměti** – běžící program a jeho data. "Kopie" programu ve vnitřní paměti výpočetního systému, vytvořená za použití konkrétních vstupních dat.

---

## Podrobně

### Odkud proces vzniká

Zakázka → úloha (JOB) → krok úlohy → **proces**. Úloha může být posloupnost víc programů, krok úlohy obvykle představuje spuštění jednoho konkrétního programu; proces je tenhle program skutečně běžící v paměti.

### Proces vs. program

Program je jen soubor na disku (statický). Proces je program **v běhu** – má přidělenou paměť, aktuální stav registrů, otevřené soubory atd. Ze stejného programu může vzniknout víc procesů zároveň (více instancí).

### Adresový a paměťový prostor

- **Paměťový prostor procesu** – množství paměti přidělené procesu a jeho datům
- **Adresový prostor procesu** – konkrétní vyhrazená oblast vnitřní paměti s vlastní adresní metrikou (každý bajt je očíslován)

### Co s procesy dělá OS

Operační systém eviduje spuštěné procesy, plánuje jim přidělování [[CPU|procesoru]], přiděluje a odebírá jim zdroje, sleduje jejich stav a zajišťuje komunikaci mezi nimi – viz [[Funkce OS]].

**Podrobnější rozpracování** procesů (stavy, plánování, vlákna, synchronizace) je v kapitole **Správa procesů**.

**Souvisí:** [[operační systém]], [[CPU]], [[kernel]], [[virtuální paměť]]
