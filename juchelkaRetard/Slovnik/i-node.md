---
aliases: [inode]
tags: [slovnik]
---

# i-node

**Index node** – UNIXová obdoba [[FCB]]. Struktura s metadaty a ukazateli na datové bloky konkrétního souboru.

---

## Podrobně

### Kombinované schéma indexové alokace

Typický UNIXový i-node drží asi 15 ukazatelů:

- **12 přímých (direct blocks)** – rovnou adresy datových bloků; malé soubory (do ~48 KB při 4KB blocích) žádný samostatný index blok nepotřebují
- **1 jednoduchý nepřímý (single indirect)** – ukazuje na blok plný dalších ukazatelů na data
- **1 dvojitý nepřímý (double indirect)** – ukazuje na blok ukazatelů na single-indirect bloky
- **1 trojitý nepřímý (triple indirect)** – další úroveň, pro extrémně velké soubory

### Reference count

I-node si drží i **počet odkazů (hardlinků)** na sebe – soubor se fyzicky smaže, až tenhle počet klesne na 0 (viz [[05_Directory_Structures]]).

**Souvisí:** [[FCB]], [[06_File_System_Implementation]]
