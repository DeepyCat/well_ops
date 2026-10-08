---
aliases: [řadiče, controller]
tags: [slovnik]
---

# řadič

**Čip ovládající konkrétní periferní zařízení** (disk, grafickou kartu…). Funguje v podstatě jako vlastní procesor – "inteligentní pomocník" hlavního [[CPU]].

---

## Podrobně

### Jak funguje

Každý řadič má své registry, přes které ho program spuštěný na CPU ovládá – zapisuje a čte hodnoty (např. příznak chyby, řídicí parametry). CPU adresuje každý řadič individuálně.

Aby s registry řadiče mohl program manipulovat, musí existovat softwarový **ovladač zařízení** (device driver).

### Příklady sběrnic pro řadiče

- **IDE** – umožňuje individuálně ovládat každý připojený disk
- **PCI** – umožňuje ovládat každé připojené zařízení zvlášť (např. grafickou kartu)
- **SCSI** – k jednomu řadiči lze připojit víc zařízení (7 a víc)

### Přenos velkých dat

Když řadič potřebuje přenést větší objem dat přímo do/z systémové paměti (např. zápis na disk), používá se **[[DMA]]**.

**Souvisí:** [[DMA]], [[CPU]], [[přerušení]]
