---
aliases: [system call, monitor call]
tags: [slovnik]
---

# systémové volání

**Způsob, jakým program v uživatelském režimu žádá jádro o službu** (např. otevření souboru, alokaci paměti). Technicky jde o softwarové [[přerušení]].

---

## Podrobně

### Proč je potřeba

Aplikace v **uživatelském režimu** nemá přímý přístup k hardwaru ani k citlivým strukturám jádra – z bezpečnostních a stabilitních důvodů. Když potřebuje něco, co umí jen [[kernel]] (číst soubor, otevřít síťové spojení, alokovat paměť), musí o to požádat systémovým voláním.

### Jak to probíhá

1. Program zavolá speciální instrukci (systémové volání)
2. CPU přepne z uživatelského do **režimu jádra**
3. Jádro požadovanou operaci provede
4. Řízení se vrátí zpátky programu, přepne se do uživatelského režimu

### Příklad

Otevření souboru, čtení ze sítě, vytvoření nového [[proces|procesu]] – to všechno jsou typická systémová volání.

**Souvisí:** [[přerušení]], [[kernel]], [[operační systém]]
