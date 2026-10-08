---
aliases: [linked list, seznam]
tags: [slovnik]
---

# spojový seznam

**Datová struktura, kde je každý prvek v samostatném bloku paměti** a nese si informaci o poloze ostatních prvků (odkaz/adresu). Na rozdíl od [[pole|pole]] nepotřebuje souvislý blok paměti.

---

## Podrobně

### Druhy

| Typ | Popis |
| :-- | :-- |
| **Lineární (jednosměrný)** | každý prvek zná jen adresu následníka; poslední má hodnotu NULL |
| **Obousměrný** | prvek zná adresu následníka i předchůdce – flexibilnější, ale mazání/přidávání je pomalejší (mění se dva odkazy místo jednoho) |
| **S hlavou** | na začátku je přidán speciální prázdný prvek (hlava), díky kterému se prázdný i neprázdný seznam obsluhují stejným kódem |
| **Cyklický** | poslední prvek ukazuje zpátky na první – umožňuje rychlé přidávání i na konec |

Tyhle vlastnosti lze kombinovat – např. **obousměrný cyklický seznam s hlavou** používá jádro Windows pro seznam běžících procesů.

### Výhody a nevýhody

- **Výhoda** – snadné a rychlé přidávání/mazání na začátku (a u cyklických i na konci), nezávisle na délce seznamu
- **Nevýhoda** – žádný náhodný přístup; k N-tému prvku je nutné projít všechny předchozí

### Kdy se hodí

Na data, která se často mění (přidávání/mazání hlavně na začátku/konci). Je stavebním kamenem pro [[zásobník]] a [[fronta|frontu]].

**Souvisí:** [[pole]], [[zásobník]], [[fronta]]
