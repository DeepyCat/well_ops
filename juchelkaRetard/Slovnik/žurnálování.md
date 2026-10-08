---
aliases: [journaling, žurnál]
tags: [slovnik]
---

# žurnálování

**Souborový systém si vede log (žurnál) plánovaných změn**, než je skutečně provede na disku. Chrání data před poškozením při náhlém pádu systému.

---

## Podrobně

### Proč je to potřeba

Bez žurnálu by při výpadku napájení uprostřed zápisu mohl souborový systém zůstat v nekonzistentním stavu (např. rozepsaný soubor, poškozená adresářová struktura). Po restartu by bylo nutné projít **celý disk** a hledat chyby (u velkých disků to trvá dlouho).

### Jak to funguje

1. Souborový systém zapíše do žurnálu (speciální oblast na disku), co se chystá udělat
2. Provede samotnou operaci
3. Po úspěšném dokončení odstraní záznam ze žurnálu

Když systém spadne uprostřed, po restartu se podle žurnálu buď dokončí, nebo vrátí zpět jen **rozdělané operace** – nemusí se kontrolovat celý disk.

### Kde se používá

- **NTFS** (Windows)
- **ext3, ext4, XFS, JFS, Btrfs** (Linux)
- **HFS+** (starší macOS)

**Souvisí:** [[HDD]], [[SSD]]
