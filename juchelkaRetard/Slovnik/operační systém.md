---
aliases: [OS]
tags: [slovnik]
---

# operační systém

**Správce fyzických prostředků výpočetního systému**, který pomocí logických prostředků zpracovává úlohy zadané uživatelem. Softwarová platforma systému.

---

## Podrobně

### Proč existuje

Bez OS by musel každý program přímo ovládat hardware (procesor, paměť, disky, periferie) – to je složité, chybové a nepřenositelné mezi počítači. OS tuto práci abstrahuje a nabízí programům jednotné rozhraní.

### Hlavní funkce (viz [[Funkce OS]])

- Správa procesů, paměti, periferií, souborů, uživatelů
- Uživatelské rozhraní ([[GUI]] / [[CLI]])
- Aplikační rozhraní ([[API]])

### Dva režimy činnosti

- **Režim jádra** – neomezený přístup k hardwaru, běží zde [[kernel|jádro]] OS
- **Uživatelský režim** – omezený přístup, běží zde běžné aplikace; o přístup k hardwaru žádají přes [[systémové volání|systémová volání]]

### Rozdělení OS

Podle počtu procesorů, počtu uživatelů, počtu úloh, role v síti (desktopové/serverové) a podle nároků na čas (běžné / realtimové / cloudové) – viz [[Rozdeleni_OS]].

**Souvisí:** [[kernel]], [[CPU]], [[proces]], [[BIOS]], [[GUI]], [[CLI]], [[API]]
