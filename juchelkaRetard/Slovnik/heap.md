---
tags: [slovnik]
---

# heap

**Paměť dynamicky alokovaná za běhu [[proces|procesu]]** – na rozdíl od zásobníku roste nepravidelně a spravuje ji přímo program (alokace/uvolnění).

---

## Podrobně

### Heap vs. zásobník

| | Heap | [[zásobník]] |
| :-- | :-- | :-- |
| Alokace | ručně programem (`malloc`, `new`…) | automaticky (volání funkcí) |
| Životnost dat | dokud je program neuvolní | jen po dobu běhu funkce |
| Rychlost | pomalejší | rychlejší |
| Řízení | manuální nebo garbage collector | automatické (LIFO) |

### Kde se používá

Objekty a datové struktury s neznámou velikostí předem, nebo které musí přežít návrat z funkce (na rozdíl od lokálních proměnných na zásobníku).

### Riziko

Neuvolněná paměť na heapu = **memory leak (únik paměti)** – program postupně spotřebovává čím dál víc paměti. Některé jazyky (Java, Python, C#) to řeší automatickým **garbage collectorem**.

**Souvisí:** [[proces]], [[zásobník]], [[virtuální paměť]]
