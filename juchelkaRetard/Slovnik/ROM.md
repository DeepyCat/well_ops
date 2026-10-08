---
aliases: [Read Only Memory]
tags: [slovnik]
---

# ROM

**Read Only Memory** – paměť jen pro čtení. Obsah nelze měnit, proto se do ní ukládají jen neměnné programy. **Nevolatilní** – obsah zůstává i bez napájení.

---

## Podrobně

### K čemu slouží

Protože ROM nelze změnit, ukládají se do ní jen statické programy – typicky **[[bootstrap]]** program, který se spustí hned po zapnutí počítače. Neměnnost se hodí i u herních kazet.

### ROM vs. EEPROM vs. RAM

| | ROM | [[EEPROM]] | [[RAM]] |
| :-- | :-- | :-- | :-- |
| Zápis | ne | ano, ale zřídka | ano, běžně |
| Nevolatilní | ano | ano | ne |
| Typické použití | bootstrap | tovární firmware (např. smartphony) | běžící programy |

### Firmware

Obecný termín pro program uložený v ROM nebo EEPROM, který inicializuje hardware. Viz [[firmware]].

**Souvisí:** [[RAM]], [[EEPROM]], [[bootstrap]], [[firmware]], [[BIOS]]
