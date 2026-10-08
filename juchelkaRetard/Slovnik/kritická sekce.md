---
aliases: [critical section, kritický kód]
tags: [slovnik]
---

# kritická sekce

**Nejmenší část kódu, kde proces přistupuje ke sdílenému prostředku**, ke kterému nesmí přistupovat víc procesů/vláken zároveň.

---

## Podrobně

### Tři podmínky správného řízení přístupu

- **Výhradní přístup** – uvnitř smí být nejvýš jeden proces
- **Rozhodování o vstupu** – rozhodují jen procesy, které o vstup usilují
- **Omezené čekání** – rozhodnutí se nesmí odkládat donekonečna (jinak hrozí [[starvation]])

### Jak se chrání

Vstup do kritické sekce se řídí **synchronizačními primitivy** – [[semafor]], [[mutex]], zámek (instrukce TSL). Procesy čekající na vstup mohou použít **aktivní čekání** – opakovaně zkouší vstoupit.

**Souvisí:** [[semafor]], [[mutex]], [[proces]], [[vlákno]], [[uváznutí]]
