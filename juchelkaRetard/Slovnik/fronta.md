---
aliases: [queue, FIFO]
tags: [slovnik]
---

# fronta

**FIFO datová struktura** (First In First Out – první dovnitř, první ven). Prvky se odebírají ve stejném pořadí, v jakém byly vloženy.

---

## Podrobně

### Operace

| Operace | Popis |
| :-- | :-- |
| **insert** | vloží nový prvek na konec fronty |
| **removefirst** | odebere a vrátí nejstarší prvek (vložený nejdřív) |
| **empty** | zjistí, jestli je fronta prázdná |

### Implementace polem

Dvě pomocné proměnné (`NejstarsiPrvek`, `PrvniVolny`) udávají indexy, obě se posouvají **modulo N** (pole velikosti N), takže "obtáčí" pole dokola. Když se proměnné srovnají, hrozí buď prázdná fronta, nebo přeplnění – je nutné to rozlišit.

### Implementace spojovým seznamem

Nejlépe se hodí **obousměrný cyklický spojový seznam** – `insert` přidává na konec, `removefirst` odebírá začátek, obě operace v konstantním čase bez rizika přeplnění (na rozdíl od pole).

### Kde se používá

Fronty procesů čekajících na [[CPU]] (viz [[plánování procesů]]), tiskové fronty, zprávy mezi procesy.

**Souvisí:** [[zásobník]], [[pole]], [[spojový seznam]]
