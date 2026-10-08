---
aliases: [Central Processing Unit, procesor, mikroprocesor]
tags: [slovnik]
---

# CPU

**Central Processing Unit** – procesor, "srdce" výpočetního systému. Načítá a vykonává instrukce uložené v paměti, provádí matematické a logické operace, řídí toky dat.

---

## Podrobně

### Jak pracuje

CPU pracuje s binárními daty (nuly a jedničky). V programech se čísla obvykle zapisují šestnáctkově (hexadecimálně), např. `0x2A`.

Činnost řídí **systémové hodiny** – s každým hodinovým impulsem CPU provede operaci. Rychlost udává frekvence (např. 100 MHz = 100 milionů impulsů/s), ale výkon nelze posuzovat jen podle ní – různé procesory zvládnou za jeden impuls jiné množství práce.

### Instrukce

Instrukce vykonávané CPU jsou velmi jednoduché (např. "přečti obsah paměti na adrese X do registru Y"), ale jejich obrovské množství za sekundu dává procesorům prakticky neomezené možnosti.

### Registry

CPU má interní paměť – **[[registr|registry]]** – pro ukládání a manipulaci s daty. Velikost a počet závisí na typu procesoru (Intel 32bitové, Alpha 64bitové…).

### Vícejádrový procesor

Jeden integrovaný obvod s víc jádry – liší se od **víceprocesorového systému**, kde má každé "jádro" vlastní integrovaný obvod.

### Multiprocessing

- **SMP** (symetrický) – kterýkoli proces může běžet na kterémkoli procesoru
- **ASMP** (asymetrický) – jeden procesor vyhrazen pro procesy systému, ostatní pro uživatelské procesy

**Souvisí:** [[registr]], [[cache]], [[von Neumannova architektura]], [[SMP]]
