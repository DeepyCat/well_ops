---
aliases: [registry, Program Counter, Stack Pointer, Processor Status, PC, SP, PS]
tags: [slovnik]
---

# registr

**Interní paměť procesoru** pro ukládání a manipulaci s daty. Rychlejší než [[cache]] i [[RAM]] – je přímo součástí [[CPU]].

---

## Podrobně

### Vlastnosti

Velikost, počet a typ registrů závisí na typu procesoru – např. Intel má 32bitové, Alpha AXP 64bitové registry. Procesory obvykle mají víc univerzálních registrů a méně speciálních.

### Speciální (vyhrazené) registry

| Registr | Zkratka | Funkce |
| :-- | :-- | :-- |
| **Ukazatel instrukcí** | PC (Program Counter) | adresa instrukce, která se provede příště; po každém načtení instrukce se automaticky zvýší |
| **Ukazatel zásobníku** | SP (Stack Pointer) | ukazuje na vrchol [[zásobník|zásobníku]] v paměti (LIFO – poslední dovnitř, první ven) |
| **Stavový registr** | PS (Processor Status) | uchovává stav procesoru – např. výsledky porovnání, aktuální režim (jádro/uživatel) |

### Zásobník v registru SP

Procesory mívají instrukce pro uložení hodnoty na zásobník a její pozdější načtení. U některých procesorů roste zásobník směrem nahoru k vrcholu paměti, u jiných dolů; některé (např. ARM) podporují oba směry.

**Souvisí:** [[CPU]], [[zásobník]], [[kernel]]
