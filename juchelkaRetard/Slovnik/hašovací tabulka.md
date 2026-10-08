---
aliases: [hash table, haš tabulka, hashovací tabulka]
tags: [slovnik]
---

# hašovací tabulka

**Datová struktura umožňující vkládat, vyhledávat a mazat prvky v konstantním čase** – nezávisle na počtu prvků v tabulce. Prvky se vyhledávají podle **klíče**.

---

## Podrobně

### Princip

Prvky se ukládají do [[pole|pole]] (**sloty**). **Hašovací funkce** převede klíč na index slotu, kam se prvek uloží / kde se hledá. Transformace klíče na index nezávisí na velikosti tabulky, proto jsou operace v konstantním čase.

### Vlastnosti dobré hašovací funkce

- Rychlá transformace klíče na index
- Pro stejný klíč vždy stejný index
- Rovnoměrné rozdělení klíčů na indexy (aby žádný slot nebyl přetížený)

### Kolize

Když funkce namapuje víc různých klíčů na stejný slot, jde o **kolizi** – nevyhnutelná, protože možných hodnot klíče je obvykle mnohem víc než slotů.

| Řešení | Princip |
| :-- | :-- |
| **Řetězení prvků** | každý slot je [[spojový seznam]], do kterého se ukládají všechny prvky se stejným hašem (používá např. jádro Windows) |
| **Otevřené adresování** | při kolizi se hledá další volné místo (posun o pevný krok, druhá hašovací funkce…); kapacita omezená velikostí pole |

### Nejhorší případ

Když hašovací funkce vrací pořád stejný index, tabulka degraduje na obyčejný [[spojový seznam]] – vyhledávání přestává být konstantní a stává se lineárním.

**Souvisí:** [[pole]], [[spojový seznam]], [[BST]]
