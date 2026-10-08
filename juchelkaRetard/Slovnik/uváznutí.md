---
aliases: [deadlock, vzájemné čekání]
tags: [slovnik]
---

# uváznutí

**Deadlock** – procesy se navzájem zablokují křížovým čekáním: dokončení první akce vyžaduje dokončení druhé, a naopak. Bez zásahu zvenčí nikdy neskončí.

---

## Podrobně

### Typické příklady

- Proces A drží tiskárnu a čeká na pásku; proces B drží pásku a čeká na tiskárnu – oba čekají navěky
- Proces A zamkl databázovou tabulku X a čeká na uvolnění Y; proces B zamkl Y a čeká na X

### Jak se řeší

- **Prevence v návrhu** – např. u [[proces synchronizace|hodujících filozofů]] hierarchie zdrojů nebo omezení počtu současných účastníků
- **Zásah uživatele/systému** – násilné ukončení jednoho z procesů, u databází zrušení transakce (rollback)

Většina běžných operačních systémů násilné odebrání prostředků neumožňuje – řešení uváznutí je proto často jen ruční.

### Uváznutí vs. livelock vs. starvation

| | Deadlock | Livelock | [[starvation|Starvation]] |
| :-- | :-- | :-- | :-- |
| Procesy | pasivně čekají | aktivně zkoušejí, ale marně | čekají na prostředek, který nikdy nedostanou |
| Pohyb | žádný | ano, ale bezvýsledný | pomalý pokrok jiných, tenhle stojí |

**Souvisí:** [[kritická sekce]], [[mutex]], [[semafor]], [[starvation]], [[proces]]
