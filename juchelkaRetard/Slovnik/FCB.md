---
aliases: [File Control Block]
tags: [slovnik]
---

# FCB

**File Control Block** – datová struktura obsahující metadata o jednom souboru: vlastnictví, oprávnění, umístění obsahu na disku. V UNIXu se jmenuje **[[i-node]]**.

---

## Podrobně

### K čemu slouží

Adresářová položka drží jen jméno souboru + odkaz na jeho FCB. FCB samotný nese vše ostatní – kdo je vlastník, jaká má práva, kde na disku leží data.

### Kde žije

- **Na disku** – jako součást adresářové struktury nebo samostatně (inode tabulka)
- **V paměti** – při otevření souboru se zkopíruje do systémové **open-file table**, aby se nemuselo pořád číst z disku

**Souvisí:** [[i-node]], [[06_File_System_Implementation]], [[proces]]
