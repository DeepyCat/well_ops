---
aliases: [stack, LIFO]
tags: [slovnik]
---

# zásobník

**LIFO datová struktura** (Last In First Out – poslední dovnitř, první ven). Podporuje jen tři operace: vložení, odebrání posledního prvku a test prázdnosti.

---

## Podrobně

### Operace

| Operace | Popis |
| :-- | :-- |
| **push** | vloží nový prvek navrch zásobníku |
| **pop** | odebere a vrátí naposledy vložený prvek |
| **empty** | zjistí, jestli je zásobník prázdný |

Nad zásobníkem lze provádět míň operací než nad [[pole|polem]] nebo [[spojový seznam|spojovým seznamem]] – jde vlastně o podmnožinu jejich operací, proto se dá implementovat oběma způsoby.

### Implementace polem

Pomocná proměnná `PosledniPlatny` drží index posledního prvku (na začátku −1). `push` ji zvýší o 1 a zapíše prvek, `pop` prvek vrátí a proměnnou sníží o 1. Rychlé, ale hrozí přeplnění pole (nutnost realokace a překopírování).

### Implementace spojovým seznamem

`push`/`pop` pracují se začátkem (u necyklických) nebo koncem (u cyklických obousměrných) seznamu. Žádné riziko přeplnění, ale práce s adresami je o něco pomalejší než inkrementace/dekrementace proměnné.

### Kde se používá

Ukazatel zásobníku (SP) v [[registr|registru]] procesoru, volání funkcí a jejich lokální proměnné, historie "zpět" v prohlížeči.

**Souvisí:** [[fronta]], [[pole]], [[spojový seznam]], [[registr]]
